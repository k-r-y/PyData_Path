import { parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPyodide } from 'pyodide';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harnessPath = path.resolve(__dirname, '../src/runtime/problemHarness.py');
const harnessCode = fs.readFileSync(harnessPath, 'utf8');

let pyPromise = null;

async function getPy() {
  if (!pyPromise) {
    pyPromise = (async () => {
      const py = await loadPyodide();
      py.runPython(harnessCode);
      return py;
    })();
  }
  return pyPromise;
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

    parentPort.postMessage({ id: msg.id, ok: false, error: `Unknown message type: ${msg.type}` });
  } catch (err) {
    parentPort.postMessage({
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
