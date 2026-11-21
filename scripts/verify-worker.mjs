import { parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harnessPath = path.resolve(__dirname, '../src/runtime/problemHarness.py');
const harnessCode = fs.readFileSync(harnessPath, 'utf8');

let pyPromise = null;
const unavailablePackages = new Set();

const PACKAGE_MODULE_MAP = {
  'scikit-learn': 'sklearn',
};

async function getPy() {
  if (!pyPromise) {
    pyPromise = (async () => {
      // Redirect C-level streams in Node worker_threads where fd may be undefined
      const py = await loadPyodide({
        stdout: () => {},
        stderr: () => {},
      });
      py.runPython(harnessCode);
      return py;
    })();
  }
  return pyPromise;
}

function checkSyntax(py, code) {
  py.globals.set('__pdp_syn_code__', code);
  try {
    py.runPython('import ast; ast.parse(__pdp_syn_code__)');
    return { syntaxOk: true, error: '' };
  } catch (syn) {
    return {
      syntaxOk: false,
      error: syn instanceof Error ? syn.message : String(syn),
    };
  }
}

parentPort.on('message', async (msg) => {
  try {
    const py = await getPy();

    if (msg.type === 'prepare') {
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
`);
      parentPort.postMessage({ id: msg.id, ok: true, data: JSON.parse(raw) });
      return;
    }

    if (msg.type === 'test') {
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
`);
      parentPort.postMessage({ id: msg.id, ok: true, data: JSON.parse(raw) });
      return;
    }

    if (msg.type === 'lessonExec') {
      if (Array.isArray(msg.packages) && msg.packages.length > 0) {
        const knownMissing = msg.packages.filter((p) => unavailablePackages.has(p));
        if (knownMissing.length === 0) {
          const toLoad = msg.packages.filter((p) => !(p in py.loadedPackages));
          if (toLoad.length > 0) {
            const origLog = console.log;
            const origWarn = console.warn;
            const origErr = console.error;
            console.log = () => {};
            console.warn = () => {};
            console.error = () => {};
            try {
              await py.loadPackage(toLoad);
            } catch {
              // Handled below via loadedPackages / importlib check
            } finally {
              console.log = origLog;
              console.warn = origWarn;
              console.error = origErr;
            }
          }
          // Check both loadedPackages and importlib.util.find_spec because Pyodide may
          // resolve loadPackage() without throwing when CDN fetches fail offline.
          py.globals.set(
            '__pdp_pkg_mods__',
            JSON.stringify(msg.packages.map((p) => [p, PACKAGE_MODULE_MAP[p] || p]))
          );
          const missingJson = py.runPython(`
import importlib.util, json as _json
_pairs = _json.loads(__pdp_pkg_mods__)
_json.dumps([pkg for pkg, mod in _pairs if importlib.util.find_spec(mod) is None])
`);
          const missingNow = JSON.parse(missingJson);
          for (const p of missingNow) {
            unavailablePackages.add(p);
          }
        }

        const stillMissing = msg.packages.filter((p) => unavailablePackages.has(p));
        if (stillMissing.length > 0) {
          const syn = checkSyntax(py, msg.code);
          let visSyn = { syntaxOk: true, error: '' };
          if (syn.syntaxOk && msg.visibleTests) {
            visSyn = checkSyntax(py, msg.visibleTests);
          }
          parentPort.postMessage({
            id: msg.id,
            ok: true,
            data: {
              skippedPackage: true,
              packages: stillMissing,
              syntaxOk: syn.syntaxOk && visSyn.syntaxOk,
              error:
                syn.syntaxOk && visSyn.syntaxOk
                  ? `Skipped runtime execution in offline Node verifier (missing packages: ${stillMissing.join(', ')})`
                  : `${syn.error} ${visSyn.error}`.trim(),
            },
          });
          return;
        }
      }

      py.globals.set(
        '__pdp_lesson_payload__',
        JSON.stringify({
          code: msg.code,
          visibleTests: msg.visibleTests ?? '',
          hiddenTests: msg.hiddenTests ?? '',
          inputs: msg.inputs ?? [],
          exportState: Boolean(msg.exportState),
        })
      );
      const raw = py.runPython(`
import sys, io, json, traceback, builtins

_lp = json.loads(__pdp_lesson_payload__)
_stdout = io.StringIO()
_stderr = io.StringIO()
_old_out, _old_err, _old_in = sys.stdout, sys.stderr, builtins.input
_inp_iter = iter(list(_lp.get("inputs") or []))

def _custom_inp(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
    try:
        v = next(_inp_iter)
        sys.stdout.write(str(v) + "\\n")
        return str(v)
    except StopIteration:
        raise EOFError("No more pre-supplied inputs")

sys.stdout, sys.stderr, builtins.input = _stdout, _stderr, _custom_inp
_ns = {"__name__": "__main__"}
_ok = True
_err = ""
_state_json = None

try:
    exec(compile(_lp["code"], "<lesson_solution>", "exec"), _ns)
    if _lp.get("visibleTests"):
        exec(compile(_lp["visibleTests"], "<visible_tests>", "exec"), _ns)
    if _lp.get("hiddenTests"):
        exec(compile(_lp["hiddenTests"], "<hidden_tests>", "exec"), _ns)
    if _lp.get("exportState"):
        _st = {}
        for _k, _v in list(_ns.items()):
            if not _k.startswith("_") and not callable(_v):
                try:
                    _st[_k] = repr(_v)
                except Exception:
                    pass
        _state_json = json.dumps(_st, sort_keys=True)
except Exception:
    _ok = False
    _err = traceback.format_exc()
finally:
    sys.stdout, sys.stderr, builtins.input = _old_out, _old_err, _old_in

json.dumps({
    "ok": _ok,
    "stdout": _stdout.getvalue(),
    "stderr": _stderr.getvalue(),
    "error": _err,
    "stateJson": _state_json,
})
`);
      parentPort.postMessage({ id: msg.id, ok: true, data: JSON.parse(raw) });
      return;
    }

    parentPort.postMessage({ id: msg.id, ok: false, error: `Unknown message type: ${msg.type}` });
  } catch (err) {
    parentPort.postMessage({
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
