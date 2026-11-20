export type TrackId = 'a-foundations' | 'b-advanced' | 'c-analytics';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ModuleMeta {
  id: string;
  track: TrackId;
  title: string;
  order: number;
  summary: string;
  prerequisites: string[];
  lessons: string[];
  packages: string[];
}

export interface LessonFrontmatter {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  difficulty: Difficulty;
  objectives: string[];
  prerequisites: string[];
  packages: string[];
  sources: string[];
  tags: string[];
}

export interface LessonData {
  frontmatter: LessonFrontmatter;
  body: string;
}

export interface BaseExercise {
  id: string;
  type: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  concepts: string[];
  points: number;
  hints: [string, string, string];
  solution: string;
  explanation: string;
  sources: string[];
}

export interface CodeExercise extends BaseExercise {
  type: 'code';
  starterCode: string;
  visibleTests: string;
  hiddenTests: string;
  inputs?: string[];
  datasets?: string[];
  timeoutSeconds?: number;
}

export interface PredictExercise extends BaseExercise {
  type: 'predict';
  code: string;
  expectedOutput: string;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fillblank';
  codeWithBlanks: string;
  answers: Record<string, string[]>;
}

export interface ParsonsExercise extends BaseExercise {
  type: 'parsons';
  lines: string[];
  distractors?: string[];
}

export interface DebugExercise extends BaseExercise {
  type: 'debug';
  brokenCode: string;
  visibleTests: string;
  hiddenTests: string;
  bugDescription: string;
  inputs?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
}

export interface QuizExercise extends BaseExercise {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface FlashcardExercise extends BaseExercise {
  type: 'flashcard';
  front: string;
  back: string;
  deckId: string;
}

export interface SqlExercise extends BaseExercise {
  type: 'sql';
  schemaDataset: string;
  question: string;
  expectedResult: {
    columns: string[];
    rows: unknown[][];
    ordered: boolean;
  };
  starterQuery: string;
}

export interface DataFrameExercise extends BaseExercise {
  type: 'dataframe';
  dataset: string;
  task: string;
  checkCode: string;
}

export interface ChartExercise extends BaseExercise {
  type: 'chart';
  dataset: string;
  targetDescription: string;
  checkCode: string;
}

export interface SimulatorExercise extends BaseExercise {
  type: 'simulator';
  simulatorId: 'clt' | 'confidence-interval' | 'hypothesis-test' | 'correlation' | 'regression';
  parameters: Record<string, number>;
  guidedQuestions: string[];
}

export interface ProjectExercise extends BaseExercise {
  type: 'project';
  brief: string;
  steps: string[];
  rubric: { criterion: string; weight: number }[];
  autoChecks?: string;
}

export type Exercise =
  | CodeExercise
  | PredictExercise
  | FillBlankExercise
  | ParsonsExercise
  | DebugExercise
  | QuizExercise
  | FlashcardExercise
  | SqlExercise
  | DataFrameExercise
  | ChartExercise
  | SimulatorExercise
  | ProjectExercise;

export type SourceType = 'official-docs' | 'book' | 'course' | 'dataset' | 'standard';

export interface SourceEntry {
  id: string;
  title: string;
  author: string;
  publisher: string;
  url: string;
  type: SourceType;
  license: string;
  versionOrEdition: string;
  accessedOn: string | null;
  verified: boolean;
  notes: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  sourceIds: string[];
  relatedLessons: string[];
}
