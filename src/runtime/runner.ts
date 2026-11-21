import type { WorkerRequest, WorkerResponse } from './pyodide.worker';
import type {
  ProblemEntry,
  ProblemSpec,
  ProblemSuiteResult,
  ProblemTestResult,
} from '../types/problem';
import {
  DEFAULT_TEST_TIMEOUT_MS,
  TOTAL_RUN_TIMEOUT_MS,
  buildSkippedResult,
  computeOverallVerdict,
  getTestsForMode,
  summarizeSuiteResult,
} from './problemGrader';

export interface RunOptions {
  testCode?: string;
  inputs?: string[];
  datasets?: Record<string, string>;
  timeoutMs?: number;
}

export interface RunResult {
  ok: boolean;
  timedOut: boolean;
  pythonVersion: string;
  stdout: string;
  stderr: string;
  error?: string;
  testPassed?: boolean;
  testError?: string;
}

export interface CustomRunResult {
  ok: boolean;
  timedOut: boolean;
  runtimeMs: number;
  returnRepr: string;
  stdout: string;
  stderr: string;
  error?: string;
  errorLine?: number | null;
}

type PendingEntry = {
  resolve: (value: WorkerResponse) => void;
  reject: (reason: Error) => void;
  timer?: number;
};

class PyodideRunner {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingEntry>();
  private counter = 0;
  private pythonVersion = '';
  private statusListeners = new Set<(status: 'idle' | 'loading' | 'running' | 'ready') => void>();
  private currentStatus: 'idle' | 'loading' | 'running' | 'ready' = 'idle';
  private queue: Promise<unknown> = Promise.resolve();

  private setStatus(status: 'idle' | 'loading' | 'running' | 'ready') {
    this.currentStatus = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  subscribeStatus(listener: (status: 'idle' | 'loading' | 'running' | 'ready') => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getPythonVersion(): string {
    return this.pythonVersion;
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => {});
    return next;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;

    this.setStatus('loading');
    const worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const res = event.data;
      if (res.pythonVersion) {
        this.pythonVersion = res.pythonVersion;
      }
      const entry = this.pending.get(res.id);
      if (entry) {
        if (entry.timer !== undefined) {
          window.clearTimeout(entry.timer);
        }
        this.pending.delete(res.id);
        entry.resolve(res);
      }
    };

    worker.onerror = (err) => {
      for (const [id, entry] of this.pending.entries()) {
        if (entry.timer !== undefined) {
          window.clearTimeout(entry.timer);
        }
        this.pending.delete(id);
        entry.reject(new Error(err.message || 'Pyodide worker crashed'));
      }
      this.reset();
    };

    this.worker = worker;
    return worker;
  }

  private sendRequest(req: WorkerRequest, timeoutMs?: number): Promise<WorkerResponse> {
    const worker = this.ensureWorker();

    return new Promise((resolve, reject) => {
      const entry: PendingEntry = { resolve, reject };

      if (timeoutMs && timeoutMs > 0) {
        entry.timer = window.setTimeout(() => {
          this.pending.delete(req.id);
          this.reset();
          reject(new Error('TIMEOUT'));
        }, timeoutMs);
      }

      this.pending.set(req.id, entry);
      worker.postMessage(req);
    });
  }

  async init(): Promise<string> {
    const id = `req-${++this.counter}`;
    this.setStatus('loading');
    try {
      const res = await this.sendRequest({ type: 'init', id });
      this.setStatus('ready');
      return res.pythonVersion ?? '';
    } catch (err) {
      this.setStatus('idle');
      throw err;
    }
  }

  async loadPackages(packages: string[]): Promise<void> {
    if (packages.length === 0) return;
    const id = `req-${++this.counter}`;
    this.setStatus('loading');
    try {
      const res = await this.sendRequest({ type: 'loadPackages', id, packages });
      this.setStatus('ready');
      if (!res.ok) {
        throw new Error(
          res.error || `Failed to load packages: ${packages.join(', ')}`
        );
      }
    } catch (err) {
      this.setStatus('ready');
      throw err;
    }
  }

