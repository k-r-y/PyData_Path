import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { getAllModules, getLessonsForModule } from '../content/loader';
import { db, type ProgressRecord } from '../db/database';
import { ProgressRing } from '../components/ProgressRing';
import { ParticleKnot } from '../components/ParticleKnot';

export function HomePage() {
  const modules = getAllModules();
  const [progressMap, setProgressMap] = useState<Map<string, ProgressRecord>>(new Map());

  useEffect(() => {
    db.progress
      .toArray()
      .then((rows) => {
        const map = new Map<string, ProgressRecord>();
        for (const r of rows) map.set(r.lessonId, r);
        setProgressMap(map);
      })
      .catch(() => {});
  }, []);

  const allLessons = modules.flatMap((m) => getLessonsForModule(m.id));
  const totalLessons = allLessons.length;
  const totalCompleted = allLessons.filter(
    (l) => progressMap.get(l.frontmatter.id)?.status === 'completed'
  ).length;
  const nextLesson =
    allLessons.find((l) => progressMap.get(l.frontmatter.id)?.status !== 'completed') ??
    allLessons[0];

  return (
    <div className="min-h-full bg-white dark:bg-[#09090b]">
      {/* Architectural Split Hero */}
      <section className="relative border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 relative">
          {/* Left Column: Editorial Typography & Sharp CTAs */}
          <div className="lg:col-span-6 px-6 sm:px-10 lg:px-14 py-12 lg:py-20 flex flex-col justify-between gap-12 lg:border-r border-neutral-200 dark:border-neutral-800">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                <span className="w-1.5 h-1.5 bg-neutral-950 dark:bg-white inline-block" aria-hidden="true" />
                <span>PyData Workspace / Version 1.0</span>
              </div>

              <h1 className="font-mono text-4xl sm:text-5xl lg:text-[3.25rem] font-medium tracking-[-0.04em] leading-[1.08] text-neutral-950 dark:text-white">
                Learn Python &amp; Analytics.
                <span className="text-neutral-400 dark:text-neutral-500 block mt-1">
                  Without the complexity.
                </span>
              </h1>

              <p className="text-sm sm:text-[15px] text-neutral-600 dark:text-neutral-400 max-w-md leading-[1.65]">
                An offline-first, hands-on Python and data analytics workspace. Every lesson pairs concise, cited theory with live Python exercises running directly in your browser.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {nextLesson && (
                  <Link
                    to={`/lesson/${nextLesson.frontmatter.id}`}
                    className="tactile group inline-flex items-center gap-2.5 h-11 px-6 rounded-[2px] bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  >
                    <span>{totalCompleted > 0 ? 'Resume Learning' : 'Start Learning'}</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                )}

                <Link
                  to="/dataframe-lab"
                  className="tactile group inline-flex items-center gap-2.5 h-11 px-6 rounded-[2px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-900 dark:text-neutral-100 text-xs font-medium tracking-wide hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
                >
                  <span>Explore Labs</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 pt-1">
                Browser-Native &nbsp;·&nbsp; Offline-First &nbsp;·&nbsp; Zero Setup
              </div>
            </div>

            {/* Bottom Spec Strip */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800 max-w-md">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                  Runtime
                </p>
                <p className="font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  PYODIDE / WASM
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                  Curriculum
                </p>
                <p className="font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                  {modules.length} MODULES
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                  Progress
                </p>
                <p className="font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                  {totalCompleted} / {totalLessons}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Stippled Geometry */}
          <div className="lg:col-span-6 relative bg-white dark:bg-[#0b0b0d] min-h-[420px] lg:min-h-[600px] flex flex-col justify-between border-t lg:border-t-0 border-neutral-200 dark:border-neutral-800">
            {/* Crosshair Corner Markers */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-2 left-2 font-mono text-xs text-neutral-300 dark:text-neutral-700 select-none z-10"
            >
              +
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-2 right-2 font-mono text-xs text-neutral-300 dark:text-neutral-700 select-none z-10"
            >
              +
            </span>

            <ParticleKnot />
          </div>

          {/* Floating Dark Terminal Straddling Center Hairline (matches reference) */}
          <div className="px-6 pb-8 lg:p-0 lg:absolute lg:bottom-7 lg:left-1/2 lg:-translate-x-[18%] lg:z-20 pointer-events-none sm:pointer-events-auto">
            <div className="w-full max-w-[390px] rounded-[4px] border border-neutral-800 bg-[#0d0d0f] text-neutral-200 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.38)] overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-800/80 bg-[#121215]">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-600" />
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-600" />
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-600" />
                </div>
                <span className="font-mono text-[10px] text-neutral-500">
                  pydata — pyodide — 80×12
                </span>
                <span className="w-8" />
              </div>
              <div className="p-4 font-mono text-[11px] leading-[1.7] space-y-0.5">
                <p className="text-neutral-100">
                  <span className="text-neutral-500">$</span> pydata init analytics-env
                </p>
                <p className="text-emerald-400">✓ Pyodide WASM runtime configured</p>
                <p className="text-neutral-100 pt-1">
                  <span className="text-neutral-500">$</span> python verify_suite.py
                </p>
                <p className="text-neutral-400">
                  → Loading pandas &amp; numpy <span className="text-neutral-600 ml-1">1.2s</span>
                </p>
                <p className="text-neutral-400">
                  → Optimizing dataframe <span className="text-neutral-600 ml-1">0.4s</span>
                </p>
                <p className="text-emerald-400">✓ 14/14 assertions passed</p>
                <p className="text-emerald-400 flex items-center gap-1.5">
                  <span>✓ Workspace online</span>
                  <span className="text-neutral-500">indexeddb · 0ms</span>
                </p>
                <p className="text-neutral-100 pt-0.5 flex items-center gap-1.5">
                  <span className="text-neutral-500">$</span>
                  <span className="inline-block w-1.5 h-3.5 bg-neutral-200 motion-safe:animate-pulse" aria-hidden="true" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Index */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
              01 // Curriculum Index
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950 dark:text-white">
              Available Modules
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400 tabular-nums">
            {totalCompleted} of {totalLessons} lessons completed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {modules.map((mod, idx) => {
            const lessons = getLessonsForModule(mod.id);
            const completedCount = lessons.filter(
              (l) => progressMap.get(l.frontmatter.id)?.status === 'completed'
            ).length;

            return (
              <article
                key={mod.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                      MOD. {String(idx + 1).padStart(2, '0')} // {mod.id}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {mod.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <ProgressRing completed={completedCount} total={lessons.length} size={28} />
                    <span className="font-mono text-xs font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
                      {completedCount}/{lessons.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 border-t border-neutral-100 dark:border-neutral-800/80">
                  {lessons.map((lesson) => {
                    const fm = lesson.frontmatter;
                    const isCompleted = progressMap.get(fm.id)?.status === 'completed';
                    return (
                      <Link
                        key={fm.id}
                        to={`/lesson/${fm.id}`}
                        className="flex items-center justify-between gap-4 py-2.5 px-2 -mx-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0 group-hover:border-neutral-500 dark:group-hover:border-neutral-500 transition-colors" />
                          )}
                          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-neutral-950 dark:group-hover:text-white">
                            {fm.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {fm.estimatedMinutes}m
                          </span>
                          <ArrowRight
                            className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
