import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  CheckCircle2,
  CircleDot,
  Clock,
  Code2,
  Flame,
  RefreshCw,
  Shuffle,
  Sparkles,
  Target,
} from 'lucide-react';
import plansData from '../../content/plans.json';
import { getAllModules } from '../../content/loader';
import { getAllProblemMeta } from '../../content/problemLoader';
import {
  db,
  getSetting,
  saveSetting,
  type ProblemProgressRecord,
  type ReviewQueueRecord,
  type StreakRecord,
  type SubmissionRecord,
} from '../../db/database';
import { calculateSm2 } from '../flashcards/sm2';
import type { ProblemDifficulty, ProblemMeta } from '../../types/problem';

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  problemIds: string[];
}

type SortKey = 'id' | 'title' | 'difficulty' | 'status' | 'estimatedMinutes' | 'attempts';
type SortDir = 'ascending' | 'descending';
type StatusFilter = 'all' | 'unsolved' | 'attempted' | 'solved' | 'solved-unaided' | 'due' | 'bookmarked';

const DIFFICULTY_RANK: Record<ProblemDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  challenge: 4,
};

const TIER_TOTALS: Array<{ key: ProblemDifficulty; label: string; catalogTotal: number }> = [
  { key: 'easy', label: 'Easy', catalogTotal: 30 },
  { key: 'medium', label: 'Medium', catalogTotal: 40 },
  { key: 'hard', label: 'Hard', catalogTotal: 20 },
  { key: 'challenge', label: 'Challenge', catalogTotal: 10 },
];

