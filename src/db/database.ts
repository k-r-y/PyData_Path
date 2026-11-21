import Dexie, { type EntityTable } from 'dexie';
import type { ProblemVerdict } from '../types/problem';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface ProgressRecord {
  lessonId: string;
  status: LessonStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number;
}

export interface AttemptRecord {
  id?: number;
  exerciseId: string;
  lessonId: string;
  timestamp: string;
  passed: boolean;
  code: string;
  hintsUsed: number;
  solutionViewed: boolean;
  noAiMode: boolean;
  durationSeconds: number;
}

export interface MasteryRecord {
  conceptTag: string;
  level: 0 | 1 | 2 | 3;
  correct: number;
  incorrect: number;
  lastPracticed: string;
}

export interface FlashcardRecord {
  cardId: string;
  deckId: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
  lastReviewed: string | null;
}

export interface NoteRecord {
  lessonId: string;
  markdown: string;
  updatedAt: string;
}

export interface BookmarkRecord {
  id: string;
  lessonId: string;
  exerciseId?: string;
  problemId?: string;
  reason: string;
  createdAt: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface StreakRecord {
  date: string;
  minutes: number;
  exercisesCompleted: number;
}

export interface ProjectRecord {
  projectId: string;
  checklistState: Record<string, boolean>;
  writeup: string;
  updatedAt: string;
}

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export interface ProblemProgressRecord {
  problemId: string;
  status: ProblemStatus;
  attempts: number;
  firstSolvedAt: string | null;
  lastAttemptAt: string | null;
  bestPassed: number;
  totalTests: number;
  solvedUnaided: boolean;
  maxHintLevel: number;
  solutionViewed: boolean;
  revealedFailingCase: boolean;
  timeSpentSeconds: number;
}

export interface SubmissionRecord {
  id?: number;
  problemId: string;
  timestamp: string;
  verdict: ProblemVerdict;
  passed: number;
  total: number;
  runtimeMs: number;
  code: string;
  mode: 'practice' | 'exam';
}

export interface DraftRecord {
  problemId: string;
  code: string;
  updatedAt: string;
}

export interface ProblemNoteRecord {
  problemId: string;
  markdown: string;
  updatedAt: string;
}

export interface ReviewQueueRecord {
  problemId: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
}

export interface PlaygroundFileRecord {
  path: string;
  content: string;
  updatedAt: string;
}

export interface ExamSessionRecord {
  id?: number;
  problemIds: string[];
  startedAt: string;
  endedAt: string | null;
  limitSeconds: number;
  scores: Record<string, { verdict: ProblemVerdict; passed: number; total: number }>;
}

class PyDataPathDB extends Dexie {
  progress!: EntityTable<ProgressRecord, 'lessonId'>;
  attempts!: EntityTable<AttemptRecord, 'id'>;
  mastery!: EntityTable<MasteryRecord, 'conceptTag'>;
  flashcards!: EntityTable<FlashcardRecord, 'cardId'>;
  notes!: EntityTable<NoteRecord, 'lessonId'>;
  bookmarks!: EntityTable<BookmarkRecord, 'id'>;
  settings!: EntityTable<SettingRecord, 'key'>;
  streaks!: EntityTable<StreakRecord, 'date'>;
  projects!: EntityTable<ProjectRecord, 'projectId'>;
  problemProgress!: EntityTable<ProblemProgressRecord, 'problemId'>;
  submissions!: EntityTable<SubmissionRecord, 'id'>;
  drafts!: EntityTable<DraftRecord, 'problemId'>;
  problemNotes!: EntityTable<ProblemNoteRecord, 'problemId'>;
  reviewQueue!: EntityTable<ReviewQueueRecord, 'problemId'>;
  playgroundFiles!: EntityTable<PlaygroundFileRecord, 'path'>;
  examSessions!: EntityTable<ExamSessionRecord, 'id'>;

