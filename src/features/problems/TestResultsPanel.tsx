import { useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MinusCircle,
  FlaskConical,
  Terminal,
  Play,
  Eye,
} from 'lucide-react';
import type {
  ProblemEntry,
  ProblemSpec,
  ProblemSuiteResult,
  ProblemTestResult,
  ProblemVerdict,
} from '../../types/problem';
import {
  formatTestPreviewExpected,
  formatTestPreviewInput,
} from '../../runtime/problemGrader';
import { getPlainLanguageErrorHint } from '../../runtime/errorHints';
import type { CustomRunResult } from '../../runtime/runner';

export type BottomPanelTab = 'tests' | 'output' | 'terminal';

interface TestResultsPanelProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  spec: ProblemSpec;
  suiteResult: ProblemSuiteResult | null;
  liveResults: ProblemTestResult[];
  running: boolean;
  customInput: string;
  onCustomInputChange: (val: string) => void;
  onRunCustom: () => void;
  customResult: CustomRunResult | null;
  revealedHiddenIndices: Set<number>;
  onRevealHiddenCase: (testIndex: number) => void;
  examMode?: boolean;
}

function VerdictBadge({ verdict }: { verdict: ProblemVerdict }) {
  const styles: Record<ProblemVerdict, { cls: string; Icon: typeof CheckCircle2 }> = {
    Accepted: {
      cls: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200',
      Icon: CheckCircle2,
    },
    'Wrong Answer': {
      cls: 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
      Icon: XCircle,
    },
    'Runtime Error': {
      cls: 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
      Icon: AlertTriangle,
    },
    'Syntax Error': {
      cls: 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200',
      Icon: AlertTriangle,
    },
    'Time Limit Exceeded': {
      cls: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
      Icon: Clock,
    },
  };
  const { cls, Icon } = styles[verdict];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${cls}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{verdict}</span>
    </span>
  );
}

function TestStatusPill({ status }: { status: ProblemTestResult['status'] }) {
  if (status === 'Passed') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Passed
      </span>
    );
  }
  if (status === 'Time Limit Exceeded') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold text-xs">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Time Limit Exceeded
      </span>
    );
  }
  if (status === 'Not run') {
    return (
      <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-medium text-xs">
        <MinusCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Not run
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold text-xs">
      <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {status}
    </span>
  );
}

function customPlaceholder(entry: ProblemEntry): string {
  if (entry.type === 'function') {
    return `Arguments expression for ${entry.name}(...), e.g. [1, 2, 1] or ([1, 2], 3)`;
  }
  return 'Python snippet to test against your classes/functions...';
}

