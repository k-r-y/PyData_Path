import { loadPyodide, version as pyodideVersion, type PyodideInterface } from 'pyodide';
import problemHarnessPy from './problemHarness.py?raw';
import type { ProblemCompare, ProblemEntry, ProblemTestCase } from '../types/problem';

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

export interface WorkerPrepareProblemRequest {
  type: 'prepareProblem';
  id: string;
  code: string;
  inputs?: string[];
  datasets?: Record<string, string>;
}

export interface WorkerRunProblemTestRequest {
  type: 'runProblemTest';
  id: string;
  entry: ProblemEntry;
  compare: ProblemCompare;
  test: ProblemTestCase;
  checkerCode?: string;
}

export interface WorkerRunProblemCustomRequest {
  type: 'runProblemCustom';
  id: string;
  code: string;
  entry: ProblemEntry;
  customInput: string;
  inputs?: string[];
}

export type WorkerRequest =
  | WorkerInitRequest
  | WorkerRunRequest
  | WorkerLoadPackagesRequest
  | WorkerPrepareProblemRequest
  | WorkerRunProblemTestRequest
  | WorkerRunProblemCustomRequest;

export interface WorkerResponse {
  id: string;
  type: WorkerRequest['type'];
  ok: boolean;
  pythonVersion?: string;
  stdout: string;
  stderr: string;
  error?: string;
  errorType?: string;
  errorLine?: number | null;
  testPassed?: boolean;
  testError?: string;
  problemTestResult?: {
    label: string;
    status: 'Passed' | 'Wrong Answer' | 'Runtime Error';
    passed: boolean;
    runtimeMs: number;
    inputRepr?: string;
    expectedRepr?: string;
    actualRepr?: string;
    stdout: string;
    stderr: string;
    error?: string;
    errorType?: string;
    errorLine?: number | null;
  };
  customResult?: {
    ok: boolean;
    runtimeMs: number;
    returnRepr: string;
    stdout: string;
    stderr: string;
    error?: string;
    errorLine?: number | null;
  };
}

let pyodide: PyodideInterface | null = null;
let pythonVersion = '';
let harnessLoaded = false;

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

function ensureProblemHarness(py: PyodideInterface): void {
  if (harnessLoaded) return;
  py.runPython(problemHarnessPy);
  harnessLoaded = true;
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

    if (msg.type === 'prepareProblem') {
      ensureProblemHarness(py);
      py.globals.set(
        '__pdp_prep_payload__',
        JSON.stringify({
          code: msg.code,
          inputs: msg.inputs ?? [],
          datasets: msg.datasets ?? null,
        })
      );
      const raw = py.runPython(`
import json
_payload = json.loads(__pdp_prep_payload__)
__pdp_problem_ns__, _prep_res = prepare_problem_run(
    _payload["code"],
    _payload.get("inputs"),
    _payload.get("datasets"),
)
json.dumps(_prep_res)
`) as string;
      const parsed = JSON.parse(raw) as {
        ok: boolean;
        stdout: string;
        stderr: string;
        error: string;
        errorType: string;
        errorLine: number | null;
      };
      self.postMessage({
        id: msg.id,
        type: 'prepareProblem',
        ok: parsed.ok,
        pythonVersion,
        stdout: parsed.stdout,
        stderr: parsed.stderr,
        error: parsed.error || undefined,
        errorType: parsed.errorType || undefined,
        errorLine: parsed.errorLine,
      } satisfies WorkerResponse);
      return;
    }

    if (msg.type === 'runProblemTest') {
      ensureProblemHarness(py);
      py.globals.set(
        '__pdp_test_payload__',
        JSON.stringify({
          entry: msg.entry,
          compare: msg.compare,
          test: msg.test,
          checkerCode: msg.checkerCode ?? null,
        })
      );
      const raw = py.runPython(`
import json
_t_payload = json.loads(__pdp_test_payload__)
_t_res = run_problem_test(
    __pdp_problem_ns__,
    _t_payload["entry"],
    _t_payload["compare"],
    _t_payload["test"],
    _t_payload.get("checkerCode"),
)
json.dumps(_t_res)
`) as string;
      const parsed = JSON.parse(raw) as NonNullable<WorkerResponse['problemTestResult']>;
      self.postMessage({
        id: msg.id,
        type: 'runProblemTest',
        ok: parsed.passed,
        pythonVersion,
        stdout: parsed.stdout,
        stderr: parsed.stderr,
        problemTestResult: parsed,
      } satisfies WorkerResponse);
      return;
    }

    if (msg.type === 'runProblemCustom') {
      ensureProblemHarness(py);
      py.globals.set(
        '__pdp_custom_payload__',
        JSON.stringify({
          code: msg.code,
          entry: msg.entry,
          customInput: msg.customInput,
          inputs: msg.inputs ?? [],
        })
      );
      const raw = py.runPython(`
import json
_c_payload = json.loads(__pdp_custom_payload__)
_c_ns, _c_prep = prepare_problem_run(_c_payload["code"], _c_payload.get("inputs"))
if not _c_prep["ok"]:
    _out = {
        "ok": False,
        "runtimeMs": 0.0,
        "returnRepr": "",
        "stdout": _c_prep["stdout"],
        "stderr": _c_prep["stderr"],
        "error": _c_prep["error"],
        "errorLine": _c_prep["errorLine"],
    }
else:
    _out = run_problem_custom(_c_ns, _c_payload["entry"], _c_payload["customInput"])
    _out["stdout"] = (_c_prep["stdout"] or "") + (_out.get("stdout") or "")
json.dumps(_out)
`) as string;
      const parsed = JSON.parse(raw) as NonNullable<WorkerResponse['customResult']>;
      self.postMessage({
        id: msg.id,
        type: 'runProblemCustom',
        ok: parsed.ok,
        pythonVersion,
        stdout: parsed.stdout,
        stderr: parsed.stderr,
        error: parsed.error || undefined,
        errorLine: parsed.errorLine,
        customResult: parsed,
      } satisfies WorkerResponse);
      return;
    }

    if (msg.type === 'run') {
      if (msg.datasets) {
        const pyModNames: string[] = [];
        for (const [filename, content] of Object.entries(msg.datasets)) {
          const clean = filename.replace(/^\/+/, '');
          const lastSlash = clean.lastIndexOf('/');
          if (lastSlash > 0) {
            const dir = clean.slice(0, lastSlash);
            const parts = dir.split('/').filter(Boolean);
            let cur = '';
            for (const p of parts) {
              cur = cur ? `${cur}/${p}` : p;
              if (!py.FS.analyzePath(cur).exists) {
                py.FS.mkdir(cur);
              }
            }
          }
          py.FS.writeFile(clean, content, { encoding: 'utf8' });
          if (clean.endsWith('.py')) {
            pyModNames.push(clean.slice(0, -3).replace(/\//g, '.'));
          }
        }
        if (pyModNames.length > 0) {
          py.globals.set('__pdp_reloaded_mods__', py.toPy(pyModNames));
          py.runPython(`
import sys, os, importlib
if "." not in sys.path and os.getcwd() not in sys.path:
    sys.path.insert(0, os.getcwd())
importlib.invalidate_caches()
for _m in list(__pdp_reloaded_mods__):
    sys.modules.pop(_m, None)
`);
        }
      }

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
