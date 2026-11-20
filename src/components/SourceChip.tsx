import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { SourceEntry } from '../types/content';

interface SourceChipProps {
  source: SourceEntry;
}

export function SourceChip({ source }: SourceChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300">
      <span className="font-medium">{source.title}</span>
      <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        ({source.publisher})
      </span>
      {source.verified ? (
        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
          Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono text-[11px] uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          Unverified
        </span>
      )}
    </span>
  );
}
