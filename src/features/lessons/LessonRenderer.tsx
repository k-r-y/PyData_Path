import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock, BookOpen, CheckCircle2, Circle, Copy, Check } from 'lucide-react';
import type { LessonData } from '../../types/content';
import { getSourceMap } from '../../content/loader';
import { SourceChip } from '../../components/SourceChip';
import { LessonNotesPanel } from '../notes/LessonNotesPanel';
import type { LessonStatus } from '../../db/database';

interface LessonRendererProps {
  lesson: LessonData;
  status: LessonStatus;
  pythonVersion: string;
  onMarkComplete: () => void;
}

export function LessonRenderer({
  lesson,
  status,
  pythonVersion,
  onMarkComplete,
}: LessonRendererProps) {
  const { frontmatter, body } = lesson;
  const sourceMap = getSourceMap();
  const lessonSources = frontmatter.sources
    .map((id) => sourceMap.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <article className="max-w-[70ch] mx-auto pb-12">
      {/* Lesson Metadata Header */}
      <header className="mb-6 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400 mb-3">
          <span className="font-semibold text-neutral-950 dark:text-white">
            {frontmatter.moduleId}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-neutral-700 dark:text-neutral-300">
            {frontmatter.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 ml-1 tabular-nums">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {frontmatter.estimatedMinutes} min
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-neutral-950 dark:text-white mb-4">
          {frontmatter.title}
        </h1>

        {frontmatter.objectives && frontmatter.objectives.length > 0 && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 mb-4">
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400 mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Learning Objectives
            </h2>
            <ul className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300 list-disc list-inside">
              {frontmatter.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {frontmatter.prerequisites && frontmatter.prerequisites.length > 0 && (
          <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            Prerequisites: {frontmatter.prerequisites.join(', ')}
          </p>
        )}
      </header>

      {/* Markdown Body */}
      <div className="space-y-4 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold tracking-tight text-neutral-950 dark:text-white mt-8 mb-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-5 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => {
              const textContent = extractText(children);
              if (textContent.trimStart().startsWith('Explanation:')) {
                return (
                  <p className="rounded-md border-l-2 border-neutral-950 dark:border-white bg-neutral-50 dark:bg-[#111113] px-4 py-3 text-neutral-700 dark:text-neutral-300 text-sm">
                    {children}
                  </p>
                );
              }
              return <p className="leading-relaxed">{children}</p>;
            },
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1.5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1.5">{children}</ol>
            ),
            code: ({ className, children }) => {
              const isBlock = Boolean(className);
              if (isBlock) {
                return (
                  <code className="block text-xs sm:text-[13px] leading-relaxed font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#141417] text-neutral-900 dark:text-neutral-100 text-[12.5px] font-mono">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse border border-neutral-200 dark:border-neutral-800">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] px-3 py-2 text-left font-mono text-xs uppercase tracking-wider font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-neutral-200 dark:border-neutral-800 px-3 py-2">
                {children}
              </td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 rounded-r-md">
                {children}
              </blockquote>
            ),
          }}
        >
          {body}
        </ReactMarkdown>
      </div>

      {/* Sources Verification Chips */}
      {lessonSources.length > 0 && (
        <section className="mt-8 pt-5 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500 mb-3">
            Referenced Sources
          </h3>
          <div className="flex flex-wrap gap-2">
            {lessonSources.map((src) => (
              <SourceChip key={src.id} source={src} />
            ))}
          </div>
        </section>
      )}

      {/* Lesson Notes & Reflection */}
      <LessonNotesPanel lessonId={frontmatter.id} />

      {/* Lesson Completion & Runtime Version Footer */}
      <footer className="mt-8 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMarkComplete}
          className={`tactile inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${
            status === 'completed'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
              : 'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200'
          }`}
        >
          {status === 'completed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Lesson Completed
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" aria-hidden="true" />
              Mark Lesson Complete
            </>
          )}
        </button>

        <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
          Runtime: {pythonVersion ? `Python ${pythonVersion} (Pyodide)` : 'Python 3.x (Pyodide loading…)'}
        </span>
      </footer>
    </article>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const raw = extractText(children).replace(/\n$/, '');
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard permission errors
    }
  };

  return (
    <div className="relative group my-3 rounded-lg bg-[#0d0d0f] border border-neutral-800 overflow-hidden">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied code' : 'Copy code'}
        className="tactile absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-700/80 bg-[#17171a]/90 text-neutral-300 hover:text-white hover:border-neutral-500 font-mono text-[10px] uppercase tracking-wider transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            <span className="text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" aria-hidden="true" />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre className="text-neutral-100 p-4 pr-20 overflow-x-auto">{children}</pre>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props;
    return props?.children ? extractText(props.children) : '';
  }
  return '';
}
