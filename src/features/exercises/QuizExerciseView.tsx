import { useState } from 'react';
import { CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import type { QuizExercise } from '../../types/content';

interface QuizExerciseViewProps {
  exercise: QuizExercise;
  onAttempt: (passed: boolean, submittedText: string) => void;
}

export function QuizExerciseView({ exercise, onAttempt }: QuizExerciseViewProps) {
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = (qIdx: number, optIdx: number, isMulti: boolean) => {
    setSubmitted(false);
    setSelected((prev) => {
      const current = prev[qIdx] ?? [];
      if (!isMulti) {
        return { ...prev, [qIdx]: [optIdx] };
      }
      return {
        ...prev,
        [qIdx]: current.includes(optIdx)
          ? current.filter((i) => i !== optIdx)
          : [...current, optIdx].sort((a, b) => a - b),
      };
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = exercise.questions.every((q, idx) => {
      const userAns = (selected[idx] ?? []).slice().sort((a, b) => a - b);
      const expected = q.correct.slice().sort((a, b) => a - b);
      return (
        userAns.length === expected.length &&
        userAns.every((val, i) => val === expected[i])
      );
    });
    onAttempt(allCorrect, JSON.stringify(selected));
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto flex-1">
      {exercise.questions.map((q, qIdx) => {
        const isMulti = q.correct.length > 1;
        const userAns = selected[qIdx] ?? [];
        const isCorrect =
          submitted &&
          userAns.length === q.correct.length &&
          userAns.slice().sort().every((v, i) => v === q.correct.slice().sort()[i]);

        return (
          <fieldset
            key={qIdx}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-2.5 bg-white dark:bg-[#0c0c0e]"
          >
            <legend className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 px-1">
              {qIdx + 1}. {q.question}{' '}
              {isMulti && (
                <span className="text-xs font-normal text-neutral-500">(Select all that apply)</span>
              )}
            </legend>

            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => {
                const checked = userAns.includes(optIdx);
                return (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'border-neutral-500 bg-neutral-50/70 dark:bg-neutral-950/40'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <input
                      type={isMulti ? 'checkbox' : 'radio'}
                      name={`q-${exercise.id}-${qIdx}`}
                      checked={checked}
                      onChange={() => toggleOption(qIdx, optIdx, isMulti)}
                      className="accent-neutral-600"
                    />
                    <span className="text-neutral-800 dark:text-neutral-200">{opt}</span>
                  </label>
                );
              })}
            </div>

            {submitted && (
              <div
                className={`text-xs p-2.5 rounded border flex items-start gap-2 ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{q.explanation}</span>
              </div>
            )}
          </fieldset>
        );
      })}

      <button
        type="button"
        onClick={handleSubmit}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Submit Quiz
      </button>
    </div>
  );
}
