import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import { getExercisesForLesson, getLessonById } from '../content/loader';
import { LessonRenderer } from '../features/lessons/LessonRenderer';
import { ExerciseWorkspace } from '../features/exercises/ExerciseWorkspace';
import {
  db,
  markLessonCompleted,
  markLessonInProgress,
  type LessonStatus,
} from '../db/database';
import { pyodideRunner } from '../runtime/runner';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const exercises = lessonId ? getExercisesForLesson(lessonId) : [];

  const [status, setStatus] = useState<LessonStatus>('not_started');
  const [mobileTab, setMobileTab] = useState<'theory' | 'practice'>('theory');
  const [ideExpanded, setIdeExpanded] = useState(false);
  const [pythonVersion, setPythonVersion] = useState<string>(pyodideRunner.getPythonVersion());

  useEffect(() => {
    if (!pythonVersion) {
      pyodideRunner
        .init()
        .then((ver) => setPythonVersion(ver))
        .catch(() => {});
    }
  }, [pythonVersion]);

  useEffect(() => {
    if (!lessonId || !lesson) return;
    markLessonInProgress(lessonId).then(() => {
      window.dispatchEvent(new Event('pdp-progress-updated'));
    });

    db.progress
      .get(lessonId)
      .then((rec) => {
        setStatus(rec?.status ?? 'in_progress');
      })
      .catch(() => {});
  }, [lessonId, lesson]);

  if (!lesson || !lessonId) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
          404 // NOT FOUND
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
          Lesson not found
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The requested lesson could not be found.
        </p>
        <Link
          to="/"
          className="tactile inline-block px-4 py-2 rounded-md bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    await markLessonCompleted(lessonId);
    setStatus('completed');
    window.dispatchEvent(new Event('pdp-progress-updated'));
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] sticky top-14 z-10">
        <button
          type="button"
          onClick={() => setMobileTab('theory')}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
            mobileTab === 'theory'
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500'
          }`}
        >
          Theory
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('practice')}
          className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 tabular-nums transition-colors ${
            mobileTab === 'practice'
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500'
          }`}
        >
          Practice ({exercises.length})
        </button>
      </div>

      {/* Two-Pane Independent-Scroll IDE Layout */}
      <div
        className={`flex-1 min-h-0 grid grid-cols-1 ${
          ideExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'
        }`}
      >
        {!ideExpanded && (
          <div
            className={`lg:h-full overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] ${
              mobileTab === 'theory' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LessonRenderer
              lesson={lesson}
              status={status}
              pythonVersion={pythonVersion}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        )}

        <div
          className={`lg:h-full min-h-[600px] lg:min-h-0 flex flex-col p-4 lg:p-6 bg-neutral-50 dark:bg-[#0c0c0e] relative ${
            mobileTab === 'practice' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <button
            type="button"
            onClick={() => setIdeExpanded((v) => !v)}
            aria-label={ideExpanded ? 'Restore split view' : 'Expand IDE full width'}
            title={ideExpanded ? 'Restore split view' : 'Expand IDE full width'}
            className="hidden lg:inline-flex items-center justify-center w-7 h-7 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131316] text-neutral-500 hover:text-neutral-950 dark:hover:text-white absolute top-5 right-6 z-10 transition-colors"
          >
            {ideExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          <div className="flex-1 min-h-0">
            <ExerciseWorkspace
              lessonId={lessonId}
              exercises={exercises}
              onAllPassed={handleMarkComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
