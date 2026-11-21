import type {
  TerminalWorkerEvent,
  TerminalWorkerRequest,
  VirtualFileEntry,
} from './terminal.worker';

export type TerminalStatus = 'uninitialized' | 'loading' | 'ready' | 'running' | 'waiting_stdin';

export interface TerminalCallbacks {
  onOutput: (stream: 'stdout' | 'stderr', text: string) => void;
  onStatusChange: (status: TerminalStatus) => void;
  onStdinRequest: () => void;
  onVfsChanged?: (files: VirtualFileEntry[]) => void;
}

const STDIN_BUFFER_BYTES = 65536;

export function supportsSharedArrayBuffer(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    Boolean((globalThis as { crossOriginIsolated?: boolean }).crossOriginIsolated) &&
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof Atomics !== 'undefined'
  );
}

/**
 * Owns an isolated Web Worker dedicated to the interactive Python REPL and Simulated Shell.
 * Terminating/restarting this worker never affects the grading PyodideRunner worker.
 */
export class TerminalSession {
  private worker: Worker | null = null;
  private status: TerminalStatus = 'uninitialized';
  private counter = 0;
  private callbacks: TerminalCallbacks;
  private pending = new Map<
    string,
    { resolve: (ev: TerminalWorkerEvent) => void; reject: (err: Error) => void }
  >();

  private stdinSab: SharedArrayBuffer | null = null;
  private stdinCtrl: Int32Array | null = null;
  private stdinData: Uint8Array | null = null;
  private interruptSab: SharedArrayBuffer | null = null;
  private interruptView: Uint8Array | null = null;
  private textEncoder = new TextEncoder();

  public pythonVersion = '';
  public banner = '';
  public cwd = '/workspace';
  public readonly isolated: boolean;

  constructor(callbacks: TerminalCallbacks) {
    this.callbacks = callbacks;
    this.isolated = supportsSharedArrayBuffer();
  }

  private setStatus(status: TerminalStatus) {
    this.status = status;
    this.callbacks.onStatusChange(status);
  }

  getStatus(): TerminalStatus {
    return this.status;
  }

  private allocateSharedBuffers() {
    if (!this.isolated) {
      this.stdinSab = null;
      this.stdinCtrl = null;
      this.stdinData = null;
      this.interruptSab = null;
      this.interruptView = null;
      return;
    }
    this.stdinSab = new SharedArrayBuffer(STDIN_BUFFER_BYTES);
    this.stdinCtrl = new Int32Array(this.stdinSab, 0, 2);
    this.stdinData = new Uint8Array(this.stdinSab, 8);
    this.interruptSab = new SharedArrayBuffer(4);
    this.interruptView = new Uint8Array(this.interruptSab);
  }

