import { loadPyodide, version as pyodideVersion, type PyodideInterface } from 'pyodide';

export interface VirtualFileEntry {
  path: string;
  content: string;
}

export type TerminalWorkerRequest =
  | {
      type: 'init';
      id: string;
      stdinBuffer?: SharedArrayBuffer;
      interruptBuffer?: SharedArrayBuffer;
      files?: VirtualFileEntry[];
    }
  | {
      type: 'pushLine';
      id: string;
      line: string;
    }
  | {
      type: 'clearBuffer';
      id: string;
    }
  | {
      type: 'complete';
      id: string;
      source: string;
    }
  | {
      type: 'loadCode';
      id: string;
      code: string;
      label?: string;
    }
  | {
      type: 'resetRepl';
      id: string;
    }
  | {
      type: 'queueStdin';
      lines: string[];
    }
  | {
      type: 'syncFiles';
      id: string;
      files: VirtualFileEntry[];
    }
  | {
      type: 'shellCommand';
      id: string;
      command: string;
    };

export type TerminalWorkerEvent =
  | {
      type: 'ready';
      id: string;
      pythonVersion: string;
      banner: string;
      crossOriginIsolated: boolean;
      cwd: string;
    }
  | {
      type: 'output';
      stream: 'stdout' | 'stderr';
      text: string;
    }
  | {
      type: 'stdinRequest';
    }
  | {
      type: 'lineResult';
      id: string;
      syntaxCheck: 'complete' | 'incomplete' | 'syntax-error';
      prompt: '>>> ' | '... ';
      valueText?: string;
      errorText?: string;
      cwd: string;
    }
  | {
      type: 'completeResult';
      id: string;
      completions: string[];
      start: number;
    }
  | {
      type: 'loadCodeResult';
      id: string;
      ok: boolean;
      errorText?: string;
    }
  | {
      type: 'shellResult';
      id: string;
      ok: boolean;
      cwd: string;
      action?: 'clear' | 'enterRepl' | 'exitShell';
      vfsFiles?: VirtualFileEntry[];
    }
  | {
      type: 'error';
      id?: string;
      message: string;
    };

const WORKSPACE_ROOT = '/workspace';

let pyodide: PyodideInterface | null = null;
let pyVersion = '';
let pyconsole: any = null;
let awaitFut: any = null;
let reprShorten: any = null;
let bannerText = '';

let stdinCtrl: Int32Array | null = null;
let stdinData: Uint8Array | null = null;
let interruptView: Uint8Array | null = null;
const queuedStdin: string[] = [];

const textDecoder = new TextDecoder();

function emitOut(text: string) {
  if (!text) return;
  self.postMessage({ type: 'output', stream: 'stdout', text } satisfies TerminalWorkerEvent);
}

function emitErr(text: string) {
  if (!text) return;
  self.postMessage({ type: 'output', stream: 'stderr', text } satisfies TerminalWorkerEvent);
}

function clearInterruptFlag() {
  if (interruptView) {
    Atomics.store(interruptView, 0, 0);
  }
}

/**
 * Synchronous stdin reader called by pyodide.console._ReadStream or pyodide.setStdin.
 * Reads from any queued lines first, then blocks on SharedArrayBuffer when cross-origin
 * isolated, or returns empty string (triggering EOFError) in queued fallback mode.
 */
function readStdinLine(): string {
  if (queuedStdin.length > 0) {
    const next = queuedStdin.shift() ?? '';
    return next.endsWith('\n') ? next : `${next}\n`;
  }

  if (!stdinCtrl || !stdinData) {
    return '';
  }

  Atomics.store(stdinCtrl, 0, 0);
  self.postMessage({ type: 'stdinRequest' } satisfies TerminalWorkerEvent);

  while (Atomics.load(stdinCtrl, 0) === 0) {
    if (interruptView && Atomics.load(interruptView, 0) === 2) {
      return '';
    }
    Atomics.wait(stdinCtrl, 0, 0, 100);
  }

  const state = Atomics.load(stdinCtrl, 0);
  if (state === 1) {
    const byteLen = Math.min(Atomics.load(stdinCtrl, 1), stdinData.byteLength);
    // Copy slice because TextDecoder rejects SharedArrayBuffer views directly
    const copy = new Uint8Array(byteLen);
    copy.set(stdinData.subarray(0, byteLen));
    return textDecoder.decode(copy);
  }

  return '';
}

