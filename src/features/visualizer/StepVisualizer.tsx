import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, SkipBack, SkipForward, RotateCcw, Eye } from 'lucide-react';
import tracerPy from '../../runtime/tracer.py?raw';
import { pyodideRunner } from '../../runtime/runner';
import { useTheme } from '../../components/ThemeProvider';

interface TraceStep {
  line: number;
  locals: Record<string, string>;
  stdout: string;
}

const DEFAULT_CODE = `total = 0
scores = [85, 90, 78]
for s in scores:
    total += s
avg = total / len(scores)
print("Average:", avg)`;

export function StepVisualizer() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleTrace = async () => {
    setRunning(true);
    setError(null);
    setSteps([]);
    setStepIdx(0);
    try {
      const driver = `${tracerPy}\nprint(run_with_trace(${JSON.stringify(code)}))`;
      const res = await pyodideRunner.run(driver);
      if (!res.ok) {
        setError(res.error ?? 'Failed to trace code.');
        return;
      }
      const parsed = JSON.parse(res.stdout.trim()) as {
        steps: TraceStep[];
        error: string | null;
      };
      setSteps(parsed.steps);
      if (parsed.error) setError(parsed.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  const currentStep = steps[stepIdx];
  const codeLines = code.split('\n');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Eye className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Step-Through Variable Visualizer
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Powered by Python <code className="font-mono">sys.settrace</code> inside Pyodide. Inspect how variables change line by line.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <CodeMirror
              value={code}
              height="240px"
              extensions={[python()]}
              theme={resolvedTheme === 'dark' ? oneDark : 'light'}
              onChange={setCode}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={running}
              onClick={handleTrace}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5" />
              {running ? 'Tracing...' : 'Trace Execution'}
            </button>

            {steps.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setStepIdx(0)}
                  aria-label="Reset to first step"
                  className="p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={stepIdx === 0}
                  onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                  aria-label="Previous step"
                  className="p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={stepIdx >= steps.length - 1}
                  onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
                  aria-label="Next step"
                  className="p-2 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                  Step {stepIdx + 1} / {steps.length}
                </span>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-mono text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Active Line View */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Execution Line
            </h2>
            <div className="font-mono text-xs space-y-0.5">
              {codeLines.map((line, i) => {
                const lineNum = i + 1;
                const isActive = currentStep?.line === lineNum;
                return (
                  <div
                    key={lineNum}
                    className={`px-2 py-0.5 rounded flex gap-3 ${
                      isActive
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100 font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="w-5 text-right select-none opacity-60">{lineNum}</span>
                    <span className="whitespace-pre">{line || ' '}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variables Table */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Variables in Scope
            </h2>
            {!currentStep || Object.keys(currentStep.locals).length === 0 ? (
              <p className="text-xs text-neutral-400">No variables yet.</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-neutral-500">
                    <th className="py-1 pr-3">Name</th>
                    <th className="py-1">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(currentStep.locals).map(([k, v]) => (
                    <tr key={k} className="border-b border-neutral-100 dark:border-neutral-800/60">
                      <td className="py-1.5 pr-3 text-neutral-700 dark:text-neutral-400">{k}</td>
                      <td className="py-1.5 text-neutral-800 dark:text-neutral-200">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Step Stdout */}
          {currentStep?.stdout && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Output so far
              </h2>
              <pre className="text-xs font-mono whitespace-pre-wrap">{currentStep.stdout}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
