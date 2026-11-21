import { useId, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, Clock, Lightbulb, Lock, Settings2, Unlock } from 'lucide-react';
import type { ProblemProgressRecord } from '../../db/database';
import type { ProblemSpec } from '../../types/problem';

interface HintsPanelProps {
  spec: ProblemSpec;
  progress: ProblemProgressRecord | null;
  elapsedSeconds: number;
  hintUnlockMinutes: [number, number, number];
  hintUnlockFails: [number, number, number];
  onConfigureThresholds: (
    minutes: [number, number, number],
    fails: [number, number, number]
  ) => void;
  onRevealHint: (level: 1 | 2 | 3, earlyOverride: boolean) => Promise<void>;
}

const HINT_LEVEL_META: Array<{ level: 1 | 2 | 3; title: string; subtitle: string }> = [
  { level: 1, title: 'Level 1: Gentle Nudge', subtitle: 'Pattern or data structure clue' },
  { level: 2, title: 'Level 2: Approach Outline', subtitle: 'Algorithmic strategy' },
  { level: 3, title: 'Level 3: Pseudocode Sketch', subtitle: 'Step-by-step blueprint' },
];

function formatRemaining(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
}

export function HintsPanel({
  spec,
  progress,
  elapsedSeconds,
  hintUnlockMinutes,
  hintUnlockFails,
  onConfigureThresholds,
  onRevealHint,
}: HintsPanelProps) {
  const [revealedLevels, setRevealedLevels] = useState<Set<number>>(new Set());
  const [pendingOverrideLevel, setPendingOverrideLevel] = useState<1 | 2 | 3 | null>(null);
  const overrideDialogRef = useRef<HTMLDialogElement>(null);
  const overrideTitleId = useId();
  const min1Id = useId();
  const min2Id = useId();
  const min3Id = useId();
  const fail1Id = useId();
  const fail2Id = useId();
  const fail3Id = useId();

  const failedAttempts =
    progress && progress.status !== 'solved' ? progress.attempts : Math.max(0, (progress?.attempts ?? 0) - 1);

  const alreadyRecordedLevel = progress?.maxHintLevel ?? 0;

  const isNaturallyUnlocked = (level: 1 | 2 | 3): boolean => {
    const idx = level - 1;
    if (progress?.status === 'solved') return true;
    if (alreadyRecordedLevel >= level) return true;
    if (elapsedSeconds >= hintUnlockMinutes[idx] * 60) return true;
    if (failedAttempts >= hintUnlockFails[idx]) return true;
    return false;
  };

  const handleRevealClick = async (level: 1 | 2 | 3) => {
    if (isNaturallyUnlocked(level)) {
      setRevealedLevels((prev) => new Set(prev).add(level));
      await onRevealHint(level, false);
      return;
    }
    setPendingOverrideLevel(level);
    const dlg = overrideDialogRef.current;
    if (dlg && !dlg.open) {
      dlg.returnValue = '';
      dlg.showModal();
    }
  };

  const handleOverrideDialogClose = async () => {
    const dlg = overrideDialogRef.current;
    if (!dlg) return;
    const choice = dlg.returnValue;
    dlg.returnValue = '';
    const level = pendingOverrideLevel;
    setPendingOverrideLevel(null);
    if (choice === 'confirm' && level) {
      setRevealedLevels((prev) => new Set(prev).add(level));
      await onRevealHint(level, true);
    }
  };

  const handleThresholdChange = (
    kind: 'min' | 'fail',
    index: 0 | 1 | 2,
    rawVal: string
  ) => {
    const parsed = Math.max(0, Math.min(120, Number(rawVal) || 0));
    if (kind === 'min') {
      const next: [number, number, number] = [...hintUnlockMinutes] as [number, number, number];
      next[index] = parsed;
      onConfigureThresholds(next, hintUnlockFails);
    } else {
      const next: [number, number, number] = [...hintUnlockFails] as [number, number, number];
      next[index] = parsed;
      onConfigureThresholds(hintUnlockMinutes, next);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Progressive Hint Ladder
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Elapsed session time: {formatRemaining(elapsedSeconds)} · Failed attempts: {failedAttempts}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {HINT_LEVEL_META.map(({ level, title, subtitle }) => {
          const idx = (level - 1) as 0 | 1 | 2;
          const natural = isNaturallyUnlocked(level);
          const isVisible = revealedLevels.has(level) || alreadyRecordedLevel >= level;
          const remainingSecs = Math.max(0, hintUnlockMinutes[idx] * 60 - elapsedSeconds);
          const remainingFails = Math.max(0, hintUnlockFails[idx] - failedAttempts);
          const hintText = spec.hints[idx] || 'No hint text provided.';

          return (
            <div
              key={level}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#111113] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-950 dark:text-white flex items-center gap-1.5">
                    {isVisible ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                    ) : natural ? (
                      <Unlock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                    )}
                    {title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{subtitle}</p>
                </div>

                {!isVisible && (
                  <button
                    type="button"
                    onClick={() => handleRevealClick(level)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      natural
                        ? 'border-neutral-900 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                        : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                    }`}
                  >
                    {natural ? 'Show Hint' : 'Unlock Early'}
                  </button>
                )}
              </div>

              {isVisible ? (
                <div className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-3 text-xs leading-6 text-neutral-800 dark:text-neutral-200 space-y-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{hintText}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {natural
                    ? 'Unlocked by time/attempt threshold. Click Show Hint when ready.'
                    : `Unlocks automatically in ${formatRemaining(remainingSecs)} or after ${remainingFails} more failed submit${remainingFails === 1 ? '' : 's'}.`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Configurable Hint Thresholds */}
      <details className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3 text-xs">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 select-none">
          <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
          Hint Unlock Timing Settings
        </summary>
        <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {([
            [0, min1Id, fail1Id, 'L1'],
            [1, min2Id, fail2Id, 'L2'],
            [2, min3Id, fail3Id, 'L3'],
          ] as const).map(([idx, mId, fId, label]) => (
            <div key={label} className="space-y-1.5">
              <div className="font-mono text-[10px] font-semibold text-neutral-500">{label}</div>
              <div>
                <label htmlFor={mId} className="block text-[10px] text-neutral-500 mb-0.5">
                  Minutes
                </label>
                <input
                  id={mId}
                  type="number"
                  min={0}
                  max={120}
                  value={hintUnlockMinutes[idx]}
                  onChange={(e) => handleThresholdChange('min', idx, e.target.value)}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] font-mono text-xs tabular-nums"
                />
              </div>
              <div>
                <label htmlFor={fId} className="block text-[10px] text-neutral-500 mb-0.5">
                  Failed submits
                </label>
                <input
                  id={fId}
                  type="number"
                  min={0}
                  max={50}
                  value={hintUnlockFails[idx]}
                  onChange={(e) => handleThresholdChange('fail', idx, e.target.value)}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] font-mono text-xs tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Confirm Early Hint Dialog */}
      <dialog
        ref={overrideDialogRef}
        aria-labelledby={overrideTitleId}
        onClose={handleOverrideDialogClose}
        className="m-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-950 dark:text-neutral-50 shadow-2xl w-[min(92vw,24rem)] p-5"
      >
        <h3 id={overrideTitleId} className="text-sm font-semibold mb-2">
          Unlock Hint Level {pendingOverrideLevel} Early?
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
          Unlocking before the time/attempt threshold logs hint usage and marks this problem as solved with assistance if you complete it.
        </p>
        <form method="dialog" className="flex items-center justify-end gap-2">
          <button
            type="submit"
            value="cancel"
            autoFocus
            className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Keep thinking
          </button>
          <button
            type="submit"
            value="confirm"
            className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
          >
            Unlock hint
          </button>
        </form>
      </dialog>
    </div>
  );
}
