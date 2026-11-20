import { loadPyodide, version as pyodideVersion, type PyodideInterface } from 'pyodide';

export interface WorkerRunRequest {
  type: 'run';
  id: string;
  code: string;
  testCode?: string;
  inputs?: string[];
  datasets?: Record<string, string>;
}

export interface WorkerLoadPackagesRequest {
  type: 'loadPackages';
  id: string;
  packages: string[];
}

export interface WorkerInitRequest {
  type: 'init';
  id: string;
}

export type WorkerRequest =
  | WorkerInitRequest
  | WorkerRunRequest
  | WorkerLoadPackagesRequest;

export interface WorkerResponse {
  id: string;
  type: 'init' | 'run' | 'loadPackages';
  ok: boolean;
  pythonVersion?: string;
  stdout: string;
  stderr: string;
  error?: string;
  testPassed?: boolean;
  testError?: string;
}

let pyodide: PyodideInterface | null = null;
let pythonVersion = '';

async function ensurePyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;

  pyodide = await loadPyodide({
    indexURL: '/pyodide/',
    packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
  });

  pythonVersion = pyodide.runPython(
    'import sys; f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"'
  ) as string;

  return pyodide;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;

  try {
    const py = await ensurePyodide();

    if (msg.type === 'init') {
      const res: WorkerResponse = {
        id: msg.id,
        type: 'init',
        ok: true,
        pythonVersion,
        stdout: '',
        stderr: '',
      };
      self.postMessage(res);
      return;
    }

    if (msg.type === 'loadPackages') {
      if (msg.packages.length > 0) {
        await py.loadPackage(msg.packages);
      }
      const res: WorkerResponse = {
        id: msg.id,
        type: 'loadPackages',
        ok: true,
        pythonVersion,
        stdout: '',
        stderr: '',
      };
      self.postMessage(res);
      return;
    }

    if (msg.type === 'run') {
      // Write any dataset files into Pyodide's in-memory filesystem
      if (msg.datasets) {
        for (const [filename, content] of Object.entries(msg.datasets)) {
          py.FS.writeFile(filename, content, { encoding: 'utf8' });
        }
      }

      // Pass inputs and code via Python globals cleanly, then execute in an isolated namespace
      py.globals.set('__pdp_code__', msg.code);
      py.globals.set('__pdp_test_code__', msg.testCode ?? '');
      py.globals.set('__pdp_inputs__', py.toPy(msg.inputs ?? []));

      const resultJson = py.runPython(`
import sys, io, json, traceback, builtins

__pdp_stdout__ = io.StringIO()
__pdp_stderr__ = io.StringIO()
__pdp_old_stdout__ = sys.stdout
__pdp_old_stderr__ = sys.stderr
__pdp_old_input__ = builtins.input

__pdp_input_iter__ = iter(list(__pdp_inputs__))

def __pdp_custom_input__(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
    try:
        val = next(__pdp_input_iter__)
        sys.stdout.write(str(val) + "\\n")
        return str(val)
    except StopIteration:
        raise EOFError("No more pre-supplied inputs available for input().")

sys.stdout = __pdp_stdout__
sys.stderr = __pdp_stderr__
builtins.input = __pdp_custom_input__

__pdp_ns__ = {"__name__": "__main__"}
__pdp_ok__ = True
__pdp_error__ = ""
__pdp_test_passed__ = None
__pdp_test_error__ = ""

try:
    compiled = compile(__pdp_code__, "<student_code>", "exec")
    exec(compiled, __pdp_ns__)
except Exception:
    __pdp_ok__ = False
    __pdp_error__ = traceback.format_exc()

if __pdp_ok__ and __pdp_test_code__:
    try:
        compiled_tests = compile(__pdp_test_code__, "<tests>", "exec")
        exec(compiled_tests, __pdp_ns__)
        __pdp_test_passed__ = True
    except Exception:
        __pdp_test_passed__ = False
        __pdp_test_error__ = traceback.format_exc()

sys.stdout = __pdp_old_stdout__
sys.stderr = __pdp_old_stderr__
builtins.input = __pdp_old_input__

json.dumps({
    "ok": __pdp_ok__,
    "stdout": __pdp_stdout__.getvalue(),
    "stderr": __pdp_stderr__.getvalue(),
    "error": __pdp_error__,
    "testPassed": __pdp_test_passed__,
    "testError": __pdp_test_error__,
})
`) as string;

      const parsed = JSON.parse(resultJson) as {
        ok: boolean;
        stdout: string;
        stderr: string;
        error: string;
        testPassed: boolean | null;
        testError: string;
      };

      const res: WorkerResponse = {
        id: msg.id,
        type: 'run',
        ok: parsed.ok,
        pythonVersion,
        stdout: parsed.stdout,
        stderr: parsed.stderr,
        error: parsed.error || undefined,
        testPassed: parsed.testPassed === null ? undefined : parsed.testPassed,
        testError: parsed.testError || undefined,
      };
      self.postMessage(res);
    }
  } catch (err) {
    const res: WorkerResponse = {
      id: msg.id,
      type: msg.type,
      ok: false,
      stdout: '',
      stderr: '',
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(res);
  }
};
