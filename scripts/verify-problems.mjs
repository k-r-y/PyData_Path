import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const problemsDir = path.join(rootDir, 'src/content/problems');
const sourcesPath = path.join(rootDir, 'src/content/sources.json');
const tracksDir = path.join(rootDir, 'src/content/tracks');
const workerScript = path.join(__dirname, 'verify-worker.mjs');

const DEFAULT_TIME_LIMIT_MS = 2000;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const DASH_RE = /[\u2013\u2014]/;

class VerifyWorkerPool {
  constructor() {
    this.worker = null;
    this.counter = 0;
  }

  ensure() {
    if (!this.worker) {
      this.worker = new Worker(workerScript);
    }
    return this.worker;
  }

  async call(payload, timeoutMs) {
    const worker = this.ensure();
    const id = ++this.counter;

    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.terminate();
        resolve({ timedOut: true, ok: false, error: `Timed out after ${timeoutMs} ms` });
      }, timeoutMs);

      const onMsg = (msg) => {
        if (msg.id !== id) return;
        cleanup();
        if (settled) return;
        settled = true;
        resolve({ timedOut: false, ...msg });
      };

      const onErr = (err) => {
        cleanup();
        if (settled) return;
        settled = true;
        this.terminate();
        resolve({ timedOut: false, ok: false, error: err.message });
      };

      const cleanup = () => {
        clearTimeout(timer);
        worker.off('message', onMsg);
        worker.off('error', onErr);
      };

      worker.on('message', onMsg);
      worker.on('error', onErr);
      worker.postMessage({ id, ...payload });
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

function loadValidSourceIds() {
  const arr = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  return new Set(arr.map((s) => s.id));
}

function loadModulePackagesMap() {
  const map = new Map();
  for (const track of fs.readdirSync(tracksDir, { withFileTypes: true })) {
    if (!track.isDirectory()) continue;
    const tDir = path.join(tracksDir, track.name);
    for (const mod of fs.readdirSync(tDir, { withFileTypes: true })) {
      if (!mod.isDirectory()) continue;
      const mPath = path.join(tDir, mod.name, 'module.json');
      if (fs.existsSync(mPath)) {
        const meta = JSON.parse(fs.readFileSync(mPath, 'utf8'));
        if (meta.id) map.set(meta.id, meta);
      }
    }
  }
  return map;
}

function collectExerciseFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectExerciseFiles(full));
    else if (entry.name.endsWith('.exercises.json')) out.push(full);
  }
  return out.sort();
}