  async start(initialFiles: VirtualFileEntry[] = []): Promise<{
    pythonVersion: string;
    banner: string;
    cwd: string;
  }> {
    if (this.worker && this.status !== 'uninitialized') {
      return { pythonVersion: this.pythonVersion, banner: this.banner, cwd: this.cwd };
    }

    this.allocateSharedBuffers();
    this.setStatus('loading');

    const worker = new Worker(new URL('./terminal.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<TerminalWorkerEvent>) => {
      const ev = event.data;
      if (ev.type === 'output') {
        this.callbacks.onOutput(ev.stream, ev.text);
        return;
      }
      if (ev.type === 'stdinRequest') {
        this.setStatus('waiting_stdin');
        this.callbacks.onStdinRequest();
        return;
      }
      if (ev.type === 'shellResult' && ev.vfsFiles && this.callbacks.onVfsChanged) {
        this.callbacks.onVfsChanged(ev.vfsFiles);
      }

      if ('id' in ev && ev.id) {
        const entry = this.pending.get(ev.id);
        if (entry) {
          this.pending.delete(ev.id);
          if (ev.type === 'error') {
            entry.reject(new Error(ev.message));
          } else {
            entry.resolve(ev);
          }
        }
      }
    };

    worker.onerror = (err) => {
      for (const [id, entry] of this.pending.entries()) {
        this.pending.delete(id);
        entry.reject(new Error(err.message || 'Terminal worker error'));
      }
      this.worker = null;
      this.setStatus('uninitialized');
    };

    this.worker = worker;

    const res = (await this.request({
      type: 'init',
      id: this.nextId(),
      stdinBuffer: this.stdinSab ?? undefined,
      interruptBuffer: this.interruptSab ?? undefined,
      files: initialFiles,
    })) as Extract<TerminalWorkerEvent, { type: 'ready' }>;

    this.pythonVersion = res.pythonVersion;
    this.banner = res.banner;
    this.cwd = res.cwd;
    this.setStatus('ready');
    return { pythonVersion: res.pythonVersion, banner: res.banner, cwd: res.cwd };
  }

  private nextId(): string {
    return `term-${++this.counter}`;
  }

  private request(req: TerminalWorkerRequest): Promise<TerminalWorkerEvent> {
    if (!this.worker) {
      return Promise.reject(new Error('Terminal worker not running'));
    }
    const id = 'id' in req ? req.id : this.nextId();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage(req);
    });
  }

  async pushLine(
    line: string
  ): Promise<Extract<TerminalWorkerEvent, { type: 'lineResult' }>> {
    this.setStatus('running');
    try {
      const res = (await this.request({
        type: 'pushLine',
        id: this.nextId(),
        line,
      })) as Extract<TerminalWorkerEvent, { type: 'lineResult' }>;
      this.cwd = res.cwd;
      return res;
    } finally {
      if (this.worker) this.setStatus('ready');
    }
  }

  async shellCommand(
    command: string
  ): Promise<Extract<TerminalWorkerEvent, { type: 'shellResult' }>> {
    this.setStatus('running');
    try {
      const res = (await this.request({
        type: 'shellCommand',
        id: this.nextId(),
        command,
      })) as Extract<TerminalWorkerEvent, { type: 'shellResult' }>;
      this.cwd = res.cwd;
      return res;
    } finally {
      if (this.worker) this.setStatus('ready');
    }
  }

  async complete(
    source: string
  ): Promise<{ completions: string[]; start: number }> {
    if (!this.worker) return { completions: [], start: source.length };
    const res = (await this.request({
      type: 'complete',
      id: this.nextId(),
      source,
    })) as Extract<TerminalWorkerEvent, { type: 'completeResult' }>;
    return { completions: res.completions, start: res.start };
  }

  async loadCode(code: string, label?: string): Promise<boolean> {
    if (!this.worker) return false;
    this.setStatus('running');
    try {
      const res = (await this.request({
        type: 'loadCode',
        id: this.nextId(),
        code,
        label,
      })) as Extract<TerminalWorkerEvent, { type: 'loadCodeResult' }>;
      return res.ok;
    } finally {
      if (this.worker) this.setStatus('ready');
    }
  }

  clearIncompleteBuffer() {
    if (!this.worker) return;
    this.worker.postMessage({
      type: 'clearBuffer',
      id: this.nextId(),
    } satisfies TerminalWorkerRequest);
  }

  syncFiles(files: VirtualFileEntry[]) {
    if (!this.worker) return;
    this.worker.postMessage({
      type: 'syncFiles',
      id: this.nextId(),
      files,
    } satisfies TerminalWorkerRequest);
  }

  enqueueStdinLines(lines: string[]) {
    if (!this.worker || lines.length === 0) return;
    this.worker.postMessage({
      type: 'queueStdin',
      lines,
    } satisfies TerminalWorkerRequest);
  }

  /** Delivers one interactive line to a waiting input() call in SharedArrayBuffer mode. */
  submitSharedStdinLine(line: string | null) {
    if (!this.stdinCtrl || !this.stdinData) return;
    if (line === null) {
      Atomics.store(this.stdinCtrl, 0, 2); // EOF
      Atomics.notify(this.stdinCtrl, 0, 1);
      if (this.worker) this.setStatus('running');
      return;
    }
    const payload = line.endsWith('\n') ? line : `${line}\n`;
    const encoded = this.textEncoder.encode(payload);
    const len = Math.min(encoded.byteLength, this.stdinData.byteLength);
    this.stdinData.set(encoded.subarray(0, len), 0);
    Atomics.store(this.stdinCtrl, 1, len);
    Atomics.store(this.stdinCtrl, 0, 1);
    Atomics.notify(this.stdinCtrl, 0, 1);
    if (this.worker) this.setStatus('running');
  }

  /** Requests SIGINT via SharedArrayBuffer when available. Returns true if sent. */
  sendInterrupt(): boolean {
    if (!this.interruptView) return false;
    Atomics.store(this.interruptView, 0, 2);
    if (this.stdinCtrl) {
      Atomics.store(this.stdinCtrl, 0, 2);
      Atomics.notify(this.stdinCtrl, 0, 1);
    }
    return true;
  }

  async resetRepl(): Promise<void> {
    if (!this.worker) return;
    await this.request({ type: 'resetRepl', id: this.nextId() });
  }

  /** Hard-stops the worker and recreates a clean runtime. */
  async stopAndRestart(files: VirtualFileEntry[] = []): Promise<{
    pythonVersion: string;
    banner: string;
    cwd: string;
  }> {
    this.destroy();
    return this.start(files);
  }

  destroy() {
    for (const [id, entry] of this.pending.entries()) {
      this.pending.delete(id);
      entry.reject(new Error('Terminal worker stopped by user'));
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.setStatus('uninitialized');
  }
}
