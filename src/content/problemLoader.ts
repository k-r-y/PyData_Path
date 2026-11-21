import problemsMeta from 'virtual:problems-meta';
import type {
  ExplanationSolutionMeta,
  ProblemExplanationData,
  ProblemMeta,
  ProblemSpec,
} from '../types/problem';

const problemJsonLoaders = import.meta.glob<{ default: ProblemSpec }>(
  './problems/*/problem.json'
);

const statementLoaders = import.meta.glob<string>(
  './problems/*/statement.md',
  { query: '?raw', import: 'default' }
);

const starterLoaders = import.meta.glob<string>(
  './problems/*/starter.py',
  { query: '?raw', import: 'default' }
);

const checkerLoaders = import.meta.glob<string>(
  './problems/*/checker.py',
  { query: '?raw', import: 'default' }
);

const explanationLoaders = import.meta.glob<string>(
  './problems/*/explanation.md',
  { query: '?raw', import: 'default' }
);

const solutionLoaders = import.meta.glob<string>(
  './problems/*/solutions/*.py',
  { query: '?raw', import: 'default' }
);

export function getAllProblemMeta(): ProblemMeta[] {
  return problemsMeta;
}

export function getProblemMetaBySlug(slug: string): ProblemMeta | undefined {
  return problemsMeta.find((p) => p.slug === slug);
}

export function getProblemMetaById(id: string): ProblemMeta | undefined {
  return problemsMeta.find((p) => p.id === id);
}

export async function loadProblemWorkspaceBundle(slug: string): Promise<{
  meta: ProblemMeta;
  spec: ProblemSpec;
  statement: string;
  starterCode: string;
  checkerCode?: string;
} | null> {
  const meta = getProblemMetaBySlug(slug);
  if (!meta) return null;

  const base = `./problems/${meta.folder}`;
  const jsonLoader = problemJsonLoaders[`${base}/problem.json`];
  const stmtLoader = statementLoaders[`${base}/statement.md`];
  const starterLoader = starterLoaders[`${base}/starter.py`];
  const checkerLoader = checkerLoaders[`${base}/checker.py`];

  if (!jsonLoader || !stmtLoader || !starterLoader) {
    return null;
  }

  const [jsonMod, statement, starterCode, checkerCode] = await Promise.all([
    jsonLoader(),
    stmtLoader(),
    starterLoader(),
    checkerLoader ? checkerLoader() : Promise.resolve(undefined),
  ]);

  return {
    meta,
    spec: jsonMod.default,
    statement,
    starterCode,
    checkerCode,
  };
}

function parseExplanationFrontmatter(raw: string): ProblemExplanationData {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { problemId: '', solutions: [], body: normalized };
  }
  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    return { problemId: '', solutions: [], body: normalized };
  }

  const yamlBlock = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 5).trimStart();
  let problemId = '';
  const solutions: ExplanationSolutionMeta[] = [];

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('problemId:')) {
      problemId = trimmed.slice('problemId:'.length).trim().replace(/^['"]|['"]$/g, '');
      continue;
    }
    if (trimmed.startsWith('- {') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(3, -1);
      const entry: Record<string, string> = {};
      for (const pair of inner.split(/,\s*(?=[a-zA-Z_]+\s*:)/)) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) continue;
        const k = pair.slice(0, colonIdx).trim();
        const v = pair.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        entry[k] = v;
      }
      if (entry.file) {
        solutions.push({
          file: entry.file,
          label: entry.label ?? entry.file,
          time: entry.time ?? 'UNKNOWN',
          space: entry.space ?? 'UNKNOWN',
        });
      }
    }
  }

  return { problemId, solutions, body };
}

export async function loadProblemExplanation(folder: string): Promise<{
  explanation: ProblemExplanationData;
  solutionFiles: Record<string, string>;
} | null> {
  const expLoader = explanationLoaders[`./problems/${folder}/explanation.md`];
  if (!expLoader) return null;

  const rawExp = await expLoader();
  const explanation = parseExplanationFrontmatter(rawExp);

  const prefix = `./problems/${folder}/solutions/`;
  const matchingEntries = Object.entries(solutionLoaders).filter(([p]) =>
    p.startsWith(prefix)
  );
  const loaded = await Promise.all(
    matchingEntries.map(async ([p, loader]) => {
      const relPath = `solutions/${p.slice(prefix.length)}`;
      const content = await loader();
      return [relPath, content] as const;
    })
  );

  return {
    explanation,
    solutionFiles: Object.fromEntries(loaded),
  };
}