async function verifyLessonExercises(pool, moduleMap) {
  const files = collectExerciseFiles(tracksDir);
  let checked = 0;
  let altsChecked = 0;
  let skippedOffline = 0;
  let errors = 0;

  for (const filePath of files) {
    const modDirName = path.basename(path.dirname(filePath));
    let packages = [];
    for (const mod of moduleMap.values()) {
      if (mod.id === modDirName && Array.isArray(mod.packages)) {
        packages = mod.packages;
        break;
      }
    }

    const exercises = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const ex of exercises) {
      if (ex.type === 'code' || ex.type === 'debug') {
        checked++;
        const solRes = await pool.call(
          {
            type: 'lessonExec',
            code: ex.solution,
            visibleTests: ex.visibleTests,
            hiddenTests: ex.hiddenTests,
            inputs: ex.inputs,
            packages,
          },
          8000
        );
        if (solRes.data?.skippedPackage) {
          if (!solRes.data.syntaxOk) {
            console.error(`  [FAIL LESSON] ${ex.id} canonical solution syntax error: ${solRes.data.error}`);
            errors++;
          } else {
            skippedOffline++;
          }
        } else if (!solRes.ok || !solRes.data?.ok) {
          console.error(`  [FAIL LESSON] ${ex.id} canonical solution failed:\n${solRes.data?.error ?? solRes.error}`);
          errors++;
        }

        for (const [altIdx, alt] of (ex.alternates ?? []).entries()) {
          if (typeof alt !== 'string') continue;
          altsChecked++;
          const altRes = await pool.call(
            {
              type: 'lessonExec',
              code: alt,
              visibleTests: ex.visibleTests,
              hiddenTests: ex.hiddenTests,
              inputs: ex.inputs,
              packages,
            },
            8000
          );
          if (altRes.data?.skippedPackage) {
            if (!altRes.data.syntaxOk) {
              console.error(`  [FAIL LESSON] ${ex.id} alternate #${altIdx + 1} syntax error: ${altRes.data.error}`);
              errors++;
            } else {
              skippedOffline++;
            }
          } else if (!altRes.ok || !altRes.data?.ok) {
            console.error(`  [FAIL LESSON] ${ex.id} alternate #${altIdx + 1} failed:\n${altRes.data?.error ?? altRes.error}`);
            errors++;
          }
        }
      } else if (ex.type === 'parsons') {
        checked++;
        const canonical = ex.lines.join('\n');
        const refRes = await pool.call(
          { type: 'lessonExec', code: canonical, exportState: true, packages },
          8000
        );
        if (!refRes.ok || !refRes.data?.ok) {
          console.error(`  [FAIL LESSON] ${ex.id} parsons canonical failed:\n${refRes.data?.error ?? refRes.error}`);
          errors++;
          continue;
        }
        for (const [altIdx, alt] of (ex.alternates ?? []).entries()) {
          if (typeof alt !== 'string') continue;
          altsChecked++;
          const altRes = await pool.call(
            { type: 'lessonExec', code: alt, exportState: true, packages },
            8000
          );
          const match =
            altRes.ok &&
            altRes.data?.ok &&
            altRes.data.stdout.trimEnd() === refRes.data.stdout.trimEnd() &&
            altRes.data.stateJson === refRes.data.stateJson;
          if (!match) {
            console.error(`  [FAIL LESSON] ${ex.id} parsons alternate #${altIdx + 1} behavioral mismatch`);
            errors++;
          }
        }
      } else if (ex.type === 'fillblank' && ex.visibleTests) {
        checked++;
        const filled = ex.codeWithBlanks.replace(/\{\{(\d+)\}\}/g, (_, k) => {
          const list = ex.answers?.[k];
          return Array.isArray(list) && list.length > 0 ? list[0] : '';
        });
        const fbRes = await pool.call(
          {
            type: 'lessonExec',
            code: filled,
            visibleTests: ex.visibleTests,
            hiddenTests: ex.hiddenTests ?? '',
            packages,
          },
          8000
        );
        if (fbRes.data?.skippedPackage) {
          if (!fbRes.data.syntaxOk) {
            console.error(`  [FAIL LESSON] ${ex.id} fillblank syntax error: ${fbRes.data.error}`);
            errors++;
          } else {
            skippedOffline++;
          }
        } else if (!fbRes.ok || !fbRes.data?.ok) {
          console.error(`  [FAIL LESSON] ${ex.id} fillblank behavioral check failed:\n${fbRes.data?.error ?? fbRes.error}`);
          errors++;
        }
      } else if (ex.type === 'predict') {
        checked++;
        const pRes = await pool.call({ type: 'lessonExec', code: ex.code, packages }, 8000);
        if (!pRes.ok || !pRes.data?.ok || pRes.data.stdout.trimEnd() !== ex.expectedOutput.trimEnd()) {
          console.error(`  [FAIL LESSON] ${ex.id} predict output mismatch`);
          errors++;
        }
      }
    }
  }

  return { checked, altsChecked, skippedOffline, errors };
}

function loadValidModuleIds() {
  const ids = new Set();
  for (const track of fs.readdirSync(tracksDir, { withFileTypes: true })) {
    if (!track.isDirectory()) continue;
    const tDir = path.join(tracksDir, track.name);
    for (const mod of fs.readdirSync(tDir, { withFileTypes: true })) {
      if (!mod.isDirectory()) continue;
      const mPath = path.join(tDir, mod.name, 'module.json');
      if (fs.existsSync(mPath)) {
        const meta = JSON.parse(fs.readFileSync(mPath, 'utf8'));
        if (meta.id) ids.add(meta.id);
      }
    }
  }
  return ids;
}

function parseExplanationFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { problemId: null, solutions: [], body: normalized };
  }
  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    return { problemId: null, solutions: [], body: normalized };
  }
  const yaml = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 5);
  let problemId = null;
  const solutions = [];
  for (const line of yaml.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('problemId:')) {
      problemId = t.slice('problemId:'.length).trim().replace(/^['"]|['"]$/g, '');
    } else if (t.startsWith('- {') && t.endsWith('}')) {
      const inner = t.slice(3, -1);
      const entry = {};
      for (const pair of inner.split(/,\s*(?=[a-zA-Z_]+\s*:)/)) {
        const idx = pair.indexOf(':');
        if (idx === -1) continue;
        entry[pair.slice(0, idx).trim()] = pair
          .slice(idx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
      }
      solutions.push(entry);
    }
  }
  return { problemId, solutions, body };
}

function checkTextIntegrity(label, text, errors) {
  if (EMOJI_RE.test(text)) {
    errors.push(`${label} contains emoji characters (forbidden by RULES.md)`);
  }
  if (DASH_RE.test(text)) {
    errors.push(`${label} contains em dash or en dash characters (forbidden by RULES.md)`);
  }
}

function validateProblemSchema(folderName, spec, validSources, validModules) {
  const errors = [];
  const validDifficulties = new Set(['easy', 'medium', 'hard', 'challenge']);

  if (!spec || typeof spec !== 'object') {
    return ['problem.json must be a JSON object'];
  }
  if (typeof spec.id !== 'string' || !/^P\d{3}$/.test(spec.id)) {
    errors.push(`Invalid id "${spec.id}" (expected P001..P100)`);
  }
  if (typeof spec.slug !== 'string' || !/^[a-z0-9-]+$/.test(spec.slug)) {
    errors.push(`Invalid slug "${spec.slug}"`);
  }
  if (typeof spec.title !== 'string' || !spec.title.trim()) {
    errors.push('Missing title');
  }
  if (!validDifficulties.has(spec.difficulty)) {
    errors.push(`Invalid difficulty "${spec.difficulty}"`);
  }
  if (!Array.isArray(spec.tags) || spec.tags.length === 0) {
    errors.push('tags must be a non-empty array');
  }
  if (typeof spec.estimatedMinutes !== 'number' || spec.estimatedMinutes <= 0) {
    errors.push('estimatedMinutes must be a positive number');
  }
  if (!Array.isArray(spec.relatedModules) || spec.relatedModules.length === 0) {
    errors.push('relatedModules must be a non-empty array');
  } else {
    for (const m of spec.relatedModules) {
      if (!validModules.has(m)) {
        errors.push(`Unknown relatedModule "${m}"`);
      }
    }
  }
  if (!Array.isArray(spec.sources) || spec.sources.length === 0) {
    errors.push('sources must be a non-empty array');
  } else {
    for (const s of spec.sources) {
      if (!validSources.has(s)) {
        errors.push(`Unknown source id "${s}"`);
      }
    }
  }
  if (!Array.isArray(spec.hints) || spec.hints.length !== 3 || spec.hints.some((h) => typeof h !== 'string' || !h.trim())) {
    errors.push('hints must contain exactly 3 non-empty strings');
  }

  if (!spec.entry || (spec.entry.type !== 'function' && spec.entry.type !== 'script')) {
    errors.push('entry.type must be "function" or "script"');
  } else if (spec.entry.type === 'function' && (!spec.entry.name || typeof spec.entry.name !== 'string')) {
    errors.push('entry.name is required when entry.type is "function"');
  }

  const cmp = spec.compare;
  const validCompare =
    cmp === 'exact' ||
    cmp === 'unordered' ||
    (cmp && typeof cmp === 'object' && typeof cmp.float === 'number') ||
    (cmp && typeof cmp === 'object' && typeof cmp.checker === 'string');
  if (!validCompare) {
    errors.push('compare must be "exact", "unordered", { float }, or { checker }');
  }

  const visible = spec.tests?.visible;
  const hidden = spec.tests?.hidden;
  if (!Array.isArray(visible) || visible.length < 2) {
    errors.push(`Expected at least 2 visible tests (found ${Array.isArray(visible) ? visible.length : 0})`);
  }
  if (!Array.isArray(hidden) || hidden.length < 5) {
    errors.push(`Expected at least 5 hidden tests (found ${Array.isArray(hidden) ? hidden.length : 0})`);
  }

  for (const [scope, list] of [
    ['visible', visible ?? []],
    ['hidden', hidden ?? []],
  ]) {
    list.forEach((tc, idx) => {
      if (!tc.label || typeof tc.label !== 'string') {
        errors.push(`${scope}[${idx}] missing label`);
      }
      if (tc.timeLimitMs !== undefined && (typeof tc.timeLimitMs !== 'number' || tc.timeLimitMs <= 0)) {
        errors.push(`${scope}[${idx}] invalid timeLimitMs`);
      }
      if (spec.entry?.type === 'function') {
        if (tc.args === undefined && tc.argsExpr === undefined) {
          errors.push(`${scope}[${idx}] missing args or argsExpr`);
        }
        if (tc.expected === undefined && tc.expectedExpr === undefined) {
          errors.push(`${scope}[${idx}] missing expected or expectedExpr`);
        }
      } else if (spec.entry?.type === 'script') {
        if (typeof tc.script !== 'string' || !tc.script.trim()) {
          errors.push(`${scope}[${idx}] missing script`);
        }
      }
    });
  }

  if (!folderName.includes(spec.slug)) {
    errors.push(`Folder name "${folderName}" should match slug "${spec.slug}"`);
  }

  return errors;
}

async function runFileAgainstTests(pool, code, spec, checkerCode, options = {}) {
  const { probeSlowMargin = false } = options;
  const prepRes = await pool.call({ type: 'prepare', code }, 4000);
  if (prepRes.timedOut) {
    return {
      prepOk: false,
      timedOut: true,
      failedTests: [{ label: '<top-level>', status: 'Time Limit Exceeded', error: prepRes.error }],
      results: [],
    };
  }
  if (!prepRes.ok || !prepRes.data?.ok) {
    return {
      prepOk: false,
      timedOut: false,
      failedTests: [
        {
          label: '<top-level>',
          status: prepRes.data?.errorType || 'Runtime Error',
          error: prepRes.data?.error || prepRes.error,
        },
      ],
      results: [],
    };
  }

  const allTests = [
    ...spec.tests.visible.map((t, idx) => ({ scope: 'visible', idx, test: t })),
    ...spec.tests.hidden.map((t, idx) => ({ scope: 'hidden', idx, test: t })),
  ];

  const results = [];
  const failedTests = [];

  for (const item of allTests) {
    const limit = item.test.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS;
    const hardTimeout = probeSlowMargin
      ? Math.max(Math.ceil(limit * 1.5), limit + 200)
      : limit + 150;

    const res = await pool.call(
      {
        type: 'test',
        entry: spec.entry,
        compare: spec.compare,
        test: item.test,
        checkerCode,
      },
      hardTimeout
    );

    if (res.timedOut) {
      const entry = {
        scope: item.scope,
        label: item.test.label,
        isPerformance: Boolean(item.test.isPerformance),
        timeLimitMs: limit,
        runtimeMs: hardTimeout,
        status: 'Time Limit Exceeded',
        passed: false,
        error: `Time Limit Exceeded (> ${limit} ms)`,
      };
      results.push(entry);
      failedTests.push(entry);
      break;
    }

    const d = res.data;
    const exceededLimit = d.runtimeMs > limit;
    const status = exceededLimit ? 'Time Limit Exceeded' : d.status;
    const passed = d.passed && !exceededLimit;
    const entry = {
      scope: item.scope,
      label: item.test.label,
      isPerformance: Boolean(item.test.isPerformance),
      timeLimitMs: limit,
      runtimeMs: d.runtimeMs,
      status,
      passed,
      error: exceededLimit
        ? `Took ${d.runtimeMs.toFixed(1)} ms (limit ${limit} ms)`
        : d.error,
    };
    results.push(entry);
    if (!passed) {
      failedTests.push(entry);
    }
  }

  return { prepOk: true, timedOut: false, failedTests, results };
}

async function main() {
  const filterArg = process.argv[2];
  if (!fs.existsSync(problemsDir)) {
    console.error(`Problems directory not found: ${problemsDir}`);
    process.exit(1);
  }

  const validSources = loadValidSourceIds();
  const validModules = loadValidModuleIds();

  let folders = fs
    .readdirSync(problemsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  if (filterArg) {
    folders = folders.filter((f) => f.includes(filterArg));
  }

  if (folders.length === 0) {
    console.error('No problem folders found to verify.');
    process.exit(1);
  }

  const seenIds = new Set();
  const seenSlugs = new Set();
  const pool = new VerifyWorkerPool();
  let totalFailures = 0;
  let totalWarnings = 0;
  const summaryRows = [];

  for (const folder of folders) {
    const dir = path.join(problemsDir, folder);
    const errors = [];
    const warnings = [];

    const jsonPath = path.join(dir, 'problem.json');
    const stmtPath = path.join(dir, 'statement.md');
    const starterPath = path.join(dir, 'starter.py');
    const expPath = path.join(dir, 'explanation.md');

    if (!fs.existsSync(jsonPath)) {
      console.error(`FAIL ${folder}: missing problem.json`);
      totalFailures++;
      continue;
    }

    const spec = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    errors.push(...validateProblemSchema(folder, spec, validSources, validModules));
    checkTextIntegrity('problem.json', JSON.stringify(spec), errors);

    if (spec.id) {
      if (seenIds.has(spec.id)) errors.push(`Duplicate problem id "${spec.id}"`);
      seenIds.add(spec.id);
    }
    if (spec.slug) {
      if (seenSlugs.has(spec.slug)) errors.push(`Duplicate problem slug "${spec.slug}"`);
      seenSlugs.add(spec.slug);
    }

    if (!fs.existsSync(stmtPath) || !fs.readFileSync(stmtPath, 'utf8').trim()) {
      errors.push('Missing or empty statement.md');
    } else {
      checkTextIntegrity('statement.md', fs.readFileSync(stmtPath, 'utf8'), errors);
    }

    if (!fs.existsSync(starterPath) || !fs.readFileSync(starterPath, 'utf8').trim()) {
      errors.push('Missing or empty starter.py');
    } else {
      checkTextIntegrity('starter.py', fs.readFileSync(starterPath, 'utf8'), errors);
    }

    let checkerCode = undefined;
    if (spec.compare && typeof spec.compare === 'object' && spec.compare.checker) {
      const chkPath = path.join(dir, spec.compare.checker);
      if (!fs.existsSync(chkPath)) {
        errors.push(`Missing checker file: ${spec.compare.checker}`);
      } else {
        checkerCode = fs.readFileSync(chkPath, 'utf8');
      }
    }

    const solDir = path.join(dir, 'solutions');
    const solFiles = fs.existsSync(solDir)
      ? fs.readdirSync(solDir).filter((f) => f.endsWith('.py')).sort()
      : [];
    if (solFiles.length === 0) {
      errors.push('solutions/ must contain at least 1 .py file');
    }

    const wrongDir = path.join(dir, 'wrong');
    const wrongFiles = fs.existsSync(wrongDir)
      ? fs.readdirSync(wrongDir).filter((f) => f.endsWith('.py')).sort()
      : [];
    if (wrongFiles.length === 0) {
      errors.push('wrong/ must contain at least 1 .py file');
    }

    if (!fs.existsSync(expPath)) {
      errors.push('Missing explanation.md');
    } else {
      const expRaw = fs.readFileSync(expPath, 'utf8');
      checkTextIntegrity('explanation.md', expRaw, errors);
      const parsedExp = parseExplanationFrontmatter(expRaw);
      if (parsedExp.problemId !== spec.id) {
        errors.push(`explanation.md problemId "${parsedExp.problemId}" does not match "${spec.id}"`);
      }
      const listedFiles = new Set(parsedExp.solutions.map((s) => s.file));
      for (const sf of solFiles) {
        const rel = `solutions/${sf}`;
        if (!listedFiles.has(rel)) {
          errors.push(`explanation.md frontmatter missing entry for ${rel}`);
        }
      }
      for (const item of parsedExp.solutions) {
        if (!item.time || !item.space) {
          errors.push(`explanation.md entry ${item.file} missing time or space complexity`);
        }
      }
      for (const match of expRaw.matchAll(/\[src:([a-z0-9-]+)\]/gi)) {
        if (!validSources.has(match[1])) {
          errors.push(`explanation.md cites unknown source [src:${match[1]}]`);
        }
      }
      if (!expRaw.includes('Explanation:')) {
        warnings.push('explanation.md has no "Explanation:" prefix (check RULES.md)');
      }
    }

    let solutionsPassed = 0;
    for (const sf of solFiles) {
      const code = fs.readFileSync(path.join(solDir, sf), 'utf8');
      const run = await runFileAgainstTests(pool, code, spec, checkerCode);
      if (!run.prepOk || run.failedTests.length > 0) {
        const first = run.failedTests[0];
        errors.push(`solutions/${sf} failed (${first.label}: ${first.status} - ${first.error})`);
      } else {
        solutionsPassed++;
        for (const r of run.results) {
          if (r.runtimeMs > r.timeLimitMs * 0.1) {
            warnings.push(
              `Thin reference margin on solutions/${sf} [${r.label}]: ${r.runtimeMs.toFixed(1)}ms > 10% of ${r.timeLimitMs}ms`
            );
          }
        }
      }
    }

    let wrongCaught = 0;
    for (const wf of wrongFiles) {
      const code = fs.readFileSync(path.join(wrongDir, wf), 'utf8');
      const isBrute =
        /brute|slow|tle/i.test(wf) || /^#\s*(label:\s*brute|verdict:\s*tle)/im.test(code);
      const run = await runFileAgainstTests(pool, code, spec, checkerCode, {
        probeSlowMargin: isBrute,
      });

      if (run.failedTests.length === 0) {
        errors.push(`wrong/${wf} unexpectedly passed ALL tests`);
      } else {
        wrongCaught++;
        if (isBrute) {
          const perfFail = run.failedTests.find(
            (t) => t.status === 'Time Limit Exceeded' || t.isPerformance
          );
          if (!perfFail) {
            errors.push(
              `wrong/${wf} (brute force / slow) failed on correctness (${run.failedTests[0].label}) instead of the performance test / TLE`
            );
          } else if (perfFail.status !== 'Time Limit Exceeded') {
            errors.push(
              `wrong/${wf} (brute force / slow) did not trigger Time Limit Exceeded on ${perfFail.label} (${perfFail.runtimeMs.toFixed(1)}ms vs ${perfFail.timeLimitMs}ms)`
            );
          } else if (perfFail.runtimeMs < perfFail.timeLimitMs * 1.3) {
            warnings.push(
              `Thin slow margin on wrong/${wf} [${perfFail.label}]: ${perfFail.runtimeMs.toFixed(1)}ms vs limit ${perfFail.timeLimitMs}ms`
            );
          }
        }
      }
    }

    totalFailures += errors.length;
    totalWarnings += warnings.length;

    const totalTests = (spec.tests?.visible?.length ?? 0) + (spec.tests?.hidden?.length ?? 0);
    summaryRows.push({
      id: spec.id,
      title: spec.title,
      difficulty: spec.difficulty,
      tests: totalTests,
      sols: `${solutionsPassed}/${solFiles.length}`,
      wrong: `${wrongCaught}/${wrongFiles.length}`,
      warnings: warnings.length,
      errors: errors.length,
    });

    if (errors.length > 0) {
      console.error(`\n[FAIL] ${spec.id} (${folder})`);
      for (const e of errors) console.error(`  ERROR: ${e}`);
    } else {
      console.log(`[PASS] ${spec.id} (${folder}) - ${totalTests} tests, ${solFiles.length} solutions, ${wrongFiles.length} wrong caught`);
    }
    for (const w of warnings) {
      console.warn(`  WARN: ${w}`);
    }
  }

  let lessonErrors = 0;
  if (!filterArg) {
    const moduleMap = loadModulePackagesMap();
    const lessonReport = await verifyLessonExercises(pool, moduleMap);
    lessonErrors = lessonReport.errors;
    console.log('\n=== Verification Summary ===');
    console.log('ID   | Title                           | Diff   | Tests | Solutions | Wrong Caught | Warns | Errs');
    console.log('-----+---------------------------------+--------+-------+-----------+--------------+-------+-----');
    for (const row of summaryRows) {
      console.log(
        `${String(row.id).padEnd(4)} | ${String(row.title).slice(0, 31).padEnd(31)} | ${String(row.difficulty).padEnd(6)} | ${String(row.tests).padStart(5)} | ${String(row.sols).padStart(9)} | ${String(row.wrong).padStart(12)} | ${String(row.warnings).padStart(5)} | ${String(row.errors).padStart(4)}`
      );
    }
    console.log(`\nTotal problems: ${summaryRows.length}, Errors: ${totalFailures}, Warnings: ${totalWarnings}`);
    console.log(
      `Lesson exercises checked: ${lessonReport.checked}, Alternates checked: ${lessonReport.altsChecked}, Offline wheel skips (syntax verified): ${lessonReport.skippedOffline}, Lesson errors: ${lessonReport.errors}`
    );
  } else {
    console.log('\n=== Verification Summary ===');
    console.log('ID   | Title                           | Diff   | Tests | Solutions | Wrong Caught | Warns | Errs');
    console.log('-----+---------------------------------+--------+-------+-----------+--------------+-------+-----');
    for (const row of summaryRows) {
      console.log(
        `${String(row.id).padEnd(4)} | ${String(row.title).slice(0, 31).padEnd(31)} | ${String(row.difficulty).padEnd(6)} | ${String(row.tests).padStart(5)} | ${String(row.sols).padStart(9)} | ${String(row.wrong).padStart(12)} | ${String(row.warnings).padStart(5)} | ${String(row.errors).padStart(4)}`
      );
    }
    console.log(`\nTotal problems: ${summaryRows.length}, Errors: ${totalFailures}, Warnings: ${totalWarnings}`);
  }

  pool.terminate();

  if (totalFailures > 0 || lessonErrors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
