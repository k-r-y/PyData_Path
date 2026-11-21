import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { FlaskConical, RotateCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { DebugExercise } from '../../types/content';
import { gradeCodeExercise, type GradeResult } from '../../runtime/grader';
import { parsePythonError } from '../../runtime/errorHints';
import { useTheme } from '../../components/ThemeProvider';

interface DebugExerciseViewProps {
  exercise: DebugExercise;
  savedCode?: string;
  onAttempt: (passed: boolean, code: string) => void;
}

export function DebugExerciseView({
  exercise,
  savedCode,
  onAttempt,
}: DebugExerciseViewProps) {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(savedCode ?? exercise.brokenCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  useEffect(() => {
    setCode(savedCode ?? exercise.brokenCode);
    setResult(null);
  }, [exercise, savedCode]);

  const handleCheck = async () => {
    setRunning(true);
    try {
      const res = await gradeCodeExercise(code, {
        ...exercise,
        type: 'code',
        starterCode: exercise.brokenCode,
      });
      setResult(res);
      onAttempt(res.allPassed, code);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-[200px] border-b border-neutral-200 dark:border-neutral-800 overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          minHeight="200px"
          extensions={[python()]}
          theme={resolvedTheme === 'dark' ? oneDark : 'light'}
          onChange={setCode}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b]/60">
        <button
          type="button"
          disabled={running}
          onClick={handleCheck}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
          Verify Fix
        </button>

        <button
          type="button"
          onClick={() => {
            setCode(exercise.brokenCode);
            setResult(null);
          }}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Buggy Code
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-56 bg-neutral-50 dark:bg-[#09090b] text-xs space-y-2">
        {!result && (
          <p className="text-neutral-500 dark:text-neutral-400">
            Find and fix the bug in the code above, then click Verify Fix.
          </p>
        )}

        {result && result.allPassed && (
          <div className="rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Bug fixed! All tests passed.
            </div>
            <p>
              <strong>Root cause:</strong> {exercise.bugDescription}
            </p>
          </div>
        )}

        {result && !result.allPassed && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
              Still failing
            </div>
            {(result.error || result.visibleTestError) &&
              (() => {
                const rawErr = result.error ?? result.visibleTestError ?? '';
                const diag = parsePythonError(rawErr);
                return (
                  <>
                    <div className="rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-900 dark:text-rose-200">
                      <span className="font-semibold">
                        {diag.errorType}
                        {diag.line ? ` on line ${diag.line}` : ''}:
                      </span>{' '}
                      <span>{diag.message}</span>
                    </div>
                    <pre className="font-mono whitespace-pre-wrap text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 p-2 rounded border border-rose-200 dark:border-rose-900">
                      {rawErr}
                    </pre>
                    <p className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900">
                      <span className="font-semibold">What to check: </span>
                      {diag.hint}
                    </p>
                  </>
                );
              })()}
          </div>
        )}
      </div>
    </div>
  );
}
