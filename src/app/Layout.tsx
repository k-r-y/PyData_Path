import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Flame,
  CheckCircle2,
  Circle,
  Layers,
  Eye,
  Table2,
  Database,
  LineChart,
  Activity,
  FolderKanban,
  FileText,
  BookA,
  Settings,
  Search,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { ProgressRing } from '../components/ProgressRing';
import { CommandPalette } from '../components/CommandPalette';
import { getAllModules, getLessonsForModule } from '../content/loader';
import { db, type ProgressRecord } from '../db/database';
import type { TrackId } from '../types/content';

const TRACK_LABELS: Record<TrackId, string> = {
  'a-foundations': 'Track A // Foundations',
  'b-advanced': 'Track B // Advanced',
  'c-analytics': 'Track C // Analytics',
};

function BrandMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="text-neutral-950 dark:text-white shrink-0"
    >
      <circle cx="2.5" cy="2.5" r="1.4" />
      <circle cx="8" cy="2.5" r="1.4" opacity="0.35" />
      <circle cx="13.5" cy="2.5" r="1.4" />
      <circle cx="2.5" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="13.5" cy="8" r="1.4" opacity="0.35" />
      <circle cx="2.5" cy="13.5" r="1.4" />
      <circle cx="8" cy="13.5" r="1.4" />
      <circle cx="13.5" cy="13.5" r="1.4" />
    </svg>
  );
}

