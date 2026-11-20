import { useState } from 'react';
import { Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { PredictExercise } from '../../types/content';
import { pyodideRunner } from '../../runtime/runner';

interface PredictExerciseViewProps {
  exercise: PredictExercise;
  onAttempt: (passed: boolean, submittedText: string) => void;
}

export function PredictExerciseView({ exercise, onAttempt }: PredictExerciseViewProps) {
  const [prediction, setPrediction] = useState('');
  const [running, setRunning] = useState(false);
  const [actualOutput, setActualOutput] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  const handleCheck = async () => {
    setRunning(true);
    try {
      const res = await pyodideRunner.run(exercise.code);
      const actual = res.stdout.trimEnd();
      const expected = (exercise.expectedOutput || actual).trimEnd();
      const isMatch = prediction.trimEnd() === expected;
      setActualOutput(actual);
      setPassed(isMatch);
      onAttempt(isMatch, prediction);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto flex-1">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Code to Read
        </span>
        <pre className="mt-1.5 rounded-lg bg-neutral-900 text-neutral-100 p-4 text-xs font-mono overflow-x-auto border border-neutral-800">
          {exercise.code}
        </pre>
      </div>

      <div>
        <label
          htmlFor={`predict-${exercise.id}`}
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5"
        >
          Your Predicted Output (exact text)
        </label>
        <textarea
          id={`predict-${exercise.id}`}
          rows={4}
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="Type what you think Python will print..."
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#09090b] p-3 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        />
      </div>

      <button
        type="button"
        disabled={running || prediction.trim().length === 0}
        onClick={handleCheck}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold"
      >
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        Run &amp; Compare
      </button>

      {actualOutput !== null && passed !== null && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-2 ${
            passed
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {passed ? 'Prediction matched!' : 'Not quite. Compare with actual output:'}
          </div>
          <pre className="p-2 rounded bg-neutral-900 text-neutral-100 font-mono whitespace-pre-wrap">
            {actualOutput}
          </pre>
          {passed && <p>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
