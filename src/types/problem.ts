export type ProblemDifficulty = 'easy' | 'medium' | 'hard' | 'challenge';

export type ProblemEntry =
  | { type: 'function'; name: string }
  | { type: 'script' };

export type ProblemCompare =
  | 'exact'
  | 'unordered'
  | { float: number }
  | { checker: string };

export interface FunctionTestCase {
  label: string;
  args?: unknown[];
  argsExpr?: string;
  expected?: unknown;
  expectedExpr?: string;
  timeLimitMs?: number;
  checks?: 'inputUnchanged'[];
  isPerformance?: boolean;
}

export interface ScriptTestCase {
  label: string;
  script: string;
  inputDisplay?: string;
  expectedDisplay?: string;
  timeLimitMs?: number;
  isPerformance?: boolean;
}

export type ProblemTestCase = FunctionTestCase | ScriptTestCase;

export interface ProblemMeta {
  folder: string;
  id: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  estimatedMinutes: number;
  relatedModules: string[];
  sources: string[];
  visibleCount: number;
  hiddenCount: number;
}

export interface ProblemSpec {
  id: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  estimatedMinutes: number;
  relatedModules: string[];
  entry: ProblemEntry;
  compare: ProblemCompare;
  tests: {
    visible: ProblemTestCase[];
    hidden: ProblemTestCase[];
  };
  hints: [string, string, string];
  sources: string[];
  benchSizes?: number[];
  benchInputExpr?: string;
}

export interface ExplanationSolutionMeta {
  file: string;
  label: string;
  time: string;
  space: string;
}

export interface ProblemExplanationData {
  problemId: string;
  solutions: ExplanationSolutionMeta[];
  body: string;
}

export type ProblemVerdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Syntax Error';

export type TestCaseStatus =
  | 'Passed'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Not run';

export interface ProblemTestResult {
  index: number;
  scope: 'visible' | 'hidden';
  label: string;
  status: TestCaseStatus;
  passed: boolean;
  runtimeMs: number;
  inputRepr?: string;
  expectedRepr?: string;
  actualRepr?: string;
  stdout: string;
  error?: string;
  errorType?: string;
  errorLine?: number | null;
}

export interface ProblemSuiteResult {
  mode: 'run' | 'submit';
  verdict: ProblemVerdict;
  passed: number;
  total: number;
  runtimeMs: number;
  stdout: string;
  stderr: string;
  firstError?: string;
  errorLine?: number | null;
  results: ProblemTestResult[];
}
