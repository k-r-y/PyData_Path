import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowLeft,
  FileText,
  Lightbulb,
  BookOpen,
  StickyNote,
  History,
} from 'lucide-react';
import { loadProblemWorkspaceBundle } from '../../content/problemLoader';
import { getSourceMap } from '../../content/loader';
import { SourceChip } from '../../components/SourceChip';
import {
  db,
  getSetting,
  recordProblemSubmission,
  saveProblemDraft,
  saveSetting,
  type ProblemProgressRecord,
  type SubmissionRecord,
} from '../../db/database';
import { gradeProblem } from '../../runtime/grader';
import { pyodideRunner, type CustomRunResult } from '../../runtime/runner';
import type {
  ProblemMeta,
  ProblemSpec,
  ProblemSuiteResult,
  ProblemTestResult,
} from '../../types/problem';
import { ProblemEditor, type EditorThemeMode } from './ProblemEditor';
import { TestResultsPanel, type BottomPanelTab } from './TestResultsPanel';
import { SubmissionsPanel } from './SubmissionsPanel';

type LeftTab = 'description' | 'hints' | 'explanation' | 'notes' | 'submissions';
type MobileTab = 'problem' | 'code' | 'tests';

const DIFFICULTY_STYLES: Record<ProblemMeta['difficulty'], string> = {
  easy: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
  medium: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  hard: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  challenge: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/80',
};

