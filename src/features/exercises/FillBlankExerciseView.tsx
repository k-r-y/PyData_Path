import { useState } from 'react';
import { CheckCircle2, XCircle, FlaskConical, Loader2 } from 'lucide-react';
import type { FillBlankExercise } from '../../types/content';
import { gradeCodeExercise } from '../../runtime/grader';

interface FillBlankExerciseViewProps {
  exercise: FillBlankExercise;
  onAttempt: (passed: boolean, submittedText: string) => void;
}

/**
 * Normalizes whitespace and quote style outside/around Python tokens so
 * equivalent expressions like `a == "gold"` and `a=='gold'` match cleanly.
 */
export function normalizeBlankAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),:\[\]])\s*/g, '$1')
    .replace(/\s*(==|!=|<=|>=|\*\*|=|[+\-*/&|])\s*/g, '$1');
}

export function FillBlankExerciseView({ exercise, onAttempt }: FillBlankExerciseViewProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    details: Record<string, boolean>;
    error?: string;
  } | null>(null);

  const parts = exercise.codeWithBlanks.split(/(\{\{\d+\}\})/g);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const details: Record<string, boolean> = {};
      let allMatchList = true;
      let anyEmpty = false;

      for (const [key, accepted] of Object.entries(exercise.answers)) {
        const userRaw = (values[key] ?? '').trim();
        if (!userRaw) anyEmpty = true;
        const userNorm = normalizeBlankAnswer(userRaw);
        const ok = accepted.some((ans) => normalizeBlankAnswer(ans) === userNorm);
        details[key] = ok;
        if (!ok) allMatchList = false;
      }

      if (anyEmpty) {
        setResult({ passed: false, details, error: 'Please fill in every blank before checking.' });
        onAttempt(false, JSON.stringify(values));
        return;
      }

      if (allMatchList) {
        setResult({ passed: true, details });
        onAttempt(true, JSON.stringify(values));
        return;
      }

      // If the exercise defines runnable tests, substitute the blanks and verify behaviorally
      if (exercise.visibleTests && exercise.visibleTests.trim().length > 0) {
        const filledCode = exercise.codeWithBlanks.replace(/\{\{(\d+)\}\}/g, (_, k) =>
          (values[k] ?? '').trim()
        );
        const gradeRes = await gradeCodeExercise(filledCode, {
          ...exercise,
          type: 'code',
          starterCode: exercise.codeWithBlanks,
          visibleTests: exercise.visibleTests,
          hiddenTests: exercise.hiddenTests ?? '',
        });

        if (gradeRes.allPassed) {
          const allTrue: Record<string, boolean> = {};
          for (const k of Object.keys(exercise.answers)) allTrue[k] = true;
          setResult({ passed: true, details: allTrue });
          onAttempt(true, JSON.stringify(values));
          return;
        }

        setResult({
          passed: false,
          details,
          error: gradeRes.error ?? gradeRes.visibleTestError,
        });
        onAttempt(false, JSON.stringify(values));
        return;
      }

      setResult({ passed: false, details });
      onAttempt(false, JSON.stringify(values));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto flex-1">
      <div className="rounded-lg bg-neutral-900 text-neutral-100 p-4 font-mono text-xs sm:text-sm leading-loose overflow-x-auto border border-neutral-800 whitespace-pre-wrap">
        {parts.map((part, idx) => {
          const match = part.match(/^\{\{(\d+)\}\}$/);
          if (!match) return <span key={idx}>{part}</span>;
          const blankId = match[1];
          const blankOk = result?.details[blankId];
          return (
            <input
              key={idx}
              type="text"
              aria-label={`Blank ${blankId}`}
              value={values[blankId] ?? ''}
              onChange={(e) => {
                setResult(null);
                setValues((prev) => ({ ...prev, [blankId]: e.target.value }));
              }}
              className={`inline-block w-28 mx-1 px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono text-xs ${
                result === null
                  ? 'border-neutral-600'
                  : blankOk
                    ? 'border-emerald-500'
                    : 'border-rose-500'
              }`}
              placeholder={`#${blankId}`}
            />
          );
        })}
      </div>

      <button
        type="button"
        disabled={checking}
        onClick={handleCheck}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
      >
        {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
        Check Blanks
      </button>

      {result && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-1.5 ${
            result.passed
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.passed ? 'All blanks correct!' : 'Some blanks need another look.'}
          </div>
          {result.error && (
            <pre className="font-mono text-[11px] whitespace-pre-wrap opacity-90">{result.error}</pre>
          )}
          {result.passed && <p>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