export function Layout() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth >= 1024 && window.location.pathname !== '/'
      : false
  );
  const [cmdOpen, setCmdOpen] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, ProgressRecord>>(new Map());
  const [streakDays, setStreakDays] = useState(0);

  const modules = useMemo(() => getAllModules(), []);

  // Track which modules are expanded in the sidebar; default to first module + active lesson's module
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (modules[0]) initial[modules[0].id] = true;
    return initial;
  });

  const loadProgress = () => {
    db.progress
      .toArray()
      .then((rows) => {
        const map = new Map<string, ProgressRecord>();
        for (const row of rows) map.set(row.lessonId, row);
        setProgressMap(map);
      })
      .catch(() => {});

    db.streaks
      .toArray()
      .then((rows) => {
        setStreakDays(rows.filter((r) => r.exercisesCompleted > 0 || r.minutes > 0).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProgress();
    const handler = () => loadProgress();
    window.addEventListener('pdp-progress-updated', handler);
    return () => window.removeEventListener('pdp-progress-updated', handler);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Auto-expand the module containing the active lesson & close mobile drawer on navigation
  useEffect(() => {
    const match = location.pathname.match(/^\/lesson\/([^/]+)/);
    if (match) {
      const activeLessonId = match[1];
      for (const mod of modules) {
        const lessons = getLessonsForModule(mod.id);
        if (lessons.some((l) => l.frontmatter.id === activeLessonId)) {
          setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
          break;
        }
      }
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, modules]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const tracks: TrackId[] = ['a-foundations', 'b-advanced', 'c-analytics'];

  const allLessons = modules.flatMap((m) => getLessonsForModule(m.id));
  const nextLesson =
    allLessons.find((l) => progressMap.get(l.frontmatter.id)?.status !== 'completed') ??
    allLessons[0];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-neutral-950 dark:text-neutral-50">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      {/* Architectural Top Bar */}
      <header className="h-14 shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
            aria-expanded={sidebarOpen}
            className="tactile inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.16em] uppercase text-neutral-950 dark:text-white rounded px-1 py-1"
          >
            <BrandMark />
            <span>PYDATA</span>
          </Link>
        </div>

        {/* Center Editorial Navigation */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Curriculum', end: true },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/dataframe-lab', label: 'DataFrame Lab' },
            { to: '/sql-lab', label: 'SQL' },
            { to: '/sources', label: 'Sources' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800/80'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Utility & Action Cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            aria-label="Open command palette"
            className="tactile hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400">
              ⌘K
            </kbd>
          </button>

          <span
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] font-mono text-[11px] tabular-nums text-neutral-700 dark:text-neutral-300"
            title="Active learning days"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            {streakDays}d
          </span>

          <NavLink
            to="/settings"
            aria-label="Settings and Backup"
            className={({ isActive }) =>
              `tactile inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`
            }
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            className="tactile inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {nextLesson && (
            <Link
              to={`/lesson/${nextLesson.frontmatter.id}`}
              className="tactile group hidden sm:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <span>Continue</span>
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area with Sticky Collapsible Sidebar */}
      <div className="flex-1 flex min-h-0 relative">
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 top-14 z-20 bg-black/25 backdrop-blur-[2px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside
              aria-label="Curriculum navigation"
              className="fixed lg:sticky top-14 left-0 z-30 lg:z-20 w-72 shrink-0 h-[calc(100vh-3.5rem)] border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md lg:backdrop-blur-none overflow-y-auto p-3.5 space-y-5"
            >
              {tracks.map((trackId) => {
                const trackModules = modules.filter((m) => m.track === trackId);
                return (
                  <div key={trackId}>
                    <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500 mb-2 px-2">
                      {TRACK_LABELS[trackId]}
                    </h2>

                    {trackModules.length === 0 ? (
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 px-2 font-mono">
                        Coming soon
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {trackModules.map((mod) => {
                          const lessons = getLessonsForModule(mod.id);
                          const completedCount = lessons.filter(
                            (l) => progressMap.get(l.frontmatter.id)?.status === 'completed'
                          ).length;
                          const isExpanded = Boolean(expandedModules[mod.id]);

                          return (
                            <div key={mod.id} className="space-y-1">
                              <h3>
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  onClick={() => toggleModule(mod.id)}
                                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
                                >
                                  <span className="flex items-center gap-1.5 min-w-0">
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 shrink-0 text-neutral-400 transition-transform duration-150 ${
                                        isExpanded ? 'rotate-90 text-neutral-900 dark:text-white' : ''
                                      }`}
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">{mod.title}</span>
                                  </span>
                                  <span className="flex items-center gap-1.5 shrink-0">
                                    <span className="font-mono text-[10px] tabular-nums text-neutral-400">
                                      {completedCount}/{lessons.length}
                                    </span>
                                    <ProgressRing
                                      completed={completedCount}
                                      total={lessons.length}
                                      size={16}
                                    />
                                  </span>
                                </button>
                              </h3>

                              {isExpanded && (
                                <ul className="space-y-0.5 pl-3 border-l border-neutral-200 dark:border-neutral-800 ml-3.5">
                                  {lessons.map((lesson) => {
                                    const lid = lesson.frontmatter.id;
                                    const status = progressMap.get(lid)?.status ?? 'not_started';
                                    return (
                                      <li key={lid}>
                                        <NavLink
                                          to={`/lesson/${lid}`}
                                          className={({ isActive }) =>
                                            `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                              isActive
                                                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium'
                                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 hover:text-neutral-950 dark:hover:text-neutral-100'
                                            }`
                                          }
                                        >
                                          {status === 'completed' ? (
                                            <CheckCircle2
                                              className="w-3.5 h-3.5 shrink-0 text-emerald-500"
                                              aria-hidden="true"
                                            />
                                          ) : (
                                            <Circle
                                              className="w-3.5 h-3.5 shrink-0 opacity-40"
                                              aria-hidden="true"
                                            />
                                          )}
                                          <span className="truncate">{lesson.frontmatter.title}</span>
                                        </NavLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Practice Labs & Reference Tools */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500 mb-2 px-2">
                  Labs // Workspace
                </h2>
                {[
                  { to: '/visualizer', label: 'Step Visualizer', Icon: Eye },
                  { to: '/flashcards', label: 'Flashcards (SM-2)', Icon: Layers },
                  { to: '/dataframe-lab', label: 'DataFrame Lab', Icon: Table2 },
                  { to: '/sql-lab', label: 'SQL Playground', Icon: Database },
                  { to: '/chart-lab', label: 'Chart Lab', Icon: LineChart },
                  { to: '/simulators', label: 'Stats Simulators', Icon: Activity },
                  { to: '/projects', label: 'EDA & Capstone', Icon: FolderKanban },
                  { to: '/cheatsheets', label: 'Cheat Sheets', Icon: FileText },
                  { to: '/glossary', label: 'Glossary', Icon: BookA },
                ].map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 hover:text-neutral-950 dark:hover:text-neutral-100'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </aside>
          </>
        )}

        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