export function ProblemWorkspacePage() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<{
    meta: ProblemMeta;
    spec: ProblemSpec;
    statement: string;
    starterCode: string;
    checkerCode?: string;
  } | null>(null);

  const [code, setCode] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProblemProgressRecord | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  const [leftTab, setLeftTab] = useState<LeftTab>('description');
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>('tests');
  const [mobileTab, setMobileTab] = useState<MobileTab>('problem');

  const [running, setRunning] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'loading' | 'running' | 'ready'>('idle');
  const [suiteResult, setSuiteResult] = useState<ProblemSuiteResult | null>(null);
  const [liveResults, setLiveResults] = useState<ProblemTestResult[]>([]);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  const [customInput, setCustomInput] = useState('');
  const [customResult, setCustomResult] = useState<CustomRunResult | null>(null);
  const [revealedHiddenIndices, setRevealedHiddenIndices] = useState<Set<number>>(new Set());

  // Editor preferences
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState<EditorThemeMode>('system');
  const [ligatures, setLigatures] = useState(false);

  // Resizable split ratios (%)
  const [leftWidthPct, setLeftWidthPct] = useState(44);
  const [topHeightPct, setTopHeightPct] = useState(58);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  const startTimeRef = useRef<number>(Date.now());
  const latestCodeRef = useRef<string>('');
  const loadedProblemIdRef = useRef<string | null>(null);
  const leftTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    return pyodideRunner.subscribeStatus(setRuntimeStatus);
  }, []);

  useEffect(() => {
    Promise.all([
      getSetting<number>('editorFontSize', 14),
      getSetting<EditorThemeMode>('editorTheme', 'system'),
      getSetting<boolean>('editorLigatures', false),
    ])
      .then(([sz, th, lig]) => {
        setFontSize(sz);
        setEditorTheme(th);
        setLigatures(lig);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSuiteResult(null);
    setLiveResults([]);
    setCustomResult(null);
    setErrorLine(null);
    setRevealedHiddenIndices(new Set());
    setLeftTab('description');
    startTimeRef.current = Date.now();

    if (!slug) {
      setBundle(null);
      setLoading(false);
      return;
    }

    loadProblemWorkspaceBundle(slug)
      .then(async (loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setBundle(null);
          setLoading(false);
          return;
        }
        setBundle(loaded);
        loadedProblemIdRef.current = loaded.spec.id;

        const [draft, prog, subs] = await Promise.all([
          db.drafts.get(loaded.spec.id),
          db.problemProgress.get(loaded.spec.id),
          db.submissions.where('problemId').equals(loaded.spec.id).reverse().sortBy('timestamp'),
        ]);
        if (cancelled) return;

        const initialCode = draft?.code ?? loaded.starterCode;
        latestCodeRef.current = initialCode;
        setCode(initialCode);
        setDraftSavedAt(draft?.updatedAt ?? null);
        setProgress(prog ?? null);
        setSubmissions(subs);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setBundle(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (loadedProblemIdRef.current) {
        saveProblemDraft(loadedProblemIdRef.current, latestCodeRef.current).catch(() => {});
      }
    };
  }, [slug]);

  // Debounced autosave draft
  useEffect(() => {
    if (!bundle) return;
    latestCodeRef.current = code;
    const problemId = bundle.spec.id;
    const timer = window.setTimeout(() => {
      saveProblemDraft(problemId, code)
        .then(() => setDraftSavedAt(new Date().toISOString()))
        .catch(() => {});
    }, 250);
    return () => window.clearTimeout(timer);
  }, [code, bundle]);

  // Flush draft immediately on pagehide/beforeunload
  useEffect(() => {
    const flush = () => {
      if (loadedProblemIdRef.current) {
        saveProblemDraft(loadedProblemIdRef.current, latestCodeRef.current).catch(() => {});
      }
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  const handleCodeChange = useCallback((next: string) => {
    setCode(next);
    setErrorLine(null);
  }, []);

  const handleRunCustom = useCallback(async () => {
    if (!bundle || running) return;
    setRunning(true);
    setErrorLine(null);
    try {
      await saveProblemDraft(bundle.spec.id, code);
      const res = await pyodideRunner.runProblemCustom({
        code,
        entry: bundle.spec.entry,
        customInput,
      });
      setCustomResult(res);
      if (res.errorLine) setErrorLine(res.errorLine);
      setBottomTab('tests');
    } finally {
      setRunning(false);
    }
  }, [bundle, running, code, customInput]);

  const handleRun = useCallback(async () => {
    if (!bundle || running) return;
    setRunning(true);
    setErrorLine(null);
    setCustomResult(null);
    setBottomTab('tests');
    if (window.innerWidth < 1024) setMobileTab('tests');

    try {
      await saveProblemDraft(bundle.spec.id, code);
      setDraftSavedAt(new Date().toISOString());

      const res = await gradeProblem({
        code,
        spec: bundle.spec,
        mode: 'run',
        checkerCode: bundle.checkerCode,
        onTestProgress: (partial) => setLiveResults(partial),
      });
      setSuiteResult(res);
      setErrorLine(res.errorLine ?? null);

      if (customInput.trim().length > 0 && res.verdict !== 'Syntax Error' && res.verdict !== 'Time Limit Exceeded') {
        const cRes = await pyodideRunner.runProblemCustom({
          code,
          entry: bundle.spec.entry,
          customInput,
        });
        setCustomResult(cRes);
      }

      if (res.verdict === 'Syntax Error' || res.verdict === 'Runtime Error') {
        setBottomTab('output');
      }
    } finally {
      setRunning(false);
    }
  }, [bundle, running, code, customInput]);

  const handleSubmit = useCallback(async () => {
    if (!bundle || running) return;
    setRunning(true);
    setErrorLine(null);
    setBottomTab('tests');
    if (window.innerWidth < 1024) setMobileTab('tests');

    try {
      await saveProblemDraft(bundle.spec.id, code);
      setDraftSavedAt(new Date().toISOString());

      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      startTimeRef.current = Date.now();

      const res = await gradeProblem({
        code,
        spec: bundle.spec,
        mode: 'submit',
        checkerCode: bundle.checkerCode,
        onTestProgress: (partial) => setLiveResults(partial),
      });
      setSuiteResult(res);
      setErrorLine(res.errorLine ?? null);

      if (res.verdict === 'Syntax Error' || res.verdict === 'Runtime Error') {
        setBottomTab('output');
      }

      const updatedProg = await recordProblemSubmission({
        problemId: bundle.spec.id,
        verdict: res.verdict,
        passed: res.passed,
        total: res.total,
        runtimeMs: res.runtimeMs,
        code,
        mode: 'practice',
        durationSeconds,
      });
      setProgress(updatedProg);

      const updatedSubs = await db.submissions
        .where('problemId')
        .equals(bundle.spec.id)
        .reverse()
        .sortBy('timestamp');
      setSubmissions(updatedSubs);
      window.dispatchEvent(new Event('pdp-progress-updated'));
    } finally {
      setRunning(false);
    }
  }, [bundle, running, code]);

  const handleResetConfirm = useCallback(async () => {
    if (!bundle) return;
    setCode(bundle.starterCode);
    latestCodeRef.current = bundle.starterCode;
    setErrorLine(null);
    setSuiteResult(null);
    setLiveResults([]);
    setCustomResult(null);
    await saveProblemDraft(bundle.spec.id, bundle.starterCode);
    setDraftSavedAt(new Date().toISOString());
  }, [bundle]);

  const handleRevealHiddenCase = useCallback(
    async (testIndex: number) => {
      if (!bundle) return;
      setRevealedHiddenIndices((prev) => new Set(prev).add(testIndex));
      const existing = await db.problemProgress.get(bundle.spec.id);
      const updated: ProblemProgressRecord = existing
        ? { ...existing, revealedFailingCase: true }
        : {
            problemId: bundle.spec.id,
            status: 'attempted',
            attempts: 0,
            firstSolvedAt: null,
            lastAttemptAt: new Date().toISOString(),
            bestPassed: 0,
            totalTests: bundle.spec.tests.visible.length + bundle.spec.tests.hidden.length,
            solvedUnaided: false,
            maxHintLevel: 0,
            solutionViewed: false,
            revealedFailingCase: true,
            timeSpentSeconds: 0,
          };
      await db.problemProgress.put(updated);
      setProgress(updated);
    },
    [bundle]
  );

  // Horizontal splitter drag
  const handleVerticalDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.max(25, Math.min(70, pct)));
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  // Vertical splitter drag inside right pane
  const handleHorizontalDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const pane = rightPaneRef.current;
      if (!pane) return;
      const rect = pane.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setTopHeightPct(Math.max(30, Math.min(80, pct)));
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-mono text-xs uppercase tracking-[0.14em] text-neutral-400">
        Loading problem workspace...
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
          404 // PROBLEM NOT FOUND
        </p>
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Problem not found
        </h1>
        <Link
          to="/problems"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to Problems
        </Link>
      </div>
    );
  }

  const { spec, statement } = bundle;
  const sourceMap = getSourceMap();
  const sources = spec.sources
    .map((id) => sourceMap.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const leftTabs: Array<{ id: LeftTab; label: string; Icon: typeof FileText }> = [
    { id: 'description', label: 'Description', Icon: FileText },
    { id: 'hints', label: 'Hints', Icon: Lightbulb },
    { id: 'explanation', label: 'Explanation', Icon: BookOpen },
    { id: 'notes', label: 'Notes', Icon: StickyNote },
    { id: 'submissions', label: `Submissions (${submissions.length})`, Icon: History },
  ];

  const handleLeftTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % leftTabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + leftTabs.length) % leftTabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = leftTabs.length - 1;
    if (nextIdx >= 0) {
      e.preventDefault();
      setLeftTab(leftTabs[nextIdx].id);
      leftTabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden bg-white dark:bg-[#09090b]">
      {/* Mobile Top Tabs */}
      <div className="lg:hidden flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] sticky top-14 z-10">
        {(
          [
            { id: 'problem', label: 'Problem' },
            { id: 'code', label: 'Code' },
            { id: 'tests', label: 'Tests & Output' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMobileTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              mobileTab === t.id
                ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white font-semibold'
                : 'border-transparent text-neutral-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop Resizable Split Workspace / Mobile Stacked */}
      <div
        ref={splitContainerRef}
        className="flex-1 min-h-0 flex flex-col lg:flex-row"
      >
        {/* Left Pane */}
        <section
          aria-label="Problem details"
          style={{ ['--left-pane-width' as string]: `${leftWidthPct}%` }}
          className={`lg:w-[var(--left-pane-width)] lg:h-full flex flex-col min-h-0 border-b lg:border-b-0 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] ${
            mobileTab === 'problem' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Left Pane Tabs */}
          <div className="flex items-center justify-between gap-2 px-3 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto bg-neutral-50 dark:bg-[#111113]">
            <div role="tablist" aria-label="Problem sections" className="flex items-center gap-1">
              {leftTabs.map(({ id, label, Icon }, idx) => {
                const selected = leftTab === id;
                const locked = id === 'explanation' && progress?.status !== 'solved' && !progress?.solutionViewed;
                return (
                  <button
                    key={id}
                    ref={(el) => {
                      leftTabRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`pdp-left-tab-${id}`}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setLeftTab(id)}
                    onKeyDown={(e) => handleLeftTabKeyDown(e, idx)}
                    className={`px-2.5 py-2.5 font-mono text-[11px] font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                      selected
                        ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    {locked ? <Lock className="w-3 h-3" aria-hidden="true" /> : <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <Link
              to="/problems"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-950 dark:hover:text-white shrink-0"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              All
            </Link>
          </div>

          {/* Left Pane Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
            <div role="tabpanel" aria-labelledby="pdp-left-tab-description" hidden={leftTab !== 'description'}>
              <header className="space-y-3 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {spec.id}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                      DIFFICULTY_STYLES[spec.difficulty]
                    }`}
                  >
                    {spec.difficulty}
                  </span>
                  {progress?.status === 'solved' && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                      Solved
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 ml-auto">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {spec.estimatedMinutes} min
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                  {spec.title}
                </h1>

                <div className="flex flex-wrap gap-1.5">
                  {spec.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="space-y-4 text-sm leading-7 text-neutral-800 dark:text-neutral-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-neutral-950 dark:text-white mt-6 mb-2">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-1.5">{children}</ul>
                    ),
                    pre: ({ children }) => (
                      <pre className="rounded-lg bg-neutral-950 text-neutral-100 p-3.5 text-xs font-mono overflow-x-auto border border-neutral-800 my-3">
                        {children}
                      </pre>
                    ),
                    code: ({ className, children }) => {
                      const isBlock = Boolean(className) || String(children).includes('\n');
                      if (isBlock) {
                        return <code className="font-mono">{children}</code>;
                      }
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {statement}
                </ReactMarkdown>
              </div>

              {sources.length > 0 && (
                <section className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    Sources
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((src) => (
                      <SourceChip key={src.id} source={src} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div role="tabpanel" aria-labelledby="pdp-left-tab-hints" hidden={leftTab !== 'hints'}>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 text-xs text-neutral-600 dark:text-neutral-400">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  3-Level Hint Ladder (Phase 3)
                </p>
                <p>
                  Timed and attempt-gated progressive hints (nudge, approach, pseudocode) with early-override logging will be unlocked in Phase 3.
                </p>
              </div>
            </div>

            <div role="tabpanel" aria-labelledby="pdp-left-tab-explanation" hidden={leftTab !== 'explanation'}>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  Explanation (Phase 3)
                </p>
                <p>
                  Guided approach walkthroughs, reference solution complexities, common mistakes, and the &ldquo;Give up and view&rdquo; unlock gate will be wired in Phase 3.
                </p>
              </div>
            </div>

            <div role="tabpanel" aria-labelledby="pdp-left-tab-notes" hidden={leftTab !== 'notes'}>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 text-xs text-neutral-600 dark:text-neutral-400">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Problem Notes &amp; Reflection (Phase 3)
                </p>
                <p>
                  Per-problem Markdown notes, stuck-list bookmarks, and post-Accepted one-sentence reflections will be wired in Phase 3.
                </p>
              </div>
            </div>

            <div role="tabpanel" aria-labelledby="pdp-left-tab-submissions" hidden={leftTab !== 'submissions'}>
              <SubmissionsPanel
                submissions={submissions}
                currentCode={code}
                onRestoreCode={(restored) => {
                  setCode(restored);
                  setErrorLine(null);
                }}
              />
            </div>
          </div>
        </section>

        {/* Desktop Vertical Resizer */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize problem description and editor panes"
          aria-valuemin={25}
          aria-valuemax={70}
          aria-valuenow={Math.round(leftWidthPct)}
          tabIndex={0}
          onPointerDown={handleVerticalDividerPointerDown}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setLeftWidthPct((v) => Math.max(25, v - 2));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              setLeftWidthPct((v) => Math.min(70, v + 2));
            }
          }}
          className="hidden lg:flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-neutral-100 dark:bg-[#131316] hover:bg-neutral-300 dark:hover:bg-neutral-700 border-x border-neutral-200 dark:border-neutral-800 transition-colors"
        >
          <span className="w-0.5 h-8 rounded bg-neutral-400 dark:bg-neutral-600" aria-hidden="true" />
        </div>

        {/* Right Pane: Editor (top) + Resizer + Bottom Results/Output */}
        <div
          ref={rightPaneRef}
          className={`flex-1 min-w-0 min-h-0 flex flex-col ${
            mobileTab === 'problem' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Code Editor Top */}
          <div
            style={{ ['--top-pane-height' as string]: `${topHeightPct}%` }}
            className={`lg:h-[var(--top-pane-height)] min-h-[280px] lg:min-h-0 flex flex-col ${
              mobileTab === 'code' ? 'flex-1 flex' : 'hidden lg:flex'
            }`}
          >
            <ProblemEditor
              code={code}
              onChange={handleCodeChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
              onResetConfirm={handleResetConfirm}
              running={running}
              runtimeStatus={runtimeStatus}
              errorLine={errorLine}
              fontSize={fontSize}
              onFontSizeChange={(sz) => {
                setFontSize(sz);
                saveSetting('editorFontSize', sz).catch(() => {});
              }}
              editorTheme={editorTheme}
              onEditorThemeChange={(mode) => {
                setEditorTheme(mode);
                saveSetting('editorTheme', mode).catch(() => {});
              }}
              ligatures={ligatures}
              onLigaturesChange={(enabled) => {
                setLigatures(enabled);
                saveSetting('editorLigatures', enabled).catch(() => {});
              }}
              draftSavedAt={draftSavedAt}
            />
          </div>

          {/* Desktop Horizontal Resizer */}
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize code editor and results panel"
            aria-valuemin={30}
            aria-valuemax={80}
            aria-valuenow={Math.round(topHeightPct)}
            tabIndex={0}
            onPointerDown={handleHorizontalDividerPointerDown}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setTopHeightPct((v) => Math.max(30, v - 2));
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setTopHeightPct((v) => Math.min(80, v + 2));
              }
            }}
            className="hidden lg:flex h-1.5 shrink-0 cursor-row-resize items-center justify-center bg-neutral-100 dark:bg-[#131316] hover:bg-neutral-300 dark:hover:bg-neutral-700 border-y border-neutral-200 dark:border-neutral-800 transition-colors"
          >
            <span className="h-0.5 w-8 rounded bg-neutral-400 dark:bg-neutral-600" aria-hidden="true" />
          </div>

          {/* Bottom Panel */}
          <div
            className={`flex-1 min-h-[240px] lg:min-h-0 flex flex-col ${
              mobileTab === 'tests' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <TestResultsPanel
              activeTab={bottomTab}
              onTabChange={setBottomTab}
              spec={spec}
              suiteResult={suiteResult}
              liveResults={liveResults}
              running={running}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              onRunCustom={handleRunCustom}
              customResult={customResult}
              revealedHiddenIndices={revealedHiddenIndices}
              onRevealHiddenCase={handleRevealHiddenCase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