const DIFFICULTY_BADGE: Record<ProblemDifficulty, string> = {
  easy: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
  medium: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
  hard: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
  challenge: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/80',
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function ProblemListPage() {
  const navigate = useNavigate();
  const problems = useMemo(() => getAllProblemMeta(), []);
  const problemMap = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);
  const plans = plansData as StudyPlan[];
  const modules = useMemo(() => getAllModules(), []);

  const [progressMap, setProgressMap] = useState<Map<string, ProblemProgressRecord>>(new Map());
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [reviewMap, setReviewMap] = useState<Map<string, ReviewQueueRecord>>(new Map());
  const [bookmarkSet, setBookmarkSet] = useState<Set<string>>(new Set());
  const [streaks, setStreaks] = useState<StreakRecord[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>('');

  // Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | ProblemDifficulty>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('ascending');
  const [liveMsg, setLiveMsg] = useState('');

  const searchInputId = useId();
  const diffSelectId = useId();
  const tagSelectId = useId();
  const statusSelectId = useId();
  const modSelectId = useId();
  const tableCaptionId = useId();

  const todayIso = new Date().toISOString().slice(0, 10);

  const loadData = () => {
    Promise.all([
      db.problemProgress.toArray(),
      db.submissions.toArray(),
      db.reviewQueue.toArray(),
      db.bookmarks.toArray(),
      db.streaks.toArray(),
      getSetting<string>('activeStudyPlan', ''),
    ])
      .then(([progRows, subRows, revRows, bmRows, streakRows, planPref]) => {
        setProgressMap(new Map(progRows.map((r) => [r.problemId, r])));
        setSubmissions(subRows);
        setReviewMap(new Map(revRows.map((r) => [r.problemId, r])));
        setBookmarkSet(
          new Set(bmRows.filter((b) => Boolean(b.problemId)).map((b) => b.problemId as string))
        );
        setStreaks(streakRows);
        setActivePlanId(planPref || '');
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    const onUpdate = () => loadData();
    window.addEventListener('pdp-progress-updated', onUpdate);
    return () => window.removeEventListener('pdp-progress-updated', onUpdate);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of problems) {
      for (const t of p.tags) set.add(t);
    }
    return Array.from(set).sort((a, b) => collator.compare(a, b));
  }, [problems]);

  const activePlan = useMemo(
    () => plans.find((pl) => pl.id === activePlanId) ?? null,
    [plans, activePlanId]
  );

  // Due review queue items
  const dueReviewItems = useMemo(() => {
    const due: Array<{ meta: ProblemMeta; rev: ReviewQueueRecord }> = [];
    for (const [problemId, rev] of reviewMap.entries()) {
      if (rev.dueDate <= todayIso) {
        const meta = problemMap.get(problemId);
        if (meta) due.push({ meta, rev });
      }
    }
    return due.sort((a, b) => a.rev.dueDate.localeCompare(b.rev.dueDate));
  }, [reviewMap, problemMap, todayIso]);

  // Stats computation
  const stats = useMemo(() => {
    const solvedProgs = problems
      .map((p) => progressMap.get(p.id))
      .filter((r): r is ProblemProgressRecord => r?.status === 'solved');

    const solvedCount = solvedProgs.length;
    const unaidedCount = solvedProgs.filter((r) => r.solvedUnaided).length;
    const pctUnaided = solvedCount > 0 ? Math.round((unaidedCount / solvedCount) * 100) : 0;

    const avgAttempts =
      solvedCount > 0
        ? (solvedProgs.reduce((acc, r) => acc + r.attempts, 0) / solvedCount).toFixed(1)
        : '0.0';

    const allWithTime = Array.from(progressMap.values()).filter((r) => r.timeSpentSeconds > 0);
    const totalSeconds = allWithTime.reduce((acc, r) => acc + r.timeSpentSeconds, 0);
    const avgMinutes =
      allWithTime.length > 0 ? (totalSeconds / allWithTime.length / 60).toFixed(1) : '0.0';

    const streakDays = streaks.filter((s) => s.exercisesCompleted > 0 || s.minutes > 0).length;

    const perTierSolved: Record<ProblemDifficulty, { solved: number; authored: number }> = {
      easy: { solved: 0, authored: 0 },
      medium: { solved: 0, authored: 0 },
      hard: { solved: 0, authored: 0 },
      challenge: { solved: 0, authored: 0 },
    };
    const perTag = new Map<string, { solved: number; total: number; attempts: number }>();

    for (const p of problems) {
      perTierSolved[p.difficulty].authored++;
      const prog = progressMap.get(p.id);
      const isSolved = prog?.status === 'solved';
      if (isSolved) perTierSolved[p.difficulty].solved++;
      for (const t of p.tags) {
        const cur = perTag.get(t) ?? { solved: 0, total: 0, attempts: 0 };
        cur.total++;
        if (isSolved) cur.solved++;
        cur.attempts += prog?.attempts ?? 0;
        perTag.set(t, cur);
      }
    }

    return {
      solvedCount,
      pctUnaided,
      avgAttempts,
      avgMinutes,
      streakDays,
      perTierSolved,
      tagRows: Array.from(perTag.entries()).sort((a, b) => collator.compare(a[0], b[0])),
    };
  }, [problems, progressMap, streaks]);

  // 84-day (12-week) activity heatmap combining streaks and Problem Solver submissions
  const heatmapDays = useMemo(() => {
    const countsByDate = new Map<string, number>();
    for (const s of streaks) {
      countsByDate.set(s.date, (countsByDate.get(s.date) ?? 0) + s.exercisesCompleted);
    }
    for (const sub of submissions) {
      const day = sub.timestamp.slice(0, 10);
      countsByDate.set(day, (countsByDate.get(day) ?? 0) + 1);
    }

    const cells: Array<{ date: string; count: number }> = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      cells.push({ date: iso, count: countsByDate.get(iso) ?? 0 });
    }
    return cells;
  }, [streaks, submissions]);

  // Next suggested problem: active plan first, otherwise weakest tag
  const nextSuggestion = useMemo(() => {
    if (activePlan) {
      for (const pid of activePlan.problemIds) {
        const meta = problemMap.get(pid);
        if (meta && progressMap.get(pid)?.status !== 'solved') {
          return {
            meta,
            reason: `Next unsolved problem in "${activePlan.title}" study plan`,
          };
        }
      }
    }

    // Weakest tag heuristic: lowest solve ratio among tags with unsolved authored problems
    let bestTag = '';
    let lowestRatio = 2;
    for (const [tag, data] of stats.tagRows) {
      if (data.solved < data.total) {
        const ratio = data.solved / data.total;
        if (ratio < lowestRatio) {
          lowestRatio = ratio;
          bestTag = tag;
        }
      }
    }
    if (bestTag) {
      const candidate = problems.find(
        (p) => p.tags.includes(bestTag) && progressMap.get(p.id)?.status !== 'solved'
      );
      if (candidate) {
        return {
          meta: candidate,
          reason: `Builds coverage in "${bestTag}" (currently ${stats.tagRows.find(([t]) => t === bestTag)?.[1].solved ?? 0} solved)`,
        };
      }
    }

    const fallback = problems.find((p) => progressMap.get(p.id)?.status !== 'solved');
    return fallback
      ? { meta: fallback, reason: 'Next unsolved practice problem' }
      : null;
  }, [activePlan, problemMap, progressMap, stats.tagRows, problems]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const planSet = activePlan ? new Set(activePlan.problemIds) : null;

    const list = problems.filter((p) => {
      if (planSet && !planSet.has(p.id)) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (tagFilter !== 'all' && !p.tags.includes(tagFilter)) return false;
      if (moduleFilter !== 'all' && !p.relatedModules.includes(moduleFilter)) return false;

      const prog = progressMap.get(p.id);
      const status = prog?.status ?? 'unsolved';
      if (statusFilter === 'unsolved' && status !== 'unsolved') return false;
      if (statusFilter === 'attempted' && status !== 'attempted') return false;
      if (statusFilter === 'solved' && status !== 'solved') return false;
      if (statusFilter === 'solved-unaided' && !(status === 'solved' && prog?.solvedUnaided)) return false;
      if (statusFilter === 'bookmarked' && !bookmarkSet.has(p.id)) return false;
      if (statusFilter === 'due') {
        const rev = reviewMap.get(p.id);
        if (!rev || rev.dueDate > todayIso) return false;
      }

      if (q) {
        const hay = `${p.id} ${p.title} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const factor = sortDir === 'ascending' ? 1 : -1;
    const statusOrder = (pid: string): number => {
      const pr = progressMap.get(pid);
      if (!pr || pr.status === 'unsolved') return 0;
      if (pr.status === 'attempted') return 1;
      return pr.solvedUnaided ? 3 : 2;
    };

    return [...list].sort((a, b) => {
      if (sortKey === 'id') return factor * collator.compare(a.id, b.id);
      if (sortKey === 'title') return factor * collator.compare(a.title, b.title);
      if (sortKey === 'difficulty') {
        return factor * (DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);
      }
      if (sortKey === 'status') {
        return factor * (statusOrder(a.id) - statusOrder(b.id));
      }
      if (sortKey === 'estimatedMinutes') {
        return factor * (a.estimatedMinutes - b.estimatedMinutes);
      }
      if (sortKey === 'attempts') {
        const aa = progressMap.get(a.id)?.attempts ?? 0;
        const ab = progressMap.get(b.id)?.attempts ?? 0;
        return factor * (aa - ab);
      }
      return 0;
    });
  }, [
    problems,
    activePlan,
    difficultyFilter,
    tagFilter,
    moduleFilter,
    statusFilter,
    searchQuery,
    progressMap,
    bookmarkSet,
    reviewMap,
    todayIso,
    sortKey,
    sortDir,
  ]);

  const handleSort = (key: SortKey, label: string) => {
    const nextDir: SortDir =
      sortKey === key ? (sortDir === 'ascending' ? 'descending' : 'ascending') : 'ascending';
    setSortKey(key);
    setSortDir(nextDir);
    setLiveMsg(`Sorted problems by ${label}, ${nextDir}, ${filteredAndSorted.length} rows.`);
  };

  const handleSelectPlan = (planId: string) => {
    const next = activePlanId === planId ? '' : planId;
    setActivePlanId(next);
    saveSetting('activeStudyPlan', next).catch(() => {});
  };

  const handleRandomUnsolved = () => {
    const pool = filteredAndSorted.filter((p) => progressMap.get(p.id)?.status !== 'solved');
    const sourcePool =
      pool.length > 0 ? pool : problems.filter((p) => progressMap.get(p.id)?.status !== 'solved');
    const targetPool = sourcePool.length > 0 ? sourcePool : problems;
    if (targetPool.length === 0) return;
    const chosen = targetPool[Math.floor(Math.random() * targetPool.length)];
    navigate(`/problems/${chosen.slug}`);
  };

  const handleQuickReviewRate = async (problemId: string, quality: 3 | 4 | 5) => {
    const existing = reviewMap.get(problemId);
    const res = calculateSm2(
      existing ?? { ease: 2.5, intervalDays: 0, repetitions: 0 },
      quality
    );
    await db.reviewQueue.put({ problemId, ...res });
    window.dispatchEvent(new Event('pdp-progress-updated'));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
            Practice // Problem Solver
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            Problem Solver
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Original IS-flavored Python problems running locally in Pyodide with timed hints, reference solutions, and SM-2 spaced review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomUnsolved}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            Random unsolved
          </button>
          <Link
            to="/exam"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200"
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Timed Exam
          </Link>
        </div>
      </header>

      {/* Tier Stats & KPI Overview */}
      <section aria-label="Problem solver progress overview" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIER_TOTALS.map((tier) => {
              const tierStat = stats.perTierSolved[tier.key];
              const pct = Math.min(100, Math.round((tierStat.solved / tier.catalogTotal) * 100));
              return (
                <div
                  key={tier.key}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">{tier.label}</span>
                    <span className="tabular-nums text-neutral-500">
                      {tierStat.solved} / {tier.catalogTotal}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full"
                    />
                  </div>
                  <div className="font-mono text-[10px] text-neutral-400">
                    {tierStat.authored} available now
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
            <div>
              <span className="block font-mono text-[10px] uppercase text-neutral-400">Total Solved</span>
              <span className="text-base font-semibold tabular-nums text-neutral-950 dark:text-white">
                {stats.solvedCount} / {problems.length}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-neutral-400">Solved Unaided</span>
              <span className="text-base font-semibold tabular-nums text-neutral-950 dark:text-white">
                {stats.pctUnaided}%
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-neutral-400">Avg Attempts</span>
              <span className="text-base font-semibold tabular-nums text-neutral-950 dark:text-white">
                {stats.avgAttempts}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[10px] uppercase text-neutral-400">Avg Time / Streak</span>
              <span className="text-base font-semibold tabular-nums text-neutral-950 dark:text-white inline-flex items-center gap-1.5">
                {stats.avgMinutes}m
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                  {stats.streakDays}d
                </span>
              </span>
            </div>
          </div>

          {/* Per-tag mini badges */}
          {stats.tagRows.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              {stats.tagRows.map(([tag, data]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter((cur) => (cur === tag ? 'all' : tag))}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    tagFilter === tag
                      ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-neutral-600 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {tag}: {data.solved}/{data.total}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next Suggested Card + 84-day Heatmap */}
        <div className="space-y-4">
          {nextSuggestion && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  Suggestion // Next Problem
                </span>
                <span
                  className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                    DIFFICULTY_BADGE[nextSuggestion.meta.difficulty]
                  }`}
                >
                  {nextSuggestion.meta.difficulty}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                {nextSuggestion.meta.id}: {nextSuggestion.meta.title}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {nextSuggestion.reason}
              </p>
              <Link
                to={`/problems/${nextSuggestion.meta.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                Open Suggested Problem
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                84-Day Activity Heatmap
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                {submissions.length} problem submits
              </span>
            </div>
            <div
              className="grid grid-cols-14 gap-1"
              role="img"
              aria-label="84 day practice activity heatmap"
            >
              {heatmapDays.map((cell) => {
                const intensity =
                  cell.count === 0
                    ? 'bg-neutral-100 dark:bg-neutral-800/70'
                    : cell.count === 1
                      ? 'bg-emerald-200 dark:bg-emerald-900'
                      : cell.count <= 3
                        ? 'bg-emerald-400 dark:bg-emerald-700'
                        : 'bg-emerald-600 dark:bg-emerald-500';
                return (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count} activity item${cell.count === 1 ? '' : 's'}`}
                    className={`h-2.5 rounded-[2px] ${intensity}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Due Review Queue Banner */}
      {dueReviewItems.length > 0 && (
        <section
          aria-label="Spaced repetition review queue"
          className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-2.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Due for Spaced Review Today ({dueReviewItems.length})
            </h2>
            <span className="font-mono text-[10px] text-amber-800 dark:text-amber-300">
              SM-2 scheduling from flashcards
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dueReviewItems.map(({ meta, rev }) => (
              <div
                key={meta.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-[#0d0d0f] px-3 py-2 text-xs"
              >
                <Link
                  to={`/problems/${meta.slug}`}
                  className="font-medium text-neutral-950 dark:text-white hover:underline"
                >
                  {meta.id}: {meta.title}
                </Link>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-neutral-400 mr-1">
                    {rev.intervalDays}d
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickReviewRate(meta.id, 3)}
                    className="px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 text-[10px] font-medium text-amber-900 dark:text-amber-200"
                  >
                    Hard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReviewRate(meta.id, 4)}
                    className="px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 text-[10px] font-medium text-emerald-800 dark:text-emerald-200"
                  >
                    Good
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReviewRate(meta.id, 5)}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-medium"
                  >
                    Easy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Study Plans */}
      <section aria-label="Study plans" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" aria-hidden="true" />
            Study Plans (click to filter)
          </h2>
          {activePlan && (
            <button
              type="button"
              onClick={() => handleSelectPlan('')}
              className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Clear active plan
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {plans.map((plan) => {
            const isSelected = activePlanId === plan.id;
            const availableIds = plan.problemIds.filter((id) => problemMap.has(id));
            const planSolved = availableIds.filter((id) => progressMap.get(id)?.status === 'solved').length;
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPlan(plan.id)}
                className={`text-left rounded-lg border p-3 transition-colors space-y-1.5 ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{plan.title}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isSelected ? 'opacity-80' : 'text-neutral-500'
                    }`}
                  >
                    {planSolved}/{plan.problemIds.length}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-4 line-clamp-2 ${
                    isSelected ? 'opacity-85' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {plan.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Filters */}
      <search>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-3.5"
        >
          <div className="space-y-1">
            <label htmlFor={searchInputId} className="block font-mono text-[10px] uppercase text-neutral-500">
              Search
            </label>
            <input
              id={searchInputId}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Title, ID, or tag..."
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={diffSelectId} className="block font-mono text-[10px] uppercase text-neutral-500">
              Difficulty
            </label>
            <select
              id={diffSelectId}
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'all' | ProblemDifficulty)}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs"
            >
              <option value="all">All tiers</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor={tagSelectId} className="block font-mono text-[10px] uppercase text-neutral-500">
              Tag
            </label>
            <select
              id={tagSelectId}
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs"
            >
              <option value="all">All tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor={statusSelectId} className="block font-mono text-[10px] uppercase text-neutral-500">
              Status
            </label>
            <select
              id={statusSelectId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs"
            >
              <option value="all">All statuses</option>
              <option value="unsolved">Unsolved</option>
              <option value="attempted">Attempted</option>
              <option value="solved">Solved</option>
              <option value="solved-unaided">Solved unaided</option>
              <option value="bookmarked">Bookmarked / Stuck</option>
              <option value="due">Due for SM-2 review</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor={modSelectId} className="block font-mono text-[10px] uppercase text-neutral-500">
              Related Lesson Module
            </label>
            <select
              id={modSelectId}
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] text-xs"
            >
              <option value="all">All modules</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </form>
      </search>

      {/* Accessible Sortable Table */}
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={tableCaptionId}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto"
      >
        <table className="w-full min-w-[680px] text-left text-xs border-collapse">
          <caption id={tableCaptionId} className="sr-only">
            Filterable and sortable coding problems list ({filteredAndSorted.length} showing)
          </caption>
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <th scope="col" aria-sort={sortKey === 'status' ? sortDir : undefined} className="p-0">
                <button
                  type="button"
                  onClick={() => handleSort('status', 'Status')}
                  className="w-full px-4 py-3 text-left flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white min-h-6"
                >
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortKey === 'id' ? sortDir : undefined} className="p-0">
                <button
                  type="button"
                  onClick={() => handleSort('id', 'ID')}
                  className="w-full px-4 py-3 text-left flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white min-h-6"
                >
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortKey === 'title' ? sortDir : undefined} className="p-0">
                <button
                  type="button"
                  onClick={() => handleSort('title', 'Title')}
                  className="w-full px-4 py-3 text-left flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white min-h-6"
                >
                  <span>Title</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortKey === 'difficulty' ? sortDir : undefined} className="p-0">
                <button
                  type="button"
                  onClick={() => handleSort('difficulty', 'Difficulty')}
                  className="w-full px-4 py-3 text-left flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white min-h-6"
                >
                  <span>Difficulty</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                Tags
              </th>
              <th scope="col" aria-sort={sortKey === 'estimatedMinutes' ? sortDir : undefined} className="p-0">
                <button
                  type="button"
                  onClick={() => handleSort('estimatedMinutes', 'Estimated time')}
                  className="w-full px-4 py-3 text-right flex items-center justify-end gap-1 hover:text-neutral-900 dark:hover:text-white min-h-6"
                >
                  <span>Est.</span>
                  <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                  No matching problems found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((p) => {
                const prog = progressMap.get(p.id);
                const status = prog?.status ?? 'unsolved';
                const isBookmarked = bookmarkSet.has(p.id);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {status === 'solved' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          {prog?.solvedUnaided ? 'Solved unaided' : 'Solved'}
                        </span>
                      ) : status === 'attempted' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                          <CircleDot className="w-3.5 h-3.5" aria-hidden="true" />
                          Attempted
                        </span>
                      ) : (
                        <span className="text-neutral-400">Unsolved</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {p.id}
                        {isBookmarked && (
                          <Bookmark className="w-3 h-3 text-amber-500" aria-label="Bookmarked" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/problems/${p.slug}`}
                        className="font-medium text-neutral-950 dark:text-white hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{p.title}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                          DIFFICULTY_BADGE[p.difficulty]
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {p.estimatedMinutes}m
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p role="status" className="visually-hidden">
        {liveMsg}
      </p>
    </div>
  );
}
