import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  GitCompare,
} from 'lucide-react';
import type { SubmissionRecord } from '../../db/database';
import { computeLineDiff } from './lineDiff';

interface SubmissionsPanelProps {
  submissions: SubmissionRecord[];
  currentCode: string;
  onRestoreCode: (code: string) => void;
}

function VerdictBadge({ verdict }: { verdict: SubmissionRecord['verdict'] }) {
  if (verdict === 'Accepted') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Accepted
      </span>
    );
  }
  if (verdict === 'Time Limit Exceeded') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold text-xs">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Time Limit Exceeded
      </span>
    );
  }
  if (verdict === 'Runtime Error' || verdict === 'Syntax Error') {
    return (
      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold text-xs">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {verdict}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold text-xs">
      <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      Wrong Answer
    </span>
  );
}

export function SubmissionsPanel({
  submissions,
  currentCode,
  onRestoreCode,
}: SubmissionsPanelProps) {
  const [diffTargetId, setDiffTargetId] = useState<number | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 text-xs text-neutral-500 dark:text-neutral-400">
        No submissions recorded yet. Click Submit (Ctrl+Shift+Enter) to run all visible and hidden tests and save a snapshot.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => {
        const isDiffing = diffTargetId === sub.id;
        const diffLines = isDiffing ? computeLineDiff(sub.code, currentCode) : [];
        return (
          <div
            key={sub.id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3.5 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <VerdictBadge verdict={sub.verdict} />
                <span className="font-mono text-xs tabular-nums text-neutral-600 dark:text-neutral-300">
                  {sub.passed}/{sub.total} tests
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  {sub.mode}
                </span>
              </div>

              <span className="font-mono text-[11px] tabular-nums text-neutral-400">
                {sub.runtimeMs} ms · {new Date(sub.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onRestoreCode(sub.code)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Restore to editor
              </button>
              <button
                type="button"
                aria-expanded={isDiffing}
                onClick={() => setDiffTargetId(isDiffing ? null : sub.id ?? null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <GitCompare className="w-3 h-3" aria-hidden="true" />
                {isDiffing ? 'Hide Diff' : 'Diff vs Current'}
              </button>
            </div>

            {isDiffing && (
              <div className="rounded-md border border-neutral-200 dark:border-neutral-800 overflow-x-auto bg-neutral-50 dark:bg-[#09090b] font-mono text-[11px]">
                <div className="px-2.5 py-1 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500">
                  Submission (-) vs Current Editor (+)
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {diffLines.map((line, i) => (
                    <div
                      key={i}
                      className={`px-2.5 py-0.5 whitespace-pre flex gap-2 ${
                        line.type === 'add'
                          ? 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-900 dark:text-emerald-200'
                          : line.type === 'remove'
                            ? 'bg-rose-50 dark:bg-rose-950/35 text-rose-900 dark:text-rose-200'
                            : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <span className="w-4 shrink-0 select-none font-bold">
                        {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                      </span>
                      <span>{line.text || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
