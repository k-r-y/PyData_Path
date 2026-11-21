import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Terminal,
  BarChart3,
  Eye,
  Layers,
  Table2,
  Database,
  LineChart,
  Activity,
  FolderKanban,
  FileText,
  BookA,
  BookMarked,
  Settings,
  Sun,
  Moon,
  CornerDownLeft,
  Code2,
} from 'lucide-react';
import { getAllModules, getLessonsForModule } from '../content/loader';
import { getAllProblemMeta } from '../content/problemLoader';
import { useTheme } from './ThemeProvider';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  keywords?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];
    const modules = getAllModules();

    for (const mod of modules) {
      const lessons = getLessonsForModule(mod.id);
      for (const lesson of lessons) {
        list.push({
          id: `lesson-${lesson.frontmatter.id}`,
          label: lesson.frontmatter.title,
          category: mod.title,
          keywords: `${mod.id} ${lesson.frontmatter.id}`,
          icon: <BookOpen className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />,
          action: () => navigate(`/lesson/${lesson.frontmatter.id}`),
        });
      }
    }

    for (const prob of getAllProblemMeta()) {
      list.push({
        id: `problem-${prob.id}`,
        label: `${prob.id}: ${prob.title}`,
        category: 'Problem Solver',
        keywords: `${prob.slug} ${prob.difficulty} ${prob.tags.join(' ')}`,
        icon: <Code2 className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />,
        action: () => navigate(`/problems/${prob.slug}`),
      });
    }

    const pages = [
      { to: '/', label: 'Home Workspace', Icon: Terminal },
      { to: '/problems', label: 'Problem Solver List', Icon: Code2 },
      { to: '/dashboard', label: 'Learning Dashboard', Icon: BarChart3 },
      { to: '/visualizer', label: 'Step Visualizer', Icon: Eye },
      { to: '/flashcards', label: 'Flashcards (SM-2)', Icon: Layers },
      { to: '/dataframe-lab', label: 'DataFrame Lab', Icon: Table2 },
      { to: '/sql-lab', label: 'SQL Playground', Icon: Database },
      { to: '/chart-lab', label: 'Chart Lab', Icon: LineChart },
      { to: '/simulators', label: 'Stats Simulators', Icon: Activity },
      { to: '/projects', label: 'EDA & Capstone Projects', Icon: FolderKanban },
      { to: '/cheatsheets', label: 'Cheat Sheets', Icon: FileText },
      { to: '/glossary', label: 'Glossary', Icon: BookA },
      { to: '/sources', label: 'Cited Sources', Icon: BookMarked },
      { to: '/settings', label: 'Settings & Backup', Icon: Settings },
    ];

    for (const p of pages) {
      const Icon = p.Icon;
      list.push({
        id: `page-${p.to}`,
        label: p.label,
        category: 'Workspace',
        icon: <Icon className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />,
        action: () => navigate(p.to),
      });
    }

    list.push({
      id: 'action-theme',
      label: `Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preference',
      keywords: 'theme dark light mode appearance',
      icon:
        resolvedTheme === 'dark' ? (
          <Sun className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
        ),
      action: () => toggleTheme(),
    });

    return list;
  }, [navigate, resolvedTheme, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 14);
    return items
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.toLowerCase().includes(q))
      )
      .slice(0, 14);
  }, [items, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery('');
      setSelectedIdx(0);
      dialog.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const runItem = (item: CommandItem) => {
    item.action();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="cmd-dialog m-auto mt-[12vh] w-[min(92vw,36rem)] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-950 dark:text-neutral-50 shadow-2xl p-0 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIdx((i) =>
                filtered.length ? (i - 1 + filtered.length) % filtered.length : 0
              );
            } else if (e.key === 'Enter' && filtered[selectedIdx]) {
              e.preventDefault();
              runItem(filtered[selectedIdx]);
            }
          }}
          placeholder="Jump to lesson, lab, or command…"
          aria-label="Search lessons, labs, and commands"
          className="w-full bg-transparent text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded">
          ESC
        </kbd>
      </div>

      <div className="max-h-80 overflow-y-auto py-1.5">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs font-mono uppercase tracking-wider text-neutral-400">
            No matching commands
          </p>
        ) : (
          <ul role="listbox" aria-label="Search results">
            {filtered.map((item, idx) => {
              const active = idx === selectedIdx;
              return (
                <li key={item.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => runItem(item)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-xs transition-colors ${
                      active
                        ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-950 dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      <span className="font-medium truncate">{item.label}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {item.category}
                      </span>
                      {active && (
                        <CornerDownLeft className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0c0c0e] font-mono text-[10px] uppercase tracking-wider text-neutral-400">
        <span>↑↓ Navigate</span>
        <span>↵ Open</span>
      </div>
    </dialog>
  );
}