export function TestResultsPanel({
  activeTab,
  onTabChange,
  spec,
  suiteResult,
  liveResults,
  running,
  customInput,
  onCustomInputChange,
  onRunCustom,
  customResult,
  revealedHiddenIndices,
  onRevealHiddenCase,
  examMode = false,
}: TestResultsPanelProps) {
  const [showCustomBox, setShowCustomBox] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabs: Array<{ id: BottomPanelTab; label: string; disabled?: boolean }> = [
    { id: 'tests', label: 'Tests' },
    { id: 'output', label: 'Output' },
    { id: 'terminal', label: examMode ? 'Terminal (Disabled)' : 'Terminal', disabled: examMode },
  ];

  const displayResults = running ? liveResults : suiteResult?.results ?? [];
  const visibleOffset = spec.tests.visible.length;

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const enabled = tabs.filter((t) => !t.disabled);
    const curEnabledIdx = enabled.findIndex((t) => t.id === tabs[idx].id);
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (curEnabledIdx + 1) % enabled.length;
    else if (e.key === 'ArrowLeft') nextIdx = (curEnabledIdx - 1 + enabled.length) % enabled.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = enabled.length - 1;
    if (nextIdx >= 0) {
      e.preventDefault();
      const target = enabled[nextIdx];
      onTabChange(target.id);
      const rawIdx = tabs.findIndex((t) => t.id === target.id);
      tabRefs.current[rawIdx]?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-50 dark:bg-[#09090b]">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3 bg-white dark:bg-[#0d0d0f]">
        <div role="tablist" aria-label="Execution results" className="flex items-center gap-1">
          {tabs.map((tab, idx) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                id={`pdp-bottom-tab-${tab.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`relative px-3 py-2 font-mono text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 disabled:opacity-40 ${
                  selected
                    ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {tab.id === 'tests' && <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />}
                {tab.id === 'output' && <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />}
                {tab.id === 'terminal' && <Terminal className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCustomBox((v) => !v);
            if (activeTab !== 'tests') onTabChange('tests');
          }}
          aria-expanded={showCustomBox}
          className="text-[11px] font-mono px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {showCustomBox ? 'Hide Custom Input' : 'Custom Input'}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 text-xs">
        <div
          role="tabpanel"
          aria-labelledby="pdp-bottom-tab-tests"
          hidden={activeTab !== 'tests'}
          className="space-y-3"
        >
          {showCustomBox && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="pdp-problem-custom-input"
                  className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                >
                  Custom Input (does not affect grading)
                </label>
                <button
                  type="button"
                  disabled={running}
                  onClick={onRunCustom}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-medium text-[11px] disabled:opacity-50"
                >
                  <Play className="w-3 h-3" aria-hidden="true" />
                  Run Custom
                </button>
              </div>
              <textarea
                id="pdp-problem-custom-input"
                rows={2}
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                placeholder={customPlaceholder(spec.entry)}
                className="w-full rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] p-2 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
              />
              {customResult && (
                <div className="rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-2.5 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>
                      Custom Run: {customResult.ok ? 'Completed' : customResult.timedOut ? 'Time Limit Exceeded' : 'Error'}
                    </span>
                    <span className="tabular-nums">{customResult.runtimeMs.toFixed(1)} ms</span>
                  </div>
                  {customResult.returnRepr && (
                    <div>
                      <span className="text-neutral-500">Return: </span>
                      <span className="text-neutral-900 dark:text-neutral-100">{customResult.returnRepr}</span>
                    </div>
                  )}
                  {customResult.stdout && (
                    <pre className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                      Stdout: {customResult.stdout}
                    </pre>
                  )}
                  {customResult.error && (
                    <pre className="whitespace-pre-wrap text-rose-700 dark:text-rose-400">
                      {customResult.error}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {!suiteResult && displayResults.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">
              Press <strong>Run</strong> (Ctrl+Enter) to check visible tests, or <strong>Submit</strong> (Ctrl+Shift+Enter) to run all visible and hidden tests.
            </p>
          ) : (
            <>
              {suiteResult && (
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2.5">
                    <VerdictBadge verdict={suiteResult.verdict} />
                    <span className="font-mono text-xs tabular-nums text-neutral-600 dark:text-neutral-300">
                      {suiteResult.passed} / {suiteResult.total} passed
                    </span>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-neutral-500">
                    {suiteResult.runtimeMs} ms total ({suiteResult.mode})
                  </span>
                </div>
              )}

              {suiteResult?.firstError && (
                <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 p-3 space-y-2">
                  <pre className="font-mono text-[11px] whitespace-pre-wrap text-rose-800 dark:text-rose-200 overflow-x-auto">
                    {suiteResult.firstError}
                  </pre>
                  <div className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-2 text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">What to check: </span>
                    {getPlainLanguageErrorHint(suiteResult.firstError)}
                  </div>
                </div>
              )}

              <ul className="space-y-2" aria-label="Test case results">
                {displayResults.map((res) => {
                  const isHidden = res.scope === 'hidden';
                  const hiddenNumber = res.index - visibleOffset + 1;
                  const hiddenSpec = isHidden ? spec.tests.hidden[res.index - visibleOffset] : undefined;
                  const isRevealed = revealedHiddenIndices.has(res.index);
                  const hideDetails = isHidden && !res.passed && !isRevealed && !examMode;

                  return (
                    <li
                      key={`${res.scope}-${res.index}`}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TestStatusPill status={res.status} />
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {isHidden ? `Hidden Test #${hiddenNumber}: ${res.label}` : `Case ${res.index + 1}: ${res.label}`}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-neutral-400">
                          {res.runtimeMs.toFixed(1)} ms
                        </span>
                      </div>

                      {!isHidden && res.status !== 'Not run' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                          <div className="rounded bg-neutral-50 dark:bg-[#131316] p-2 border border-neutral-100 dark:border-neutral-800/80 overflow-x-auto">
                            <span className="block text-[10px] uppercase text-neutral-400 mb-0.5">Input</span>
                            <span className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                              {res.inputRepr || '(script)'}
                            </span>
                          </div>
                          <div className="rounded bg-neutral-50 dark:bg-[#131316] p-2 border border-neutral-100 dark:border-neutral-800/80 overflow-x-auto">
                            <span className="block text-[10px] uppercase text-neutral-400 mb-0.5">Expected</span>
                            <span className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                              {res.expectedRepr}
                            </span>
                          </div>
                          <div className="rounded bg-neutral-50 dark:bg-[#131316] p-2 border border-neutral-100 dark:border-neutral-800/80 overflow-x-auto">
                            <span className="block text-[10px] uppercase text-neutral-400 mb-0.5">Actual</span>
                            <span className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                              {res.actualRepr || res.error || '-'}
                            </span>
                          </div>
                        </div>
                      )}

                      {!isHidden && res.stdout && (
                        <pre className="font-mono text-[11px] bg-neutral-100 dark:bg-[#141417] p-2 rounded border border-neutral-200 dark:border-neutral-800 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                          Stdout: {res.stdout}
                        </pre>
                      )}

                      {hideDetails && res.status !== 'Not run' && (
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Hidden test details are masked to encourage independent debugging.
                          </span>
                          <button
                            type="button"
                            onClick={() => onRevealHiddenCase(res.index)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50"
                          >
                            <Eye className="w-3 h-3" aria-hidden="true" />
                            Reveal failing case
                          </button>
                        </div>
                      )}

                      {isHidden && isRevealed && hiddenSpec && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          <div className="rounded bg-amber-50/50 dark:bg-amber-950/20 p-2 border border-amber-200 dark:border-amber-900/70">
                            <span className="block text-[10px] uppercase text-amber-700 dark:text-amber-400 mb-0.5">
                              Revealed Input
                            </span>
                            <span className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
                              {res.inputRepr || formatTestPreviewInput(hiddenSpec)}
                            </span>
                          </div>
                          <div className="rounded bg-amber-50/50 dark:bg-amber-950/20 p-2 border border-amber-200 dark:border-amber-900/70">
                            <span className="block text-[10px] uppercase text-amber-700 dark:text-amber-400 mb-0.5">
                              Revealed Expected
                            </span>
                            <span className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
                              {res.expectedRepr || formatTestPreviewExpected(hiddenSpec)}
                            </span>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div
          role="tabpanel"
          aria-labelledby="pdp-bottom-tab-output"
          hidden={activeTab !== 'output'}
          className="space-y-3"
        >
          {suiteResult?.firstError && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-300">
                <span>First Traceback</span>
                {suiteResult.errorLine && (
                  <span className="font-mono text-[11px]">Line {suiteResult.errorLine}</span>
                )}
              </div>
              <pre className="font-mono text-[11px] whitespace-pre-wrap rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 text-rose-800 dark:text-rose-200">
                {suiteResult.firstError}
              </pre>
              <div className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-amber-900 dark:text-amber-200">
                <span className="font-semibold">What to check: </span>
                {getPlainLanguageErrorHint(suiteResult.firstError)}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
              Captured Output (stdout)
            </h3>
            <pre className="font-mono text-xs whitespace-pre-wrap rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3 text-neutral-800 dark:text-neutral-200 min-h-20">
              {suiteResult?.stdout || customResult?.stdout || '(No printed output yet.)'}
            </pre>
          </div>
        </div>

        <div
          role="tabpanel"
          aria-labelledby="pdp-bottom-tab-terminal"
          hidden={activeTab !== 'terminal'}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-4 text-neutral-600 dark:text-neutral-400"
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Interactive Terminal (Phase 2)
          </p>
          <p className="text-xs">
            The isolated xterm.js Python REPL, simulated filesystem shell, and &ldquo;Load my code into terminal&rdquo; workflow will be wired here in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
