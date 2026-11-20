import Dexie, { type EntityTable } from 'dexie';

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

export async function recordExerciseAttempt(
  attempt: Omit<AttemptRecord, 'id'>
): Promise<void> {
  await db.attempts.add(attempt);
  const today = new Date().toISOString().slice(0, 10);
  const streak = await db.streaks.get(today);
  await db.streaks.put({
    date: today,
    minutes: (streak?.minutes ?? 0) + Math.max(1, Math.round(attempt.durationSeconds / 60)),
    exercisesCompleted: (streak?.exercisesCompleted ?? 0) + (attempt.passed ? 1 : 0),
  });
}