function ensureDirRecursive(py: PyodideInterface, dirPath: string) {
  const parts = dirPath.split('/').filter(Boolean);
  let cur = '';
  for (const part of parts) {
    cur += `/${part}`;
    try {
      const info = py.FS.analyzePath(cur);
      if (!info.exists) {
        py.FS.mkdir(cur);
      }
    } catch {
      // Ignore if concurrently exists
    }
  }
}

function resolveVfsPath(py: PyodideInterface, rawPath: string): string {
  const cwd = py.FS.cwd() || WORKSPACE_ROOT;
  const trimmed = rawPath.trim();
  const base = trimmed.startsWith('/') ? trimmed : `${cwd === '/' ? '' : cwd}/${trimmed}`;
  const segments: string[] = [];
  for (const part of base.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return `/${segments.join('/')}`;
}

function listWorkspaceFiles(py: PyodideInterface, dir = WORKSPACE_ROOT, prefix = ''): VirtualFileEntry[] {
  const out: VirtualFileEntry[] = [];
  let entries: string[] = [];
  try {
    entries = py.FS.readdir(dir).filter((name: string) => name !== '.' && name !== '..');
  } catch {
    return out;
  }
  entries.sort((a, b) => a.localeCompare(b));
  for (const name of entries) {
    const full = `${dir}/${name}`;
    const rel = prefix ? `${prefix}/${name}` : name;
    try {
      const stat = py.FS.stat(full);
      if (py.FS.isDir(stat.mode)) {
        out.push(...listWorkspaceFiles(py, full, rel));
      } else {
        const content = py.FS.readFile(full, { encoding: 'utf8' });
        out.push({ path: rel, content });
      }
    } catch {
      // Skip non-readable/binary entries
    }
  }
  return out;
}

function removeVfsPathRecursive(py: PyodideInterface, targetPath: string) {
  const info = py.FS.analyzePath(targetPath);
  if (!info.exists) return;
  const stat = py.FS.stat(targetPath);
  if (py.FS.isDir(stat.mode)) {
    for (const entry of py.FS.readdir(targetPath)) {
      if (entry === '.' || entry === '..') continue;
      removeVfsPathRecursive(py, `${targetPath}/${entry}`);
    }
    py.FS.rmdir(targetPath);
  } else {
    py.FS.unlink(targetPath);
  }
}

function applyWorkspaceFiles(py: PyodideInterface, files: VirtualFileEntry[]) {
  ensureDirRecursive(py, WORKSPACE_ROOT);
  const desired = new Set(files.map((f) => f.path.replace(/^\/+/, '')));
  // Remove stale regular files inside /workspace that are no longer in playground
  const existing = listWorkspaceFiles(py);
  for (const old of existing) {
    if (!desired.has(old.path)) {
      try {
        py.FS.unlink(`${WORKSPACE_ROOT}/${old.path}`);
      } catch {
        // Ignore
      }
    }
  }
  for (const f of files) {
    const cleanRel = f.path.replace(/^\/+/, '');
    if (!cleanRel) continue;
    const full = `${WORKSPACE_ROOT}/${cleanRel}`;
    const lastSlash = full.lastIndexOf('/');
    if (lastSlash > 0) {
      ensureDirRecursive(py, full.slice(0, lastSlash));
    }
    py.FS.writeFile(full, f.content, { encoding: 'utf8' });
  }
}

function setupConsole(py: PyodideInterface) {
  if (pyconsole) {
    try {
      pyconsole.destroy();
    } catch {
      // Ignore
    }
  }
  const consoleMod = py.pyimport('pyodide.console');
  reprShorten = consoleMod.repr_shorten;
  bannerText = String(consoleMod.BANNER);
  const PyodideConsole = consoleMod.PyodideConsole;
  pyconsole = PyodideConsole(py.globals);
  pyconsole.stdout_callback = (s: string) => emitOut(s);
  pyconsole.stderr_callback = (s: string) => emitErr(s);
  pyconsole.stdin_callback = () => readStdinLine();
  consoleMod.destroy();
}

async function initRuntime(msg: Extract<TerminalWorkerRequest, { type: 'init' }>) {
  if (msg.stdinBuffer) {
    stdinCtrl = new Int32Array(msg.stdinBuffer, 0, 2);
    stdinData = new Uint8Array(msg.stdinBuffer, 8);
  } else {
    stdinCtrl = null;
    stdinData = null;
  }
  if (msg.interruptBuffer) {
    interruptView = new Uint8Array(msg.interruptBuffer);
  } else {
    interruptView = null;
  }

  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: '/pyodide/',
      packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
    });
  }

  if (interruptView) {
    pyodide.setInterruptBuffer(interruptView);
  }

  pyVersion = pyodide.runPython(
    'import sys; f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"'
  ) as string;

  ensureDirRecursive(pyodide, WORKSPACE_ROOT);
  pyodide.FS.chdir(WORKSPACE_ROOT);
  pyodide.runPython(`
import sys
if "${WORKSPACE_ROOT}" not in sys.path:
    sys.path.insert(0, "${WORKSPACE_ROOT}")
`);

  if (Array.isArray(msg.files) && msg.files.length > 0) {
    applyWorkspaceFiles(pyodide, msg.files);
  }

  const ns = pyodide.globals.get('dict')();
  awaitFut = pyodide.runPython(
    `
import builtins
from pyodide.ffi import to_js
async def await_fut(fut):
    res = await fut
    if res is not None:
        builtins._ = res
    return to_js([res], depth=1)
await_fut
`,
    { globals: ns }
  );
  ns.destroy();

  setupConsole(pyodide);

  self.postMessage({
    type: 'ready',
    id: msg.id,
    pythonVersion: pyVersion,
    banner: bannerText,
    crossOriginIsolated: Boolean(stdinCtrl),
    cwd: pyodide.FS.cwd(),
  } satisfies TerminalWorkerEvent);
}

