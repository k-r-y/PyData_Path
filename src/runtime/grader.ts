import { pyodideRunner, type RunResult } from './runner';
import type { CodeExercise } from '../types/content';

export interface GradeResult {
  codeRanOk: boolean;
  timedOut: boolean;
  visiblePassed: boolean;
  hiddenPassed: boolean;
  allPassed: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  visibleTestError?: string;
  pythonVersion: string;
}

/**
 * Runs learner code, then executes visible tests, and finally hidden tests
 * without leaking hidden test source or assertions to the UI.
 */
export async function gradeCodeExercise(
  code: string,
  exercise: CodeExercise
): Promise<GradeResult> {
  const timeoutMs = (exercise.timeoutSeconds ?? 10) * 1000;

  // Step 1: Run learner code + visible tests
  const visibleRun: RunResult = await pyodideRunner.run(code, {
    testCode: exercise.visibleTests,
    inputs: exercise.inputs,
    timeoutMs,
  });

  if (!visibleRun.ok || visibleRun.timedOut) {
    return {
      codeRanOk: false,
      timedOut: visibleRun.timedOut,
      visiblePassed: false,
      hiddenPassed: false,
      allPassed: false,
      stdout: visibleRun.stdout,
      stderr: visibleRun.stderr,
      error: visibleRun.error,
      pythonVersion: visibleRun.pythonVersion,
    };
  }

  if (visibleRun.testPassed === false) {
    return {
      codeRanOk: true,
      timedOut: false,
      visiblePassed: false,
      hiddenPassed: false,
      allPassed: false,
      stdout: visibleRun.stdout,
      stderr: visibleRun.stderr,
      visibleTestError: visibleRun.testError,
      pythonVersion: visibleRun.pythonVersion,
    };
  }

  // Step 2: Run hidden tests only if visible tests passed
  let hiddenPassed = true;
  if (exercise.hiddenTests.trim().length > 0) {
    const hiddenRun = await pyodideRunner.run(code, {
      testCode: exercise.hiddenTests,
      inputs: exercise.inputs,
      timeoutMs,
    });
    hiddenPassed = hiddenRun.ok && !hiddenRun.timedOut && hiddenRun.testPassed === true;
  }

  return {
    codeRanOk: true,
    timedOut: false,
    visiblePassed: true,
    hiddenPassed,
    allPassed: hiddenPassed,
    stdout: visibleRun.stdout,
    stderr: visibleRun.stderr,
    pythonVersion: visibleRun.pythonVersion,
  };
}
