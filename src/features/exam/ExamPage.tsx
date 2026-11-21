import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  Lock,
  Play,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import plansData from '../../content/plans.json';
import { getAllProblemMeta, loadProblemWorkspaceBundle } from '../../content/problemLoader';
import {
  db,
  getSetting,
  recordProblemSubmission,
  saveSetting,
  type ExamSessionRecord,
  type SubmissionRecord,
} from '../../db/database';
import { gradeProblem } from '../../runtime/grader';
import { pyodideRunner, type CustomRunResult } from '../../runtime/runner';
import type {
  ProblemMeta,
  ProblemSpec,
  ProblemSuiteResult,
  ProblemTestResult,
  ProblemVerdict,
} from '../../types/problem';
import { ProblemEditor, type EditorThemeMode } from '../problems/ProblemEditor';
import { SubmissionsPanel } from '../problems/SubmissionsPanel';
import { TestResultsPanel, type BottomPanelTab } from '../problems/TestResultsPanel';

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  problemIds: string[];
}

interface LoadedExamProblem {
  meta: ProblemMeta;
  spec: ProblemSpec;
  statement: string;
  starterCode: string;
  checkerCode?: string;
}

type ExamPhase = 'setup' | 'active' | 'summary';

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ExamPage() {
  const allProblems = useMemo(() => getAllProblemMeta(), []);
  const plans = plansData as StudyPlan[];

  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    allProblems.slice(0, Math.min(4, allProblems.length)).map((p) => p.id)
  );
  const [limitMinutes, setLimitMinutes] = useState<number>(30);
  const [pastSessions, setPastSessions] = useState<ExamSessionRecord[]>([]);

  // Active exam state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startedAtIso, setStartedAtIso] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(1800);
  const [examBundles, setExamBundles] = useState<LoadedExamProblem[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState<number>(0);
  const [codeByProblem, setCodeByProblem] = useState<Record<string, string>>({});
  const [scoresByProblem, setScoresByProblem] = useState<
    Record<string, { verdict: ProblemVerdict; passed: number; total: number }>
  >({});
  const [subsByProblem, setSubsByProblem] = useState<Record<string, SubmissionRecord[]>>({});

  // Workspace tabs & runner inside exam
  const [leftTab, setLeftTab] = useState<'description' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>('tests');
  const [running, setRunning] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'loading' | 'running' | 'ready'>('idle');
  const [suiteByProblem, setSuiteByProblem] = useState<Record<string, ProblemSuiteResult | null>>({});
  const [liveResults, setLiveResults] = useState<ProblemTestResult[]>([]);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customResult, setCustomResult] = useState<CustomRunResult | null>(null);

  // Editor preferences
  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState<EditorThemeMode>('system');
  const [ligatures, setLigatures] = useState(false);

  const durationInputId = useId();
  const limitSeconds = limitMinutes * 60;

  useEffect(() => {
    return pyodideRunner.subscribeStatus(setRuntimeStatus);
  }, []);

  useEffect(() => {
    db.examSessions
      .reverse()
      .toArray()
      .then(setPastSessions)
      .catch(() => {});

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

  const finishExam = useCallback(
    async (finalScores?: Record<string, { verdict: ProblemVerdict; passed: number; total: number }>) => {
      const endedIso = new Date().toISOString();
      const usedScores = finalScores ?? scoresByProblem;
      if (sessionId !== null) {
        await db.examSessions.update(sessionId, {
          endedAt: endedIso,
          scores: usedScores,
        });
      }
      const updated = await db.examSessions.reverse().toArray();
      setPastSessions(updated);
      setPhase('summary');
    },
    [scoresByProblem, sessionId]
  );

  // Countdown tick while exam active
  useEffect(() => {
    if (phase !== 'active') return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          finishExam().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, finishExam]);

  const applyPresetPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const availSet = new Set(allProblems.map((p) => p.id));
    const matching = plan.problemIds.filter((id) => availSet.has(id)).slice(0, 5);
    if (matching.length > 0) setSelectedIds(matching);
  };

  const applyBalancedMix = () => {
    const pick: string[] = [];
    for (const tier of ['easy', 'medium', 'hard'] as const) {
      const tierItems = allProblems.filter((p) => p.difficulty === tier);
      if (tierItems[0]) pick.push(tierItems[0].id);
      if (tier === 'easy' && tierItems[1]) pick.push(tierItems[1].id);
    }
    if (pick.length > 0) setSelectedIds(pick);
  };

  const toggleProblemPick = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startExam = async () => {
    if (selectedIds.length === 0) return;
    const loaded: LoadedExamProblem[] = [];
    for (const pid of selectedIds) {
      const meta = allProblems.find((p) => p.id === pid);
      if (!meta) continue;
      const b = await loadProblemWorkspaceBundle(meta.slug);
      if (b) {
        loaded.push(b);
      }
    }
    if (loaded.length === 0) return;

    const initialCode: Record<string, string> = {};
    for (const item of loaded) {
      initialCode[item.spec.id] = item.starterCode;
    }

    const startIso = new Date().toISOString();
    const newId = await db.examSessions.add({
      problemIds: loaded.map((l) => l.spec.id),
      startedAt: startIso,
      endedAt: null,
      limitSeconds,
      scores: {},
    });

    setSessionId(typeof newId === 'number' ? newId : null);
    setStartedAtIso(startIso);
    setExamBundles(loaded);
    setActiveProblemIdx(0);
    setCodeByProblem(initialCode);
    setScoresByProblem({});
    setSubsByProblem({});
    setSuiteByProblem({});
    setLiveResults([]);
    setCustomResult(null);
    setErrorLine(null);
    setSecondsLeft(limitSeconds);
    setLeftTab('description');
    setBottomTab('tests');
    setPhase('active');
  };

  const activeProblem = examBundles[activeProblemIdx];
  const activeCode = activeProblem ? codeByProblem[activeProblem.spec.id] ?? activeProblem.starterCode : '';
  const activeSuite = activeProblem ? suiteByProblem[activeProblem.spec.id] ?? null : null;

  const handleRun = async () => {
    if (!activeProblem || running) return;
    setRunning(true);
    setErrorLine(null);
    setBottomTab('tests');
    try {
      const res = await gradeProblem({
        code: activeCode,
        spec: activeProblem.spec,
        mode: 'run',
        checkerCode: activeProblem.checkerCode,
        onTestProgress: setLiveResults,
      });
      setSuiteByProblem((prev) => ({ ...prev, [activeProblem.spec.id]: res }));
      setErrorLine(res.errorLine ?? null);
      if (res.verdict === 'Syntax Error' || res.verdict === 'Runtime Error') {
        setBottomTab('output');
      }
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeProblem || running) return;
    setRunning(true);
    setErrorLine(null);
    setBottomTab('tests');
    try {
      const res = await gradeProblem({
        code: activeCode,
        spec: activeProblem.spec,
        mode: 'submit',
        checkerCode: activeProblem.checkerCode,
        onTestProgress: setLiveResults,
      });
      setSuiteByProblem((prev) => ({ ...prev, [activeProblem.spec.id]: res }));
      setErrorLine(res.errorLine ?? null);
      if (res.verdict === 'Syntax Error' || res.verdict === 'Runtime Error') {
        setBottomTab('output');
      }

      const pid = activeProblem.spec.id;
      await recordProblemSubmission({
        problemId: pid,
        verdict: res.verdict,
        passed: res.passed,
        total: res.total,
        runtimeMs: res.runtimeMs,
        code: activeCode,
        mode: 'exam',
        durationSeconds: 1,
      });

      const updatedSubs = await db.submissions
        .where('problemId')
        .equals(pid)
        .reverse()
        .sortBy('timestamp');
      setSubsByProblem((prev) => ({ ...prev, [pid]: updatedSubs }));

      const nextScores = {
        ...scoresByProblem,
        [pid]: {
          verdict: res.verdict,
          passed: res.passed,
          total: res.total,
        },
      };
      setScoresByProblem(nextScores);
      if (sessionId !== null) {
        await db.examSessions.update(sessionId, { scores: nextScores });
      }
      window.dispatchEvent(new Event('pdp-progress-updated'));
    } finally {
      setRunning(false);
    }
  };

  const handleRunCustom = async () => {
    if (!activeProblem || running) return;
    setRunning(true);
    try {
      const cRes = await pyodideRunner.runProblemCustom({
        code: activeCode,
        entry: activeProblem.spec.entry,
        customInput,
      });
      setCustomResult(cRes);
      if (cRes.errorLine) setErrorLine(cRes.errorLine);
    } finally {
      setRunning(false);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
            Assessment // Timed Exam Mode
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            Timed Exam Simulation
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Practice solving under time pressure. Progressive hints, reference explanations, execution visualizer, and the open REPL terminal are disabled during active exams.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Left */}
          <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                1. Pick Problem Set ({selectedIds.length} selected)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={applyBalancedMix}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-[11px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Balanced Mix
                </button>
                {plans.slice(0, 3).map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => applyPresetPlan(pl.id)}
                    className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-[11px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {pl.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              {allProblems.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-xs"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProblemPick(p.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
                      />
                      <span className="font-mono text-neutral-500">{p.id}</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {p.title}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] uppercase text-neutral-500 shrink-0">
                      {p.difficulty} · {p.estimatedMinutes}m
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Start Card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                2. Exam Parameters
              </h2>

              <div className="space-y-1.5">
                <label htmlFor={durationInputId} className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Time limit (minutes)
                </label>
                <select
                  id={durationInputId}
                  value={limitMinutes}
                  onChange={(e) => setLimitMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs font-mono"
                >
                  <option value={15}>15 minutes (Sprint)</option>
                  <option value={30}>30 minutes (Standard)</option>
                  <option value={45}>45 minutes (IS Mid-Set)</option>
                  <option value={60}>60 minutes (Full Drill)</option>
                  <option value={90}>90 minutes (Extended)</option>
                </select>
              </div>

              <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Exam Rules Active
                </div>
                <p>Hints, Explanation, Visualizer, and REPL Terminal are locked until you finish.</p>
              </div>

              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={startExam}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Start Timed Exam ({selectedIds.length} problems)
              </button>
            </div>
          </div>
        </div>

        {/* Past Exam Sessions */}
        {pastSessions.length > 0 && (
          <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Past Exam Sessions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 font-mono text-[10px] uppercase text-neutral-500">
                    <th scope="col" className="py-2 pr-4">Started</th>
                    <th scope="col" className="py-2 pr-4">Problems</th>
                    <th scope="col" className="py-2 pr-4">Accepted</th>
                    <th scope="col" className="py-2">Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {pastSessions.slice(0, 10).map((s) => {
                    const accepted = Object.values(s.scores).filter(
                      (v) => v.verdict === 'Accepted'
                    ).length;
                    return (
                      <tr key={s.id ?? s.startedAt}>
                        <td className="py-2 pr-4 font-mono text-neutral-600 dark:text-neutral-300">
                          {new Date(s.startedAt).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4 font-mono">{s.problemIds.join(', ')}</td>
                        <td className="py-2 pr-4 font-mono tabular-nums font-semibold">
                          {accepted} / {s.problemIds.length}
                        </td>
                        <td className="py-2 font-mono text-neutral-500">
                          {Math.round(s.limitSeconds / 60)} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    );
  }

  if (phase === 'summary') {
    const solvedInExam = examBundles.filter(
      (b) => scoresByProblem[b.spec.id]?.verdict === 'Accepted'
    ).length;
    const elapsedUsed = Math.max(0, limitSeconds - secondsLeft);

    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <header className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              Exam Complete
            </p>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
              Score: {solvedInExam} / {examBundles.length} Accepted
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Time used: {formatCountdown(elapsedUsed)} of {formatCountdown(limitSeconds)} · Started{' '}
              {new Date(startedAtIso).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Configure Another Exam
            </button>
            <Link
              to="/problems"
              className="px-4 py-2 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold"
            >
              Back to Problem List
            </Link>
          </div>
        </header>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Per-problem exam results summary</caption>
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] font-mono text-[10px] uppercase text-neutral-500">
                <th scope="col" className="px-4 py-3">Problem</th>
                <th scope="col" className="px-4 py-3">Difficulty</th>
                <th scope="col" className="px-4 py-3">Verdict</th>
                <th scope="col" className="px-4 py-3">Tests Passed</th>
                <th scope="col" className="px-4 py-3 text-right">Review Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {examBundles.map((b) => {
                const score = scoresByProblem[b.spec.id];
                return (
                  <tr key={b.spec.id}>
                    <td className="px-4 py-3 font-medium">
                      {b.spec.id}: {b.spec.title}
                    </td>
                    <td className="px-4 py-3 font-mono uppercase text-[10px]">
                      {b.spec.difficulty}
                    </td>
                    <td className="px-4 py-3">
                      {score ? (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            score.verdict === 'Accepted'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {score.verdict === 'Accepted' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {score.verdict}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Not submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {score ? `${score.passed} / ${score.total}` : '0 / ' + (b.spec.tests.visible.length + b.spec.tests.hidden.length)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/problems/${b.spec.slug}`}
                        className="inline-flex items-center gap-1 text-neutral-900 dark:text-neutral-100 font-medium hover:underline"
                      >
                        Open Practice
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!activeProblem) return null;

  const urgentTime = secondsLeft <= 300;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden bg-white dark:bg-[#09090b]">
      {/* Active Exam Top Bar */}
      <header className="shrink-0 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 dark:bg-[#111113]">
        <div className="flex flex-wrap items-center gap-1.5">
          {examBundles.map((b, idx) => {
            const verdict = scoresByProblem[b.spec.id]?.verdict;
            const current = idx === activeProblemIdx;
            return (
              <button
                key={b.spec.id}
                type="button"
                onClick={() => {
                  setActiveProblemIdx(idx);
                  setLiveResults([]);
                  setCustomResult(null);
                  setErrorLine(null);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs transition-colors ${
                  current
                    ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {verdict === 'Accepted' && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                )}
                <span>{b.spec.id}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] uppercase text-neutral-500"
            title="Hints, Explanations, Visualizer, and Terminal are disabled during exams"
          >
            <Lock className="w-3 h-3" aria-hidden="true" />
            Exam Lockdown
          </span>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs tabular-nums font-semibold ${
              urgentTime
                ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100'
            }`}
            aria-label={`Time remaining ${formatCountdown(secondsLeft)}`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {formatCountdown(secondsLeft)}
          </div>

          <button
            type="button"
            onClick={() => finishExam()}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            <Flag className="w-3.5 h-3.5" aria-hidden="true" />
            Finish Exam
          </button>
        </div>
      </header>

      {/* Split Workspace */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <section className="lg:w-[42%] flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113]">
            <button
              type="button"
              onClick={() => setLeftTab('description')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 ${
                leftTab === 'description'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('submissions')}
              className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 ${
                leftTab === 'submissions'
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              Exam Submissions ({(subsByProblem[activeProblem.spec.id] ?? []).length})
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5 text-sm leading-7 text-neutral-800 dark:text-neutral-200">
            {leftTab === 'description' ? (
              <div className="space-y-4">
                <h1 className="text-lg font-semibold text-neutral-950 dark:text-white">
                  {activeProblem.spec.id}: {activeProblem.spec.title}
                </h1>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeProblem.statement}
                </ReactMarkdown>
              </div>
            ) : (
              <SubmissionsPanel
                submissions={subsByProblem[activeProblem.spec.id] ?? []}
                currentCode={activeCode}
                onRestoreCode={(restored) =>
                  setCodeByProblem((prev) => ({
                    ...prev,
                    [activeProblem.spec.id]: restored,
                  }))
                }
              />
            )}
          </div>
        </section>

        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div className="h-[56%] min-h-[240px] flex flex-col border-b border-neutral-200 dark:border-neutral-800">
            <ProblemEditor
              code={activeCode}
              onChange={(next) => {
                setCodeByProblem((prev) => ({ ...prev, [activeProblem.spec.id]: next }));
                setErrorLine(null);
              }}
              onRun={handleRun}
              onSubmit={handleSubmit}
              onResetConfirm={() =>
                setCodeByProblem((prev) => ({
                  ...prev,
                  [activeProblem.spec.id]: activeProblem.starterCode,
                }))
              }
              running={running}
              runtimeStatus={runtimeStatus}
              errorLine={errorLine}
              fontSize={fontSize}
              onFontSizeChange={(sz) => {
                setFontSize(sz);
                saveSetting('editorFontSize', sz).catch(() => {});
              }}
              editorTheme={editorTheme}
              onEditorThemeChange={(m) => {
                setEditorTheme(m);
                saveSetting('editorTheme', m).catch(() => {});
              }}
              ligatures={ligatures}
              onLigaturesChange={(en) => {
                setLigatures(en);
                saveSetting('editorLigatures', en).catch(() => {});
              }}
              examMode
            />
          </div>

          <div className="flex-1 min-h-[220px] flex flex-col">
            <TestResultsPanel
              activeTab={bottomTab}
              onTabChange={setBottomTab}
              spec={activeProblem.spec}
              suiteResult={activeSuite}
              liveResults={liveResults}
              running={running}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              onRunCustom={handleRunCustom}
              customResult={customResult}
              revealedHiddenIndices={new Set()}
              onRevealHiddenCase={() => {}}
              examMode
            />
          </div>
        </div>
      </div>
    </div>
  );
}
