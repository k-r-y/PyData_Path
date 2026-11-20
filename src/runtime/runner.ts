import type { WorkerRequest, WorkerResponse } from './pyodide.worker';

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
          // Terminate the frozen worker and spin up a clean replacement
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
