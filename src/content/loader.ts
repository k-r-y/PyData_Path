import type {
  Exercise,
  LessonData,
  LessonFrontmatter,
  ModuleMeta,
  SourceEntry,
} from '../types/content';
import sourcesData from './sources.json';

const moduleFiles = import.meta.glob<{ default: ModuleMeta }>(
  './tracks/*/*/module.json',
  { eager: true }
);

const lessonMarkdownFiles = import.meta.glob<string>(
  './tracks/*/*/*.md',
  { query: '?raw', import: 'default', eager: true }
);

const exerciseFiles = import.meta.glob<{ default: Exercise[] }>(
  './tracks/*/*/*.exercises.json',
  { eager: true }
);

/**
 * Parses YAML frontmatter between --- delimiters without requiring an extra
 * Node-oriented YAML parser dependency in the browser bundle.
 */
function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: {}, body: normalized };
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { data: {}, body: normalized };
  }

  const yamlBlock = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 5).trimStart();
  const data: Record<string, unknown> = {};

  let currentArrayKey: string | null = null;
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentArrayKey) {
      const arr = data[currentArrayKey] as string[];
      arr.push(stripQuotes(trimmed.slice(2).trim()));
      continue;
    }

    currentArrayKey = null;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rawVal = trimmed.slice(colonIdx + 1).trim();

    if (rawVal === '') {
      data[key] = [];
      currentArrayKey = key;
    } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((item) => stripQuotes(item.trim()))
        : [];
    } else if (/^\d+$/.test(rawVal)) {
      data[key] = Number(rawVal);
    } else {
      data[key] = stripQuotes(rawVal);
    }
  }

  return { data, body };
}

function stripQuotes(val: string): string {
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1);
  }
  return val;
}

export function getAllSources(): SourceEntry[] {
  return sourcesData as SourceEntry[];
}

export function getSourceMap(): Map<string, SourceEntry> {
  const map = new Map<string, SourceEntry>();
  for (const src of getAllSources()) {
    map.set(src.id, src);
  }
  return map;
}

export function getAllModules(): ModuleMeta[] {
  return Object.values(moduleFiles)
    .map((mod) => mod.default)
    .sort((a, b) => a.order - b.order);
}

export function getModuleById(moduleId: string): ModuleMeta | undefined {
  return getAllModules().find((m) => m.id === moduleId);
}

export function getLessonsForModule(moduleId: string): LessonData[] {
  const lessons: LessonData[] = [];

  for (const [path, rawContent] of Object.entries(lessonMarkdownFiles)) {
    if (!path.includes(`/${moduleId}/`)) continue;
    const { data, body } = parseFrontmatter(rawContent);
    const frontmatter = data as unknown as LessonFrontmatter;
    if (frontmatter.moduleId === moduleId) {
      lessons.push({ frontmatter, body });
    }
  }

  return lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getLessonById(lessonId: string): LessonData | undefined {
  for (const rawContent of Object.values(lessonMarkdownFiles)) {
    const { data, body } = parseFrontmatter(rawContent);
    const frontmatter = data as unknown as LessonFrontmatter;
    if (frontmatter.id === lessonId) {
      return { frontmatter, body };
    }
  }
  return undefined;
}

export function getExercisesForLesson(lessonId: string): Exercise[] {
  for (const [path, mod] of Object.entries(exerciseFiles)) {
    if (path.endsWith(`/${lessonId}.exercises.json`)) {
      return mod.default;
    }
  }
  return [];
}