  async run(code: string, options: RunOptions = {}): Promise<RunResult> {
    return this.enqueue(async () => {
      const id = `req-${++this.counter}`;
      const timeoutMs = options.timeoutMs ?? 10000;
      this.setStatus('running');

      try {
        const res = await this.sendRequest(
          {
            type: 'run',
            id,
            code,
            testCode: options.testCode,
            inputs: options.inputs,
            datasets: options.datasets,
          },
          timeoutMs
        );
        this.setStatus('ready');
        return {
          ok: res.ok,
          timedOut: false,
          pythonVersion: res.pythonVersion ?? this.pythonVersion,
          stdout: res.stdout,
          stderr: res.stderr,
          error: res.error,
          testPassed: res.testPassed,
          testError: res.testError,
        };
      } catch (err) {
        this.setStatus('ready');
        if (err instanceof Error && err.message === 'TIMEOUT') {
          return {
            ok: false,
            timedOut: true,
            pythonVersion: this.pythonVersion,
            stdout: '',
            stderr: '',
            error: `Execution timed out after ${Math.round(timeoutMs / 1000)} seconds. Check for an infinite loop (for example, a while loop whose condition never becomes False). The Python worker was restarted.`,
          };
        }
        return {
          ok: false,
          timedOut: false,
          pythonVersion: this.pythonVersion,
          stdout: '',
          stderr: '',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  }

  async runProblemSuite(options: {
    code: string;
    spec: ProblemSpec;
    mode: 'run' | 'submit';
    checkerCode?: string;
    onTestProgress?: (results: ProblemTestResult[]) => void;
  }): Promise<ProblemSuiteResult> {
    return this.enqueue(async () => {
      const { code, spec, mode, checkerCode, onTestProgress } = options;
      const testItems = getTestsForMode(spec, mode);
      const results: ProblemTestResult[] = testItems.map((item, idx) =>
        buildSkippedResult(item.test, idx, item.scope)
      );
      onTestProgress?.([...results]);

      this.setStatus('running');
      const suiteStart = performance.now();

      try {
        // Ensure Pyodide is ready before starting the per-test/total execution clock,
        // so first-time WASM download/startup doesn't falsely mark test 1 as TLE.
        if (!this.worker || !this.pythonVersion) {
          this.setStatus('loading');
          await this.sendRequest({ type: 'init', id: `req-${++this.counter}` });
          this.setStatus('running');
        }

        const execStart = performance.now();
        const prepId = `req-${++this.counter}`;
        let prepRes: WorkerResponse;
        try {
          prepRes = await this.sendRequest(
            { type: 'prepareProblem', id: prepId, code },
            DEFAULT_TEST_TIMEOUT_MS
          );
        } catch (err) {
          const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
          const elapsed = performance.now() - execStart;
          this.setStatus('ready');
          const msg = isTimeout
            ? `Time Limit Exceeded (${DEFAULT_TEST_TIMEOUT_MS} ms) while executing top-level code. The Python worker was restarted.`
            : err instanceof Error
              ? err.message
              : String(err);
          if (isTimeout && results.length > 0) {
            results[0] = {
              ...results[0],
              status: 'Time Limit Exceeded',
              error: msg,
              runtimeMs: DEFAULT_TEST_TIMEOUT_MS,
            };
          }
          onTestProgress?.([...results]);
          return summarizeSuiteResult(
            mode,
            isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
            results,
            elapsed,
            '',
            '',
            msg,
            null
          );
        }

        const topStdout = prepRes.stdout ?? '';
        const topStderr = prepRes.stderr ?? '';

        if (!prepRes.ok) {
          const elapsed = performance.now() - execStart;
          const verdict = computeOverallVerdict(false, prepRes.errorType, false, results);
          this.setStatus('ready');
          onTestProgress?.([...results]);
          return summarizeSuiteResult(
            mode,
            verdict,
            results,
            elapsed,
            topStdout,
            topStderr,
            prepRes.error,
            prepRes.errorLine
          );
        }

        let firstError: string | undefined;
        let firstErrorLine: number | null | undefined;
        let combinedStdout = topStdout;
        let combinedStderr = topStderr;

        for (let i = 0; i < testItems.length; i++) {
          const { scope, test } = testItems[i];
          const elapsedSoFar = performance.now() - execStart;
          const remainingTotal = Math.max(0, TOTAL_RUN_TIMEOUT_MS - elapsedSoFar);
          const requestedLimit = test.timeLimitMs ?? DEFAULT_TEST_TIMEOUT_MS;

          if (remainingTotal < 25) {
            results[i] = {
              ...results[i],
              status: 'Time Limit Exceeded',
              error: `Total run time limit (${TOTAL_RUN_TIMEOUT_MS / 1000} s) exceeded.`,
            };
            if (!firstError) firstError = results[i].error;
            onTestProgress?.([...results]);
            break;
          }

          const effectiveLimit = Math.min(requestedLimit, Math.ceil(remainingTotal));
          const testId = `req-${++this.counter}`;

          try {
            const res = await this.sendRequest(
              {
                type: 'runProblemTest',
                id: testId,
                entry: spec.entry,
                compare: spec.compare,
                test,
                checkerCode,
              },
              effectiveLimit
            );
            const tRes = res.problemTestResult;
            if (tRes) {
              results[i] = {
                index: i,
                scope,
                label: tRes.label,
                status: tRes.status,
                passed: tRes.passed,
                runtimeMs: tRes.runtimeMs,
                inputRepr: tRes.inputRepr,
                expectedRepr: tRes.expectedRepr,
                actualRepr: tRes.actualRepr,
                stdout: tRes.stdout,
                error: tRes.error,
                errorType: tRes.errorType,
                errorLine: tRes.errorLine,
              };
              if (tRes.stdout) {
                combinedStdout += (combinedStdout ? '\n' : '') + tRes.stdout;
              }
              if (tRes.stderr) {
                combinedStderr += (combinedStderr ? '\n' : '') + tRes.stderr;
              }
              if (!tRes.passed && !firstError) {
                firstError = tRes.error;
                firstErrorLine = tRes.errorLine;
              }
            }
            onTestProgress?.([...results]);
          } catch (err) {
            const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
            const msg = isTimeout
              ? `Time Limit Exceeded (${effectiveLimit} ms) on test "${test.label}". Worker terminated and recreated.`
              : err instanceof Error
                ? err.message
                : String(err);
            results[i] = {
              ...results[i],
              status: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
              passed: false,
              runtimeMs: effectiveLimit,
              error: msg,
            };
            if (!firstError) firstError = msg;
            onTestProgress?.([...results]);
            break;
          }
        }

        const totalElapsed = performance.now() - suiteStart;
        const verdict = computeOverallVerdict(true, undefined, false, results);
        this.setStatus('ready');
        return summarizeSuiteResult(
          mode,
          verdict,
          results,
          totalElapsed,
          combinedStdout,
          combinedStderr,
          firstError,
          firstErrorLine
        );
      } catch (err) {
        this.setStatus('ready');
        const msg = err instanceof Error ? err.message : String(err);
        return summarizeSuiteResult(
          mode,
          'Runtime Error',
          results,
          performance.now() - suiteStart,
          '',
          '',
          msg,
          null
        );
      }
    });
  }

  async runProblemCustom(options: {
    code: string;
    entry: ProblemEntry;
    customInput: string;
    timeoutMs?: number;
  }): Promise<CustomRunResult> {
    return this.enqueue(async () => {
      const timeoutMs = options.timeoutMs ?? DEFAULT_TEST_TIMEOUT_MS;
      this.setStatus('running');
      try {
        if (!this.worker || !this.pythonVersion) {
          this.setStatus('loading');
          await this.sendRequest({ type: 'init', id: `req-${++this.counter}` });
          this.setStatus('running');
        }
        const id = `req-${++this.counter}`;
        const res = await this.sendRequest(
          {
            type: 'runProblemCustom',
            id,
            code: options.code,
            entry: options.entry,
            customInput: options.customInput,
          },
          timeoutMs
        );
        this.setStatus('ready');
        const c = res.customResult;
        return {
          ok: c?.ok ?? res.ok,
          timedOut: false,
          runtimeMs: c?.runtimeMs ?? 0,
          returnRepr: c?.returnRepr ?? '',
          stdout: c?.stdout ?? res.stdout,
          stderr: c?.stderr ?? res.stderr,
          error: c?.error ?? res.error,
          errorLine: c?.errorLine ?? res.errorLine,
        };
      } catch (err) {
        this.setStatus('ready');
        const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
        return {
          ok: false,
          timedOut: isTimeout,
          runtimeMs: timeoutMs,
          returnRepr: '',
          stdout: '',
          stderr: '',
          error: isTimeout
            ? `Custom run timed out after ${timeoutMs} ms. Worker terminated and recreated.`
            : err instanceof Error
              ? err.message
              : String(err),
          errorLine: null,
        };
      }
    });
  }

  reset(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pending.clear();
    this.setStatus('idle');
  }
}

export const pyodideRunner = new PyodideRunner();