function tokenizeShellLine(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (quote === '"' && ch === '\\' && i + 1 < line.length) {
        const next = line[i + 1];
        if (next === 'n') current += '\n';
        else if (next === 't') current += '\t';
        else current += next;
        i++;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
      continue;
    }
    if (ch === '\\' && i + 1 < line.length) {
      current += line[++i];
      hasToken = true;
      continue;
    }
    if (/\s/.test(ch)) {
      if (hasToken) {
        tokens.push(current);
        current = '';
        hasToken = false;
      }
      continue;
    }
    current += ch;
    hasToken = true;
  }

  if (hasToken) {
    tokens.push(current);
  }
  return tokens;
}

async function runPythonSnippetInTerminal(
  py: PyodideInterface,
  code: string,
  filename: string,
  intoConsoleGlobals = false
): Promise<boolean> {
  clearInterruptFlag();
  let ok = true;
  py.setStdout({ batched: (text: string) => emitOut(`${text}\n`) });
  py.setStderr({ batched: (text: string) => emitErr(`${text}\n`) });
  py.setStdin({
    stdin: () => {
      const val = readStdinLine();
      return val === '' ? null : val;
    },
  });

  try {
    await py.loadPackagesFromImports(code);
  } catch {
    // Let Python raise ModuleNotFoundError if offline/unavailable
  }

  py.globals.set('__pdp_term_src__', code);
  py.globals.set('__pdp_term_file__', filename);
  py.globals.set('__pdp_into_globals__', intoConsoleGlobals);

  const errJson = py.runPython(`
import traceback, json as _json
_err_msg = ""
_target_ns = globals() if __pdp_into_globals__ else {"__name__": "__main__", "__file__": __pdp_term_file__}
_prev_file = _target_ns.get("__file__", None)
_target_ns["__file__"] = __pdp_term_file__
try:
    _code_obj = compile(__pdp_term_src__, __pdp_term_file__, "exec")
    exec(_code_obj, _target_ns)
except KeyboardInterrupt:
    _err_msg = "KeyboardInterrupt\\n"
except BaseException:
    _err_msg = traceback.format_exc()
finally:
    if __pdp_into_globals__:
        if _prev_file is None:
            _target_ns.pop("__file__", None)
        else:
            _target_ns["__file__"] = _prev_file
_json.dumps(_err_msg)
`) as string;

  const errMsg = JSON.parse(errJson) as string;
  if (errMsg) {
    ok = false;
    emitErr(errMsg.endsWith('\n') ? errMsg : `${errMsg}\n`);
  }

  // Restore empty/default handlers so REPL retains clean stdout callbacks
  py.setStdout({});
  py.setStderr({});
  py.setStdin({});
  clearInterruptFlag();
  return ok;
}

