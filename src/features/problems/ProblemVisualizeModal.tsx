import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import tracerPy from '../../runtime/tracer.py?raw';
import { pyodideRunner } from '../../runtime/runner';
import type { FunctionTestCase, ProblemSpec, ProblemTestCase, ScriptTestCase } from '../../types/problem';

interface TraceStep {
  line: number;
  locals: Record<string, string>;
  stdout: string;
}

interface TracePayload {
  steps: TraceStep[];
  truncated?: boolean;
  maxSteps?: number;
  error: string | null;
  finalStdout: string;
}

interface ProblemVisualizeModalProps {
  open: boolean;
  onClose: () => void;
  spec: ProblemSpec;
  code: string;
}

const MAX_PROBLEM_TRACE_STEPS = 200;

function buildTracedSource(spec: ProblemSpec, code: string, test: ProblemTestCase): string {
  const userPart = code.trimEnd();
  if (spec.entry.type === 'function') {
    const fnTest = test as FunctionTestCase;
    let callCode = '';
    if (typeof fnTest.argsExpr === 'string') {
      callCode = [
        `_viz_raw = ${fnTest.argsExpr}`,
        `_viz_args = _viz_raw if isinstance(_viz_raw, tuple) else (_viz_raw,)`,
        `_viz_out = ${spec.entry.name}(*_viz_args)`,
        `print("Return:", repr(_viz_out))`,
      ].join('\n');
    } else {
      const jsonArgs = JSON.stringify(fnTest.args ?? []);
      callCode = [
        `import json as _viz_json`,
        `_viz_args = _viz_json.loads(${JSON.stringify(jsonArgs)})`,
        `_viz_out = ${spec.entry.name}(*_viz_args)`,
        `print("Return:", repr(_viz_out))`,
      ].join('\n');
    }
    return `${userPart}\n${callCode}`;
  }

  const sTest = test as ScriptTestCase;
  return `${userPart}\n${sTest.script}`;
}

