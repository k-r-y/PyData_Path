import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Flame,
  Target,
  ShieldCheck,
  Bookmark,
  Trash2,
} from 'lucide-react';
import {
  db,
  type AttemptRecord,
  type BookmarkRecord,
  type MasteryRecord,
  type ProgressRecord,
  type StreakRecord,
} from '../../db/database';
import { getAllModules, getLessonsForModule } from '../../content/loader';
import { ProgressRing } from '../../components/ProgressRing';

const MASTERY_LABELS = ['Not Started', 'Practicing', 'Comfortable', 'Mastered'];

export function DashboardPage() {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [mastery, setMastery] = useState<MasteryRecord[]>([]);
  const [streaks, setStreaks] = useState<StreakRecord[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);

  const loadAll = () => {
    db.progress.toArray().then(setProgress).catch(() => {});
    db.attempts.toArray().then(setAttempts).catch(() => {});
    db.mastery.toArray().then(setMastery).catch(() => {});
    db.streaks.toArray().then(setStreaks).catch(() => {});
    db.bookmarks.toArray().then(setBookmarks).catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const modules = getAllModules();
  const completedSet = new Set(
    progress.filter((p) => p.status === 'completed').map((p) => p.lessonId)
  );
  const totalLessons = modules.reduce(
    (sum, m) => sum + getLessonsForModule(m.id).length,
    0
  );

  const passedAttempts = attempts.filter((a) => a.passed).length;
  const accuracy =
    attempts.length > 0 ? Math.round((passedAttempts / attempts.length) * 100) : 0;
  const noAiPassed = attempts.filter((a) => a.passed && a.noAiMode).length;
  const activeDays = streaks.filter(
    (s) => s.exercisesCompleted > 0 || s.minutes > 0
  ).length;
  const weakTopics = mastery.filter((m) => m.level <= 1 || m.incorrect > m.correct);

  const removeBookmark = async (id: string) => {
    await db.bookmarks.delete(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
          Telemetry // Local IndexedDB
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
          Learning Dashboard
        </h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
              Lessons Done
            </p>
            <p className="text-2xl font-semibold tabular-nums text-neutral-950 dark:text-white mt-1">
              {completedSet.size}/{totalLessons}
            </p>
          </div>
          <ProgressRing completed={completedSet.size} total={totalLessons} size={36} />
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> Active Days
          </p>
          <p className="text-2xl font-semibold tabular-nums text-neutral-950 dark:text-white mt-1">
            {activeDays}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> Accuracy
          </p>
          <p className="text-2xl font-semibold tabular-nums text-neutral-950 dark:text-white mt-1">
            {accuracy}%
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" aria-hidden="true" /> No-AI Passes
          </p>
          <p className="text-2xl font-semibold tabular-nums text-neutral-950 dark:text-white mt-1">
            {noAiPassed}
          </p>
        </div>
      </div>

      {/* Mastery & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
            Skill Mastery &amp; Weak Topics
          </h2>
          {mastery.length === 0 ? (
            <p className="text-xs text-neutral-500">
              Complete exercises to track mastery across Python and analytics concepts.
            </p>
          ) : (
            <div className="space-y-2">
              {mastery.map((m) => (
                <div
                  key={m.conceptTag}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 last:border-0"
                >
                  <span className="font-mono text-neutral-800 dark:text-neutral-200">
                    {m.conceptTag}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tabular-nums text-neutral-500">
                      {m.correct} pass / {m.incorrect} fail
                    </span>
                    <span className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-mono text-[10px] uppercase tracking-wider">
                      {MASTERY_LABELS[m.level]}
                    </span>
                  </div>
                </div>
              ))}
              {weakTopics.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
                  Focus areas: {weakTopics.map((w) => w.conceptTag).join(', ')}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Stuck List / Bookmarks */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Stuck List &amp; Bookmarks
          </h2>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-neutral-500">
              No bookmarked exercises yet. Click "Stuck" on any exercise to save it here for review.
            </p>
          ) : (
            <ul className="space-y-2">
              {bookmarks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 text-xs p-2.5 rounded-md bg-neutral-50 dark:bg-[#111113] border border-neutral-200 dark:border-neutral-800"
                >
                  <Link
                    to={`/lesson/${b.lessonId}`}
                    className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline truncate"
                  >
                    {b.reason}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeBookmark(b.id)}
                    aria-label="Remove bookmark"
                    className="p-1.5 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
