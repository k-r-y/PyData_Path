import type {
  ProblemSpec,
  ProblemSuiteResult,
  ProblemTestCase,
  ProblemTestResult,
  ProblemVerdict,
} from '../types/problem';

export const DEFAULT_TEST_TIMEOUT_MS = 2000;
export const TOTAL_RUN_TIMEOUT_MS = 10000;

export function buildSkippedResult(
  test: ProblemTestCase,
  index: number,
  scope: 'visible' | 'hidden'
): ProblemTestResult {
  return {
    index,
    scope,
    label: test.label,
    status: 'Not run',
    passed: false,
    runtimeMs: 0,
    stdout: '',
  };
}

export function computeOverallVerdict(
  prepareOk: boolean,
  prepareErrorType: string | undefined,
  prepareTimedOut: boolean,
  results: ProblemTestResult[]
): ProblemVerdict {
  if (prepareTimedOut) return 'Time Limit Exceeded';
  if (!prepareOk) {
    if (
      prepareErrorType === 'SyntaxError' ||
      prepareErrorType === 'IndentationError' ||
      prepareErrorType === 'TabError'
    ) {
      return 'Syntax Error';
    }
    return 'Runtime Error';
  }

  let hasRuntimeError = false;
  let hasWrongAnswer = false;
  for (const r of results) {
    if (r.status === 'Time Limit Exceeded') return 'Time Limit Exceeded';
    if (r.status === 'Runtime Error') hasRuntimeError = true;
    else if (r.status === 'Wrong Answer') hasWrongAnswer = true;
    else if (r.status === 'Not run') hasWrongAnswer = true;
  }

  if (hasRuntimeError) return 'Runtime Error';
  if (hasWrongAnswer) return 'Wrong Answer';
  return 'Accepted';
}

export function formatTestPreviewInput(test: ProblemTestCase): string {
  if ('script' in test) {
    return test.inputDisplay ?? test.script;
  }
  if (test.argsExpr !== undefined) return test.argsExpr;
  if (test.args !== undefined) return JSON.stringify(test.args);
  return '';
}

export function formatTestPreviewExpected(test: ProblemTestCase): string {
  if ('script' in test) {
    return test.expectedDisplay ?? 'Assertions pass';
  }
  if (test.expectedExpr !== undefined) return test.expectedExpr;
  if (test.expected !== undefined) return JSON.stringify(test.expected);
  return '';
}

export function summarizeSuiteResult(
  mode: 'run' | 'submit',
  verdict: ProblemVerdict,
  results: ProblemTestResult[],
  runtimeMs: number,
  stdout: string,
  stderr: string,
  firstError?: string,
  errorLine?: number | null
): ProblemSuiteResult {
  const passed = results.filter((r) => r.passed).length;
  return {
    mode,
    verdict,
    passed,
    total: results.length,
    runtimeMs: Math.round(runtimeMs),
    stdout,
    stderr,
    firstError,
    errorLine,
    results,
  };
}

export function getTestsForMode(
  spec: ProblemSpec,
  mode: 'run' | 'submit'
): Array<{ scope: 'visible' | 'hidden'; test: ProblemTestCase }> {
  const visible = spec.tests.visible.map((test) => ({ scope: 'visible' as const, test }));
  if (mode === 'run') return visible;
  const hidden = spec.tests.hidden.map((test) => ({ scope: 'hidden' as const, test }));
  return [...visible, ...hidden];
}
