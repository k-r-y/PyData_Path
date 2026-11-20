import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Exercise } from '../../types/content';
import { db, recordExerciseAttempt } from '../../db/database';
import { ExerciseContainer } from './ExerciseContainer';
import { CodeExercisePanel } from './CodeExercisePanel';
import { PredictExerciseView } from './PredictExerciseView';
import { FillBlankExerciseView } from './FillBlankExerciseView';
import { ParsonsExerciseView } from './ParsonsExerciseView';
import { DebugExerciseView } from './DebugExerciseView';
import { QuizExerciseView } from './QuizExerciseView';

interface ExerciseWorkspaceProps {
  lessonId: string;
  exercises: Exercise[];
  onAllPassed?: () => void;
}

export function ExerciseWorkspace({
  lessonId,
  exercises,
  onAllPassed,
}: ExerciseWorkspaceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [attemptsCount, setAttemptsCount] = useState<Record<string, number>>({});
  const [savedCodeByEx, setSavedCodeByEx] = useState<Record<string, string>>({});
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  const [solutionViewed, setSolutionViewed] = useState<Record<string, boolean>>({});
  const [noAiMode, setNoAiMode] = useState(true);
  const [startTime, setStartTime] = useState<number>(() => Date.now());

  useEffect(() => {
    setSelectedIndex(0);
    setStartTime(Date.now());
    db.attempts
      .where('lessonId')
      .equals(lessonId)
      .toArray()
      .then((rows) => {
        const passed = new Set<string>();
        const counts: Record<string, number> = {};
        const codes: Record<string, string> = {};
        for (const r of rows) {
          counts[r.exerciseId] = (counts[r.exerciseId] ?? 0) + 1;
          if (r.passed) passed.add(r.exerciseId);
          codes[r.exerciseId] = r.code;
        }
        setPassedIds(passed);
        setAttemptsCount(counts);
        setSavedCodeByEx(codes);
      })
      .catch(() => {});
  }, [lessonId]);

  const interactiveExercises = exercises.filter((e) => e.type !== 'flashcard');
  const current = interactiveExercises[selectedIndex];

  if (!current) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 text-sm text-neutral-500 dark:text-neutral-400">
        No interactive exercises available for this lesson yet.
      </div>
    );
  }

  // Delegate pure code exercises to CodeExercisePanel (which has its own full editor/tabs)
  if (current.type === 'code' && interactiveExercises.every((e) => e.type === 'code')) {
    return (
      <CodeExercisePanel
        lessonId={lessonId}
        exercises={interactiveExercises}
        onAllPassed={onAllPassed}
      />
    );
  }

  const recordAttemptAndMastery = async (passed: boolean, submittedText: string) => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    await recordExerciseAttempt({
      exerciseId: current.id,
      lessonId,
      timestamp: new Date().toISOString(),
      passed,
      code: submittedText,
      hintsUsed: hintsUsed[current.id] ?? 0,
      solutionViewed: solutionViewed[current.id] ?? false,
      noAiMode,
      durationSeconds,
    });

    // Update concept mastery in Dexie
    const now = new Date().toISOString();
    for (const tag of current.concepts) {
      const existing = await db.mastery.get(tag);
      const correct = (existing?.correct ?? 0) + (passed ? 1 : 0);
      const incorrect = (existing?.incorrect ?? 0) + (passed ? 0 : 1);
      const ratio = correct / Math.max(1, correct + incorrect);
      const level: 0 | 1 | 2 | 3 =
        correct === 0 ? 1 : ratio >= 0.85 && correct >= 3 ? 3 : ratio >= 0.6 ? 2 : 1;
      await db.mastery.put({
        conceptTag: tag,
        level,
        correct,
        incorrect,
        lastPracticed: now,
      });
    }

    setAttemptsCount((prev) => ({
      ...prev,
      [current.id]: (prev[current.id] ?? 0) + 1,
    }));

    if (passed) {
      const nextPassed = new Set(passedIds);
      nextPassed.add(current.id);
      setPassedIds(nextPassed);
      if (nextPassed.size === interactiveExercises.length && onAllPassed) {
        onAllPassed();
      }
    }
    window.dispatchEvent(new Event('pdp-progress-updated'));
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] overflow-hidden">
      {/* Exercise Selector Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#131316] overflow-x-auto">
        {interactiveExercises.map((ex, idx) => {
          const isSelected = idx === selectedIndex;
          const isPassed = passedIds.has(ex.id);
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                setStartTime(Date.now());
              }}
              className={`tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                  : 'bg-white dark:bg-[#0d0d0f] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
              }`}
            >
              {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />}
              <span>Ex {idx + 1}</span>
            </button>
          );
        })}
      </div>

      <ExerciseContainer
        lessonId={lessonId}
        exercise={current}
        attemptsCount={attemptsCount[current.id] ?? 0}
        hintsUsed={hintsUsed[current.id] ?? 0}
        solutionViewed={solutionViewed[current.id] ?? false}
        noAiMode={noAiMode}
        onUseHint={(lvl) => setHintsUsed((p) => ({ ...p, [current.id]: Math.max(p[current.id] ?? 0, lvl) }))}
        onViewSolution={() => setSolutionViewed((p) => ({ ...p, [current.id]: true }))}
        onToggleNoAi={() => setNoAiMode((v) => !v)}
      >
        {current.type === 'code' && (
          <CodeExercisePanel
            lessonId={lessonId}
            exercises={[current]}
            onAllPassed={onAllPassed}
          />
        )}
        {current.type === 'predict' && (
          <PredictExerciseView exercise={current} onAttempt={recordAttemptAndMastery} />
        )}
        {current.type === 'fillblank' && (
          <FillBlankExerciseView exercise={current} onAttempt={recordAttemptAndMastery} />
        )}
        {current.type === 'parsons' && (
          <ParsonsExerciseView exercise={current} onAttempt={recordAttemptAndMastery} />
        )}
        {current.type === 'debug' && (
          <DebugExerciseView
            exercise={current}
            savedCode={savedCodeByEx[current.id]}
            onAttempt={recordAttemptAndMastery}
          />
        )}
        {current.type === 'quiz' && (
          <QuizExerciseView exercise={current} onAttempt={recordAttemptAndMastery} />
        )}
      </ExerciseContainer>
    </div>
  );
}
