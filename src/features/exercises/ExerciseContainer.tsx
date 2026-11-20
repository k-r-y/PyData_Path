import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  Eye,
  Bookmark,
  ShieldCheck,
  Clock,
  Lock,
} from 'lucide-react';
import type { BaseExercise } from '../../types/content';
import { db } from '../../db/database';

interface ExerciseContainerProps {
  lessonId: string;
  exercise: BaseExercise;
  attemptsCount: number;
  hintsUsed: number;
  solutionViewed: boolean;
  noAiMode: boolean;
  onUseHint: (level: number) => void;
  onViewSolution: () => void;
  onToggleNoAi: () => void;
  children: React.ReactNode;
}

const HINT_LABELS = ['Level 1: Nudge', 'Level 2: Approach', 'Level 3: Near Solution'];

export function ExerciseContainer({
  lessonId,
  exercise,
  attemptsCount,
  hintsUsed,
  solutionViewed,
  noAiMode,
  onUseHint,
  onViewSolution,
  onToggleNoAi,
  children,
}: ExerciseContainerProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const hintUnlockSeconds = 30;
  const hintsUnlocked = secondsElapsed >= hintUnlockSeconds || attemptsCount >= 1 || hintsUsed > 0;

  useEffect(() => {
    setSecondsElapsed(0);
    setShowHints(false);
    const id = window.setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [exercise.id]);

  useEffect(() => {
    db.bookmarks
      .where('lessonId')
      .equals(lessonId)
      .toArray()
      .then((rows) => {
        setBookmarked(rows.some((r) => r.exerciseId === exercise.id));
      })
      .catch(() => {});
  }, [lessonId, exercise.id]);

  const handleToggleBookmark = async () => {
    const bookmarkId = `${lessonId}:${exercise.id}`;
    if (bookmarked) {
      await db.bookmarks.delete(bookmarkId);
      setBookmarked(false);
    } else {
      await db.bookmarks.put({
        id: bookmarkId,
        lessonId,
        exerciseId: exercise.id,
        reason: `Stuck on ${exercise.title}`,
        createdAt: new Date().toISOString(),
      });
      setBookmarked(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Shared Exercise Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-2.5 bg-white dark:bg-[#0d0d0f]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#141417] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
              {exercise.type}
            </span>
            <h2 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
              {exercise.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onToggleNoAi}
              aria-pressed={noAiMode}
              title="Mark whether you solved this without external AI assistance"
              className={`tactile inline-flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                noAiMode
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-medium'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              No-AI {noAiMode ? 'On' : 'Off'}
            </button>

            <button
              type="button"
              onClick={handleToggleBookmark}
              aria-pressed={bookmarked}
              title="Save to Stuck List"
              className={`tactile inline-flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                bookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              {bookmarked ? 'Saved' : 'Stuck'}
            </button>
          </div>
        </div>

        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {exercise.prompt}
        </p>

        {/* Hint Ladder & Try-First Timer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            {hintsUnlocked ? (
              <button
                type="button"
                onClick={() => setShowHints((v) => !v)}
                className="tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                {showHints ? 'Hide Hints' : `Hints (${hintsUsed}/3)`}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                Try first: hints unlock in {Math.max(0, hintUnlockSeconds - secondsElapsed)}s (or after 1 attempt)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {secondsElapsed}s
            </span>
            <span>Attempts: {attemptsCount}</span>
          </div>
        </div>

        {/* Expandable Hint Ladder */}
        {showHints && hintsUnlocked && (
          <div className="mt-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-2.5 text-xs">
            {exercise.hints.map((hint, idx) => {
              const level = idx + 1;
              const isRevealed = hintsUsed >= level;
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      {HINT_LABELS[idx]}
                    </span>
                    {!isRevealed && (
                      <button
                        type="button"
                        onClick={() => onUseHint(level)}
                        className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 font-medium hover:bg-amber-300"
                      >
                        Reveal Hint {level}
                      </button>
                    )}
                  </div>
                  {isRevealed && (
                    <p className="text-neutral-800 dark:text-neutral-200">{hint}</p>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-amber-200/70 dark:border-amber-900/70 flex items-center justify-between">
              {solutionViewed ? (
                <div className="w-full space-y-1">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Solution (logged):
                  </span>
                  <pre className="p-2 rounded bg-[#0d0d0f] border border-neutral-800 text-neutral-100 font-mono overflow-x-auto">
                    {exercise.solution}
                  </pre>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={hintsUsed < 3}
                  onClick={onViewSolution}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 disabled:opacity-40 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  {hintsUsed < 3 ? 'Reveal all 3 hints to unlock solution' : 'View Full Solution'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Specific Exercise Body */}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