  constructor() {
    super('PyDataPathDB');
    this.version(1).stores({
      progress: 'lessonId, status',
      attempts: '++id, exerciseId, lessonId, timestamp, passed',
      mastery: 'conceptTag, level',
      flashcards: 'cardId, deckId, dueDate',
      notes: 'lessonId',
      bookmarks: 'id, lessonId, createdAt',
      settings: 'key',
      streaks: 'date',
      projects: 'projectId',
    });
    this.version(2).stores({
      progress: 'lessonId, status',
      attempts: '++id, exerciseId, lessonId, timestamp, passed',
      mastery: 'conceptTag, level',
      flashcards: 'cardId, deckId, dueDate',
      notes: 'lessonId',
      bookmarks: 'id, lessonId, problemId, createdAt',
      settings: 'key',
      streaks: 'date',
      projects: 'projectId',
      problemProgress: 'problemId, status, lastAttemptAt',
      submissions: '++id, problemId, timestamp, verdict',
      drafts: 'problemId',
      problemNotes: 'problemId',
      reviewQueue: 'problemId, dueDate',
      playgroundFiles: 'path',
      examSessions: '++id, startedAt',
    });
  }
}

export const db = new PyDataPathDB();

export async function markLessonInProgress(lessonId: string): Promise<void> {
  const existing = await db.progress.get(lessonId);
  if (!existing) {
    await db.progress.put({
      lessonId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      completedAt: null,
      timeSpentSeconds: 0,
    });
  }
}

export async function markLessonCompleted(lessonId: string): Promise<void> {
  const existing = await db.progress.get(lessonId);
  const now = new Date().toISOString();
  await db.progress.put({
    lessonId,
    status: 'completed',
    startedAt: existing?.startedAt ?? now,
    completedAt: now,
    timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
  });
}

async function bumpDailyStreak(durationSeconds: number, passed: boolean): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const streak = await db.streaks.get(today);
  await db.streaks.put({
    date: today,
    minutes: (streak?.minutes ?? 0) + Math.max(1, Math.round(durationSeconds / 60)),
    exercisesCompleted: (streak?.exercisesCompleted ?? 0) + (passed ? 1 : 0),
  });
}

export async function recordExerciseAttempt(
  attempt: Omit<AttemptRecord, 'id'>
): Promise<void> {
  await db.attempts.add(attempt);
  await bumpDailyStreak(attempt.durationSeconds, attempt.passed);
}

export async function recordProblemSubmission(params: {
  problemId: string;
  verdict: ProblemVerdict;
  passed: number;
  total: number;
  runtimeMs: number;
  code: string;
  mode: 'practice' | 'exam';
  durationSeconds: number;
}): Promise<ProblemProgressRecord> {
  const now = new Date().toISOString();
  const isAccepted = params.verdict === 'Accepted';

  await db.submissions.add({
    problemId: params.problemId,
    timestamp: now,
    verdict: params.verdict,
    passed: params.passed,
    total: params.total,
    runtimeMs: params.runtimeMs,
    code: params.code,
    mode: params.mode,
  });

  const existing = await db.problemProgress.get(params.problemId);
  const maxHintLevel = existing?.maxHintLevel ?? 0;
  const solutionViewed = existing?.solutionViewed ?? false;
  const revealedFailingCase = existing?.revealedFailingCase ?? false;
  const aided = maxHintLevel > 0 || solutionViewed || revealedFailingCase;

  const updated: ProblemProgressRecord = {
    problemId: params.problemId,
    status: existing?.status === 'solved' || isAccepted ? 'solved' : 'attempted',
    attempts: (existing?.attempts ?? 0) + 1,
    firstSolvedAt: existing?.firstSolvedAt ?? (isAccepted ? now : null),
    lastAttemptAt: now,
    bestPassed: Math.max(existing?.bestPassed ?? 0, params.passed),
    totalTests: params.total,
    solvedUnaided:
      existing?.status === 'solved'
        ? existing.solvedUnaided
        : isAccepted
          ? !aided
          : false,
    maxHintLevel,
    solutionViewed,
    revealedFailingCase,
    timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + Math.max(0, params.durationSeconds),
  };

  await db.problemProgress.put(updated);
  await bumpDailyStreak(params.durationSeconds, isAccepted);
  return updated;
}

export async function saveProblemDraft(problemId: string, code: string): Promise<void> {
  await db.drafts.put({
    problemId,
    code,
    updatedAt: new Date().toISOString(),
  });
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const rec = await db.settings.get(key);
  if (!rec || rec.value === undefined) return fallback;
  return rec.value as T;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
