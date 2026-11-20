import { useState } from 'react';
import { CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import type { FillBlankExercise } from '../../types/content';

interface FillBlankExerciseViewProps {
  exercise: FillBlankExercise;
  onAttempt: (passed: boolean, submittedText: string) => void;
}

export function FillBlankExerciseView({ exercise, onAttempt }: FillBlankExerciseViewProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ passed: boolean; details: Record<string, boolean> } | null>(null);

  // Split codeWithBlanks on {{1}}, {{2}}, etc.
  const parts = exercise.codeWithBlanks.split(/(\{\{\d+\}\})/g);

  const handleCheck = () => {
    const details: Record<string, boolean> = {};
    let allOk = true;
    for (const [key, accepted] of Object.entries(exercise.answers)) {
      const userVal = (values[key] ?? '').trim();
      const ok = accepted.some((ans) => ans.trim() === userVal);
      details[key] = ok;
      if (!ok) allOk = false;
    }
    setResult({ passed: allOk, details });
    onAttempt(allOk, JSON.stringify(values));
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
              onChange={(e) => setValues((prev) => ({ ...prev, [blankId]: e.target.value }))}
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
        onClick={handleCheck}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Check Blanks
      </button>

      {result && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-1 ${
            result.passed
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.passed ? 'All blanks correct!' : 'Some blanks need another look.'}
          </div>
          {result.passed && <p>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
