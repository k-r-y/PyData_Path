import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, CheckCircle2, Clock, ArrowRight, CircleDot } from 'lucide-react';
import { getAllProblemMeta } from '../../content/problemLoader';
import { db, type ProblemProgressRecord } from '../../db/database';
import type { ProblemMeta } from '../../types/problem';

const DIFFICULTY_BADGE: Record<ProblemMeta['difficulty'], string> = {
  easy: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
  medium: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  hard: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  challenge: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/80',
};

export function ProblemListPage() {
  const problems = getAllProblemMeta();
  const [progressMap, setProgressMap] = useState<Map<string, ProblemProgressRecord>>(new Map());

  useEffect(() => {
    db.problemProgress
      .toArray()
      .then((rows) => {
        const map = new Map<string, ProblemProgressRecord>();
        for (const r of rows) map.set(r.problemId, r);
        setProgressMap(map);
      })
      .catch(() => {});
  }, []);

  const solvedCount = problems.filter((p) => progressMap.get(p.id)?.status === 'solved').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
            Practice // Problem Solver
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            Problem Solver
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Original IS-flavored Python coding challenges running locally in Pyodide. Full search, filters, study plans, and stats arrive in Phase 4.
          </p>
        </div>

        <div className="font-mono text-xs tabular-nums text-neutral-600 dark:text-neutral-300">
          Solved: {solvedCount} / {problems.length}
        </div>
      </header>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <caption className="sr-only">Available coding problems</caption>
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">ID</th>
              <th scope="col" className="px-4 py-3">Title</th>
              <th scope="col" className="px-4 py-3">Difficulty</th>
              <th scope="col" className="px-4 py-3">Tags</th>
              <th scope="col" className="px-4 py-3 text-right">Est.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {problems.map((p) => {
              const prog = progressMap.get(p.id);
              const status = prog?.status ?? 'unsolved';
              return (
                <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {status === 'solved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        {prog?.solvedUnaided ? 'Solved unaided' : 'Solved'}
                      </span>
                    ) : status === 'attempted' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                        <CircleDot className="w-3.5 h-3.5" aria-hidden="true" />
                        Attempted
                      </span>
                    ) : (
                      <span className="text-neutral-400">Unsolved</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500 dark:text-neutral-400">
                    {p.id}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="font-medium text-neutral-950 dark:text-white hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>{p.title}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        DIFFICULTY_BADGE[p.difficulty]
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {p.estimatedMinutes}m
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