export function ProblemVisualizeModal({
  open,
  onClose,
  spec,
  code,
}: ProblemVisualizeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const exampleSelectId = useId();

  const visibleTests = useMemo(
    () => (spec.tests.visible.length > 0 ? spec.tests.visible : spec.tests.hidden.slice(0, 1)),
    [spec]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<TracePayload | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const selectedTest = visibleTests[selectedIdx] ?? visibleTests[0];
  const tracedSource = useMemo(() => {
    if (!selectedTest) return code;
    return buildTracedSource(spec, code, selectedTest);
  }, [spec, code, selectedTest]);

  const codeLines = useMemo(() => tracedSource.split('\n'), [tracedSource]);
  const userLineCount = useMemo(() => code.trimEnd().split('\n').length, [code]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.returnValue = '';
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
      setPlaying(false);
    }
  }, [open]);

  const runTrace = async (testToTrace: ProblemTestCase | undefined) => {
    if (!testToTrace) return;
    setPlaying(false);
    setLoading(true);
    setRunError(null);
    setStepIndex(0);
    const fullSrc = buildTracedSource(spec, code, testToTrace);
    try {
      const driver = `${tracerPy}\nprint(run_with_trace(${JSON.stringify(fullSrc)}, max_steps=${MAX_PROBLEM_TRACE_STEPS}))`;
      const res = await pyodideRunner.run(driver, { timeoutMs: 8000 });
      if (res.timedOut) {
        setRunError('Tracing timed out before finishing.');
        setTraceData(null);
        return;
      }
      if (!res.ok) {
        setRunError(res.error ?? 'Failed to execute trace.');
        setTraceData(null);
        return;
      }
      const parsed = JSON.parse(res.stdout.trim()) as TracePayload;
      setTraceData(parsed);
      setStepIndex(0);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Unable to parse execution trace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedTest) {
      runTrace(selectedTest);
    }
  }, [open, selectedIdx]);

  useEffect(() => {
    if (!playing || !traceData || traceData.steps.length === 0) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 >= traceData.steps.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 550);
    return () => window.clearInterval(timer);
  }, [playing, traceData]);

  const steps = traceData?.steps ?? [];
  const activeStep = steps[stepIndex];
  const hitCap = Boolean(
    traceData?.truncated ||
      steps.length >= MAX_PROBLEM_TRACE_STEPS ||
      traceData?.error?.includes('Trace limit reached')
  );

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (dialogRef.current) dialogRef.current.returnValue = '';
        onClose();
      }}
      className="m-auto w-[min(96vw,64rem)] max-h-[90vh] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] text-neutral-950 dark:text-neutral-100 shadow-2xl p-0 overflow-hidden"
    >
      {open && (
        <div className="flex flex-col max-h-[88vh]">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113]">
            <div>
              <h2 id={titleId} className="text-sm font-semibold">
                Step-Through Execution Visualizer
              </h2>
              <p className="text-[11px] font-mono text-neutral-500">
                Capped at {MAX_PROBLEM_TRACE_STEPS} steps on visible examples
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={exampleSelectId} className="text-xs font-mono text-neutral-500">
                Example:
              </label>
              <select
                id={exampleSelectId}
                value={selectedIdx}
                onChange={(e) => setSelectedIdx(Number(e.target.value))}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] text-xs font-mono"
              >
                {visibleTests.map((t, idx) => (
                  <option key={t.label} value={idx}>
                    {t.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close visualizer"
                className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {hitCap && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Step trace stopped at the {MAX_PROBLEM_TRACE_STEPS}-step cap. Choose a smaller visible example to inspect the complete run.
                </span>
              </div>
            )}

            {runError && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-200 font-mono">
                {runError}
              </div>
            )}

            {traceData?.error && !traceData.error.includes('Trace limit reached') && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-200 font-mono">
                Exception reached: {traceData.error}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={loading || stepIndex <= 0}
                onClick={() => {
                  setPlaying(false);
                  setStepIndex((i) => Math.max(0, i - 1));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
              </button>

              <button
                type="button"
                disabled={loading || steps.length === 0}
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium disabled:opacity-40"
              >
                {playing ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
                {playing ? 'Pause' : 'Play'}
              </button>

              <button
                type="button"
                disabled={loading || stepIndex + 1 >= steps.length}
                onClick={() => {
                  setPlaying(false);
                  setStepIndex((i) => Math.min(steps.length - 1, i + 1));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                disabled={loading || steps.length === 0}
                onClick={() => {
                  setPlaying(false);
                  setStepIndex(0);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Restart
              </button>

              {steps.length > 0 && (
                <div className="flex items-center gap-2 ml-auto font-mono text-xs tabular-nums text-neutral-500">
                  <input
                    type="range"
                    aria-label="Trace step slider"
                    min={0}
                    max={steps.length - 1}
                    value={stepIndex}
                    onChange={(e) => {
                      setPlaying(false);
                      setStepIndex(Number(e.target.value));
                    }}
                    className="w-32"
                  />
                  <span>
                    Step {stepIndex + 1} / {steps.length}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-500">
                Tracing execution steps...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Code with Active Line Highlight */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 p-3 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                  {codeLines.map((lineText, idx) => {
                    const lineNum = idx + 1;
                    const isActive = activeStep?.line === lineNum;
                    const isDriver = lineNum > userLineCount;
                    return (
                      <div
                        key={lineNum}
                        className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                          isActive
                            ? 'bg-amber-500/25 text-amber-200 font-semibold'
                            : isDriver
                              ? 'opacity-65'
                              : ''
                        }`}
                      >
                        <span className="w-6 text-right text-neutral-500 select-none tabular-nums">
                          {lineNum}
                        </span>
                        <span className="whitespace-pre">{lineText || ' '}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Locals & Stdout */}
                <div className="space-y-3">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-3">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                      Local Variables {activeStep ? `(Line ${activeStep.line})` : ''}
                    </h3>
                    {activeStep && Object.keys(activeStep.locals).length > 0 ? (
                      <dl className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
                        {Object.entries(activeStep.locals).map(([k, v]) => (
                          <div key={k} className="py-1.5 flex items-start justify-between gap-3">
                            <dt className="text-neutral-500 font-semibold shrink-0">{k}</dt>
                            <dd className="text-neutral-900 dark:text-neutral-100 break-all text-right">
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-xs text-neutral-500">No local variables in scope at this step.</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-3">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">
                      Stdout at Step {stepIndex + 1}
                    </h3>
                    <pre className="font-mono text-xs whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 min-h-14">
                      {activeStep?.stdout || '(empty)'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
