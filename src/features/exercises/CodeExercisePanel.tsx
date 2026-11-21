import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Terminal,
  AlertTriangle,
  FlaskConical,
  Loader2,
  Copy,
  Check,
  Trash2,
  Keyboard,
} from 'lucide-react';
import type { CodeExercise } from '../../types/content';
import { pyodideRunner } from '../../runtime/runner';
import { gradeCodeExercise, type GradeResult } from '../../runtime/grader';
import { parsePythonError } from '../../runtime/errorHints';
import { db, recordExerciseAttempt } from '../../db/database';
import { useTheme } from '../../components/ThemeProvider';

interface CodeExercisePanelProps {
  lessonId: string;
  exercises: CodeExercise[];
  onAllPassed?: () => void;
}

type OutputTab = 'output' | 'errors' | 'tests' | 'stdin';

export function CodeExercisePanel({
  lessonId,
  exercises,
  onAllPassed,
}: CodeExercisePanelProps) {
  const { resolvedTheme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [codeByExercise, setCodeByExercise] = useState<Record<string, string>>({});
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [attemptsCount, setAttemptsCount] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'loading' | 'running' | 'ready'>('idle');
  const [activeTab, setActiveTab] = useState<OutputTab>('output');
  const [lastOutput, setLastOutput] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [stdinByExercise, setStdinByExercise] = useState<Record<string, string>>({});

  const checkTestsRef = useRef<() => void>(() => {});
  const runOnlyRef = useRef<() => void>(() => {});

  const current = exercises[selectedIndex];

  useEffect(() => {
    return pyodideRunner.subscribeStatus(setRuntimeStatus);
  }, []);

  const editorExtensions = useMemo(
    () => [
      python(),
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            runOnlyRef.current();
            return true;
          },
        },
        {
          key: 'Mod-Shift-Enter',
          run: () => {
            checkTestsRef.current();
            return true;
          },
        },
      ]),
      EditorView.theme({
        '&': {
          backgroundColor: resolvedTheme === 'dark' ? '#0d0d0f' : '#ffffff',
          fontSize: '13px',
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily: 'var(--font-mono)',
        },
        '.cm-gutters': {
          backgroundColor: resolvedTheme === 'dark' ? '#0d0d0f' : '#fafafa',
          borderRight:
            resolvedTheme === 'dark' ? '1px solid #262626' : '1px solid #e5e5e5',
          color: resolvedTheme === 'dark' ? '#525252' : '#a3a3a3',
        },
        '.cm-activeLineGutter': {
          backgroundColor: resolvedTheme === 'dark' ? '#171717' : '#f5f5f5',
        },
      }),
    ],
    [resolvedTheme]
  );

  // Load past attempts for this lesson from Dexie
  useEffect(() => {
    setSelectedIndex(0);
    setGradeResult(null);
    setLastOutput('');
    setLastError(null);
    setStartTime(Date.now());

    db.attempts
      .where('lessonId')
      .equals(lessonId)
      .toArray()
      .then((rows) => {
        const passed = new Set<string>();
        const counts: Record<string, number> = {};
        const latestCode: Record<string, string> = {};

        for (const row of rows) {
          counts[row.exerciseId] = (counts[row.exerciseId] ?? 0) + 1;
          if (row.passed) passed.add(row.exerciseId);
          latestCode[row.exerciseId] = row.code;
        }

        setPassedIds(passed);
        setAttemptsCount(counts);
        setCodeByExercise(latestCode);
      })
      .catch(() => {});
  }, [lessonId]);

  if (!current) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 text-sm text-neutral-500 dark:text-neutral-400">
        No exercises available for this lesson yet.
      </div>
    );
  }

  const currentCode = codeByExercise[current.id] ?? current.starterCode;
  const currentStdin = stdinByExercise[current.id] ?? (current.inputs ?? []).join('\n');
  const resolvedInputs =
    currentStdin.length > 0 ? currentStdin.split('\n') : current.inputs;

  const handleCodeChange = (val: string) => {
    setCodeByExercise((prev) => ({ ...prev, [current.id]: val }));
  };

  const handleReset = () => {
    setCodeByExercise((prev) => ({ ...prev, [current.id]: current.starterCode }));
    setGradeResult(null);
    setLastOutput('');
    setLastError(null);
  };

  const handleRunOnly = async () => {
    setRunning(true);
    setGradeResult(null);
    setLastError(null);
    try {
      const res = await pyodideRunner.run(currentCode, {
        inputs: resolvedInputs,
        timeoutMs: (current.timeoutSeconds ?? 10) * 1000,
      });
      setLastOutput(res.stdout);
      if (!res.ok || res.timedOut) {
        setLastError(res.error ?? res.stderr ?? 'Execution failed.');
        setActiveTab('errors');
      } else if (res.stderr) {
        setLastError(res.stderr);
        setActiveTab('errors');
      } else {
        setActiveTab('output');
      }
    } finally {
      setRunning(false);
    }
  };

  const handleCheckTests = async () => {
    setRunning(true);
    setLastError(null);
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const result = await gradeCodeExercise(currentCode, {
        ...current,
        inputs: current.inputs?.length ? current.inputs : resolvedInputs,
      });
      setGradeResult(result);
      setLastOutput(result.stdout);

      if (result.error) {
        setLastError(result.error);
        setActiveTab('errors');
      } else if (!result.allPassed) {
        setLastError(result.visibleTestError ?? (result.hiddenPassed ? null : 'Hidden test failed. Check edge cases!'));
        setActiveTab('tests');
      } else {
        setActiveTab('tests');
      }

      await recordExerciseAttempt({
        exerciseId: current.id,
        lessonId,
        timestamp: new Date().toISOString(),
        passed: result.allPassed,
        code: currentCode,
        hintsUsed: 0,
        solutionViewed: false,
        noAiMode: true,
        durationSeconds,
      });

      setAttemptsCount((prev) => ({
        ...prev,
        [current.id]: (prev[current.id] ?? 0) + 1,
      }));

      if (result.allPassed) {
        const nextPassed = new Set(passedIds);
        nextPassed.add(current.id);
        setPassedIds(nextPassed);
        if (nextPassed.size === exercises.length && onAllPassed) {
          onAllPassed();
        }
      }
    } finally {
      setRunning(false);
    }
  };

  checkTestsRef.current = handleCheckTests;
  runOnlyRef.current = handleRunOnly;

  const handleCopyOutput = async () => {
    const text = activeTab === 'errors' ? (lastError ?? '') : lastOutput;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleClearTerminal = () => {
    setLastOutput('');
    setLastError(null);
    setGradeResult(null);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] overflow-hidden">
      {/* Exercise Selector Bar */}
      <div className="flex items-center justify-between gap-2 px-4 pr-12 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#131316] overflow-x-auto">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Lesson exercises">
          {exercises.map((ex, idx) => {
            const isSelected = idx === selectedIndex;
            const isPassed = passedIds.has(ex.id);
            return (
              <button
                key={ex.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedIndex(idx);
                  setGradeResult(null);
                  setLastError(null);
                  setLastOutput('');
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

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                runtimeStatus === 'loading' || runtimeStatus === 'running'
                  ? 'bg-amber-500 motion-safe:animate-pulse'
                  : 'bg-emerald-500'
              }`}
              aria-hidden="true"
            />
            {runtimeStatus === 'loading'
              ? 'Loading Python'
              : runtimeStatus === 'running'
                ? 'Running'
                : 'Pyodide Ready'}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            Attempts: {attemptsCount[current.id] ?? 0}
          </span>
        </div>
      </div>

      {/* Exercise Prompt */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f]">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white truncate">
              {current.title}
            </h2>
            {passedIds.has(current.id) && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shrink-0">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                Passed
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141417] text-neutral-600 dark:text-neutral-300 shrink-0">
            {current.difficulty}
          </span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {current.prompt}
        </p>
      </div>

      {/* CodeMirror 6 Editor */}
      <div className="flex-1 min-h-0 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <CodeMirror
          value={currentCode}
          height="100%"
          className="h-full"
          extensions={editorExtensions}
          theme={resolvedTheme === 'dark' ? oneDark : 'light'}
          onChange={handleCodeChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: false,
            autocompletion: true,
          }}
        />
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#131316]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCheckTests}
            disabled={running}
            className="tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Run &amp; Check</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-700/80 text-emerald-100">
              ⌘⇧↵
            </kbd>
          </button>

          <button
            type="button"
            onClick={handleRunOnly}
            disabled={running}
            className="tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] hover:bg-neutral-100 dark:hover:bg-neutral-800/70 disabled:opacity-60 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Run Only</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              ⌘↵
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={running}
            className="tactile inline-flex items-center gap-1 font-mono text-[11px] text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white rounded px-1.5 py-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Output / Errors / Tests Panel */}
      <div className="h-48 lg:h-52 shrink-0 flex flex-col bg-neutral-50 dark:bg-[#09090b]">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3">
          <div className="flex" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'output'}
              onClick={() => setActiveTab('output')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'output'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
              Output
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'errors'}
              onClick={() => setActiveTab('errors')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'errors'
                  ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Errors {lastError ? '(1)' : ''}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tests'}
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
              Tests
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'stdin'}
              onClick={() => setActiveTab('stdin')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'stdin'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
              Stdin{currentStdin.trim() ? ' •' : ''}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {(lastOutput || lastError) && (
              <>
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  aria-label="Copy terminal output"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearTerminal}
                  aria-label="Clear terminal output"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3.5 text-xs font-mono">
          {activeTab === 'output' && (
            <pre className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
              {lastOutput || 'Ready. Press ⌘↵ to Run Only or ⌘⇧↵ to Run & Check.'}
            </pre>
          )}

          {activeTab === 'stdin' && (
            <div className="h-full flex flex-col gap-1.5">
              <label
                htmlFor="pdp-stdin-input"
                className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                Pre-supplied input() values (one per line)
              </label>
              <textarea
                id="pdp-stdin-input"
                value={currentStdin}
                onChange={(e) =>
                  setStdinByExercise((prev) => ({
                    ...prev,
                    [current.id]: e.target.value,
                  }))
                }
                placeholder={'144\nAlice'}
                className="flex-1 w-full resize-none rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-2.5 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-3">
              {lastError ? (
                (() => {
                  const diag = parsePythonError(lastError);
                  return (
                    <>
                      <div className="font-sans text-xs rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-rose-900 dark:text-rose-200">
                        <span className="font-semibold">
                          {diag.errorType}
                          {diag.line ? ` on line ${diag.line}` : ''}:
                        </span>{' '}
                        <span>{diag.message}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded border border-rose-200 dark:border-rose-900">
                        {lastError}
                      </pre>
                      <div className="font-sans text-xs rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-amber-900 dark:text-amber-200">
                        <span className="font-semibold">What to check: </span>
                        {diag.hint}
                      </div>
                    </>
                  );
                })()
              ) : (
                <p className="font-sans text-neutral-500 dark:text-neutral-400">
                  No errors on the last run.
                </p>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="font-sans space-y-2.5">
              {!gradeResult ? (
                <p className="text-neutral-500 dark:text-neutral-400">
                  Click &ldquo;Run &amp; Check&rdquo; to run the visible and hidden tests.
                </p>
              ) : gradeResult.allPassed ? (
                <div className="rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    All tests passed
                  </div>
                  <p className="text-xs">
                    {current.explanation}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {gradeResult.visiblePassed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Visible tests: Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        Visible tests: Failed
                      </span>
                    )}
                  </div>

                  {gradeResult.visiblePassed && !gradeResult.hiddenPassed && (
                    <div className="flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      Hidden tests: Failed (check edge cases or exact formatting)
                    </div>
                  )}

                  {(gradeResult.error || gradeResult.visibleTestError) &&
                    (() => {
                      const rawErr = gradeResult.error ?? gradeResult.visibleTestError ?? '';
                      const diag = parsePythonError(rawErr);
                      return (
                        <>
                          <div className="text-xs rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-rose-900 dark:text-rose-200">
                            <span className="font-semibold">
                              {diag.errorType}
                              {diag.line ? ` on line ${diag.line}` : ''}:
                            </span>{' '}
                            <span>{diag.message}</span>
                          </div>
                          <pre className="font-mono whitespace-pre-wrap text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded border border-rose-200 dark:border-rose-900">
                            {rawErr}
                          </pre>
                          <div className="text-xs rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-amber-900 dark:text-amber-200">
                            <span className="font-semibold">What to check: </span>
                            {diag.hint}
                          </div>
                        </>
                      );
                    })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