async function handleShellCommand(
  py: PyodideInterface,
  rawCmd: string,
  id: string
): Promise<void> {
  const trimmed = rawCmd.trim();
  if (!trimmed) {
    self.postMessage({
      type: 'shellResult',
      id,
      ok: true,
      cwd: py.FS.cwd(),
    } satisfies TerminalWorkerEvent);
    return;
  }

  const tokens = tokenizeShellLine(trimmed);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  if (cmd === 'help') {
    emitOut(
      [
        'Simulated Shell commands:',
        '  help                  Show this command reference',
        '  pwd                   Print current virtual directory',
        '  ls [-l] [dir]         List directory contents',
        '  cd [dir]              Change virtual directory (default /workspace)',
        '  cat <file>            Print file contents',
        '  mkdir [-p] <dir>      Create directory',
        '  touch <file>          Create empty file if missing',
        '  rm [-r|-rf] <path>    Remove file or directory',
        '  echo <text> [> file]  Print text or write/append to virtual file',
        '  clear                 Clear terminal output',
        '  python                Enter interactive Python REPL',
        '  python <file.py>      Execute virtual workspace file',
        '  python -c "<code>"    Execute inline Python snippet',
        '  python --version      Print Python runtime version',
        '  pip list              List loaded/installed Python packages',
        '  pip install <pkg>     Install package via micropip (requires network)',
        '  exit                  Return to interactive Python REPL',
      ].join('\n') + '\n'
    );
    self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'clear') {
    self.postMessage({
      type: 'shellResult',
      id,
      ok: true,
      cwd: py.FS.cwd(),
      action: 'clear',
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'exit') {
    self.postMessage({
      type: 'shellResult',
      id,
      ok: true,
      cwd: py.FS.cwd(),
      action: 'exitShell',
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'pwd') {
    emitOut(`${py.FS.cwd()}\n`);
    self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'ls') {
    let longMode = false;
    let targetArg = '';
    for (const a of args) {
      if (a === '-l' || a === '-la' || a === '-al') longMode = true;
      else targetArg = a;
    }
    const targetPath = targetArg ? resolveVfsPath(py, targetArg) : py.FS.cwd();
    const info = py.FS.analyzePath(targetPath);
    if (!info.exists) {
      emitErr(`ls: ${targetArg || targetPath}: No such file or directory\n`);
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    const st = py.FS.stat(targetPath);
    if (!py.FS.isDir(st.mode)) {
      emitOut(`${targetArg || targetPath}\n`);
      self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    const names = py.FS.readdir(targetPath)
      .filter((n: string) => n !== '.' && n !== '..')
      .sort((a: string, b: string) => a.localeCompare(b));
    if (longMode) {
      for (const n of names) {
        const sub = `${targetPath === '/' ? '' : targetPath}/${n}`;
        const subStat = py.FS.stat(sub);
        const kind = py.FS.isDir(subStat.mode) ? 'dir ' : 'file';
        const sizeStr = String(subStat.size).padStart(7);
        emitOut(`${kind}  ${sizeStr}  ${n}${py.FS.isDir(subStat.mode) ? '/' : ''}\n`);
      }
    } else if (names.length > 0) {
      const formatted = names.map((n: string) => {
        const sub = `${targetPath === '/' ? '' : targetPath}/${n}`;
        return py.FS.isDir(py.FS.stat(sub).mode) ? `${n}/` : n;
      });
      emitOut(`${formatted.join('  ')}\n`);
    }
    self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'cd') {
    const dest = args[0] ? resolveVfsPath(py, args[0]) : WORKSPACE_ROOT;
    const info = py.FS.analyzePath(dest);
    if (!info.exists || !py.FS.isDir(py.FS.stat(dest).mode)) {
      emitErr(`cd: ${args[0] ?? dest}: No such directory\n`);
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    py.FS.chdir(dest);
    self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'cat') {
    if (args.length === 0) {
      emitErr('cat: missing file operand\n');
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    let ok = true;
    for (const arg of args) {
      const p = resolveVfsPath(py, arg);
      const info = py.FS.analyzePath(p);
      if (!info.exists) {
        emitErr(`cat: ${arg}: No such file\n`);
        ok = false;
      } else if (py.FS.isDir(py.FS.stat(p).mode)) {
        emitErr(`cat: ${arg}: Is a directory\n`);
        ok = false;
      } else {
        const content = py.FS.readFile(p, { encoding: 'utf8' });
        emitOut(content.endsWith('\n') || content.length === 0 ? content : `${content}\n`);
      }
    }
    self.postMessage({ type: 'shellResult', id, ok, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'mkdir') {
    const dirs = args.filter((a) => a !== '-p');
    if (dirs.length === 0) {
      emitErr('mkdir: missing operand\n');
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    for (const d of dirs) {
      ensureDirRecursive(py, resolveVfsPath(py, d));
    }
    self.postMessage({
      type: 'shellResult',
      id,
      ok: true,
      cwd: py.FS.cwd(),
      vfsFiles: listWorkspaceFiles(py),
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'touch') {
    if (args.length === 0) {
      emitErr('touch: missing file operand\n');
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    for (const f of args) {
      const p = resolveVfsPath(py, f);
      const lastSlash = p.lastIndexOf('/');
      if (lastSlash > 0) ensureDirRecursive(py, p.slice(0, lastSlash));
      if (!py.FS.analyzePath(p).exists) {
        py.FS.writeFile(p, '', { encoding: 'utf8' });
      }
    }
    self.postMessage({
      type: 'shellResult',
      id,
      ok: true,
      cwd: py.FS.cwd(),
      vfsFiles: listWorkspaceFiles(py),
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'rm') {
    const recursive = args.some((a) => a === '-r' || a === '-rf' || a === '-fr' || a === '-R');
    const targets = args.filter((a) => !a.startsWith('-'));
    if (targets.length === 0) {
      emitErr('rm: missing operand\n');
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    let ok = true;
    for (const t of targets) {
      const p = resolveVfsPath(py, t);
      if (p === '/' || p === WORKSPACE_ROOT) {
        emitErr(`rm: refusing to remove protected directory ${p}\n`);
        ok = false;
        continue;
      }
      const info = py.FS.analyzePath(p);
      if (!info.exists) {
        emitErr(`rm: cannot remove '${t}': No such file or directory\n`);
        ok = false;
        continue;
      }
      if (py.FS.isDir(py.FS.stat(p).mode) && !recursive) {
        emitErr(`rm: cannot remove '${t}': Is a directory (use -r)\n`);
        ok = false;
        continue;
      }
      removeVfsPathRecursive(py, p);
    }
    self.postMessage({
      type: 'shellResult',
      id,
      ok,
      cwd: py.FS.cwd(),
      vfsFiles: listWorkspaceFiles(py),
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'echo') {
    const redirectIdx = args.findIndex((a) => a === '>' || a === '>>');
    if (redirectIdx >= 0 && args[redirectIdx + 1]) {
      const append = args[redirectIdx] === '>>';
      const content = `${args.slice(0, redirectIdx).join(' ')}\n`;
      const targetPath = resolveVfsPath(py, args[redirectIdx + 1]);
      const lastSlash = targetPath.lastIndexOf('/');
      if (lastSlash > 0) ensureDirRecursive(py, targetPath.slice(0, lastSlash));
      let prev = '';
      if (append && py.FS.analyzePath(targetPath).exists) {
        prev = py.FS.readFile(targetPath, { encoding: 'utf8' });
      }
      py.FS.writeFile(targetPath, prev + content, { encoding: 'utf8' });
      self.postMessage({
        type: 'shellResult',
        id,
        ok: true,
        cwd: py.FS.cwd(),
        vfsFiles: listWorkspaceFiles(py),
      } satisfies TerminalWorkerEvent);
      return;
    }
    emitOut(`${args.join(' ')}\n`);
    self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'python' || cmd === 'python3') {
    if (args.length === 0) {
      self.postMessage({
        type: 'shellResult',
        id,
        ok: true,
        cwd: py.FS.cwd(),
        action: 'enterRepl',
      } satisfies TerminalWorkerEvent);
      return;
    }
    if (args[0] === '--version' || args[0] === '-V') {
      emitOut(`Python ${pyVersion} (Pyodide ${pyodideVersion})\n`);
      self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    if (args[0] === '-c') {
      const codeArg = args.slice(1).join(' ');
      if (!codeArg) {
        emitErr('python: option -c requires an argument\n');
        self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
        return;
      }
      const ok = await runPythonSnippetInTerminal(py, codeArg, '<string>');
      self.postMessage({
        type: 'shellResult',
        id,
        ok,
        cwd: py.FS.cwd(),
        vfsFiles: listWorkspaceFiles(py),
      } satisfies TerminalWorkerEvent);
      return;
    }
    const scriptPath = resolveVfsPath(py, args[0]);
    const info = py.FS.analyzePath(scriptPath);
    if (!info.exists || py.FS.isDir(py.FS.stat(scriptPath).mode)) {
      emitErr(`python: can't open file '${args[0]}': No such file\n`);
      self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }
    const scriptCode = py.FS.readFile(scriptPath, { encoding: 'utf8' });
    const ok = await runPythonSnippetInTerminal(py, scriptCode, scriptPath);
    self.postMessage({
      type: 'shellResult',
      id,
      ok,
      cwd: py.FS.cwd(),
      vfsFiles: listWorkspaceFiles(py),
    } satisfies TerminalWorkerEvent);
    return;
  }

  if (cmd === 'pip') {
    const sub = args[0];
    if (sub === 'list') {
      const loaded = Object.keys(py.loadedPackages ?? {});
      const metaRaw = py.runPython(`
import importlib.metadata, json as _json
_dists = sorted([(d.metadata.get("Name", d.name), d.version) for d in importlib.metadata.distributions()], key=lambda x: x[0].lower())
_json.dumps(_dists)
`) as string;
      const dists = JSON.parse(metaRaw) as Array<[string, string]>;
      const merged = new Map<string, string>();
      for (const [n, v] of dists) merged.set(n, v);
      for (const pkg of loaded) {
        if (!merged.has(pkg)) merged.set(pkg, 'loaded');
      }
      if (merged.size === 0) {
        emitOut('No optional third-party packages loaded yet. Python stdlib is built in.\n');
      } else {
        emitOut('Package                 Version\n');
        emitOut('----------------------- -----------\n');
        for (const [name, ver] of Array.from(merged.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
          emitOut(`${name.padEnd(23)} ${ver}\n`);
        }
      }
      self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      return;
    }

    if (sub === 'install') {
      const pkgs = args.slice(1).filter((a) => !a.startsWith('-'));
      if (pkgs.length === 0) {
        emitErr('pip install: specify at least one package name.\n');
        self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
        return;
      }
      emitOut(`Installing ${pkgs.join(', ')} via micropip (network required)...\n`);
      try {
        await py.loadPackage('micropip');
      } catch {
        // Check below if micropip is actually present
      }
      if (!('micropip' in py.loadedPackages)) {
        emitErr(
          'pip install failed: could not load micropip. Check your internet connection or whether CDN requests are blocked offline.\n'
        );
        self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
        return;
      }

      try {
        py.globals.set('__pdp_pip_pkgs__', pkgs);
        await py.runPythonAsync(`
import micropip
await micropip.install(list(__pdp_pip_pkgs__))
`);
        emitOut(`Successfully installed ${pkgs.join(', ')}.\n`);
        self.postMessage({ type: 'shellResult', id, ok: true, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        emitErr(
          `pip install failed for ${pkgs.join(', ')}: ${msg}\nNote: pip install requires network access and either Pyodide-built wheels or pure-Python wheels from PyPI.\n`
        );
        self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
      }
      return;
    }

    emitErr(`pip: unsupported subcommand '${sub ?? ''}'. Supported: pip list, pip install <pkg>.\n`);
    self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
    return;
  }

  emitErr(`${cmd}: command not found in simulated shell. Type 'help' for supported commands.\n`);
  self.postMessage({ type: 'shellResult', id, ok: false, cwd: py.FS.cwd() } satisfies TerminalWorkerEvent);
}

self.onmessage = async (event: MessageEvent<TerminalWorkerRequest>) => {
  const msg = event.data;
  try {
    if (msg.type === 'init') {
      await initRuntime(msg);
      return;
    }

    if (msg.type === 'queueStdin') {
      for (const line of msg.lines) {
        queuedStdin.push(line);
      }
      if (stdinCtrl && stdinData && queuedStdin.length > 0 && Atomics.load(stdinCtrl, 0) === 0) {
        // Wake waiting stdin only if worker isn't already running inside wait?
        // Actually worker executes synchronously inside Atomics.wait so queueStdin
        // arriving on main thread uses stdinCtrl directly; worker-side queuedStdin
        // handles pre-queued lines before execution.
      }
      return;
    }

    if (!pyodide) {
      throw new Error('Terminal runtime is not initialized.');
    }

    if (msg.type === 'syncFiles') {
      applyWorkspaceFiles(pyodide, msg.files);
      return;
    }

    if (msg.type === 'clearBuffer') {
      pyconsole.buffer.clear();
      return;
    }

    if (msg.type === 'resetRepl') {
      // Clear user bindings while retaining builtins/sys modules
      pyodide.runPython(`
for _k in list(globals().keys()):
    if not _k.startswith('__') and _k != '_':
        del globals()[_k]
`);
      setupConsole(pyodide);
      self.postMessage({
        type: 'ready',
        id: msg.id,
        pythonVersion: pyVersion,
        banner: bannerText,
        crossOriginIsolated: Boolean(stdinCtrl),
        cwd: pyodide.FS.cwd(),
      } satisfies TerminalWorkerEvent);
      return;
    }

    if (msg.type === 'complete') {
      const result = pyconsole.complete(msg.source);
      const completions = result[0].toJs() as string[];
      const start = Number(result[1]);
      result.destroy();
      self.postMessage({
        type: 'completeResult',
        id: msg.id,
        completions,
        start,
      } satisfies TerminalWorkerEvent);
      return;
    }

    if (msg.type === 'loadCode') {
      const ok = await runPythonSnippetInTerminal(
        pyodide,
        msg.code,
        msg.label || '<editor>',
        true
      );
      self.postMessage({
        type: 'loadCodeResult',
        id: msg.id,
        ok,
      } satisfies TerminalWorkerEvent);
      return;
    }

    if (msg.type === 'shellCommand') {
      await handleShellCommand(pyodide, msg.command, msg.id);
      return;
    }

    if (msg.type === 'pushLine') {
      const normalized = msg.line.replace(/\u00a0/g, ' ');
      clearInterruptFlag();
      const fut = pyconsole.push(normalized);
      const syntaxCheck = String(fut.syntax_check) as 'complete' | 'incomplete' | 'syntax-error';

      if (syntaxCheck === 'syntax-error') {
        const errorText = String(fut.formatted_error ?? '').trimEnd();
        fut.destroy();
        self.postMessage({
          type: 'lineResult',
          id: msg.id,
          syntaxCheck: 'syntax-error',
          prompt: '>>> ',
          errorText,
          cwd: pyodide.FS.cwd(),
        } satisfies TerminalWorkerEvent);
        return;
      }

      if (syntaxCheck === 'incomplete') {
        fut.destroy();
        self.postMessage({
          type: 'lineResult',
          id: msg.id,
          syntaxCheck: 'incomplete',
          prompt: '... ',
          cwd: pyodide.FS.cwd(),
        } satisfies TerminalWorkerEvent);
        return;
      }

      // Complete statement
      let valueText: string | undefined;
      let errorText: string | undefined;
      try {
        const wrapped = awaitFut(fut);
        const [value] = await wrapped;
        if (value !== undefined) {
          valueText = String(
            reprShorten.callKwargs(value, {
              separator: '\n<long output truncated>\n',
            })
          );
        }
        if (value instanceof pyodide.ffi.PyProxy) {
          value.destroy();
        }
        wrapped.destroy();
      } catch (err) {
        errorText = String(fut.formatted_error || (err instanceof Error ? err.message : err)).trimEnd();
      } finally {
        fut.destroy();
        clearInterruptFlag();
      }

      self.postMessage({
        type: 'lineResult',
        id: msg.id,
        syntaxCheck: 'complete',
        prompt: '>>> ',
        valueText,
        errorText,
        cwd: pyodide.FS.cwd(),
      } satisfies TerminalWorkerEvent);
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      id: (msg as { id?: string }).id,
      message: err instanceof Error ? err.message : String(err),
    } satisfies TerminalWorkerEvent);
  }
};
