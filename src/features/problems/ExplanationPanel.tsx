import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Eye, Lock, ArrowRight } from 'lucide-react';
import { loadProblemExplanation, getProblemMetaById } from '../../content/problemLoader';
import { getAllModules, getLessonsForModule } from '../../content/loader';
import type { ProblemExplanationData, ProblemMeta, ProblemSpec } from '../../types/problem';

interface ExplanationPanelProps {
  meta: ProblemMeta;
  spec: ProblemSpec;
  unlocked: boolean;
  onConfirmGiveUp: () => Promise<void>;
}

export function ExplanationPanel({
  meta,
  spec,
  unlocked,
  onConfirmGiveUp,
}: ExplanationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    explanation: ProblemExplanationData;
    solutionFiles: Record<string, string>;
  } | null>(null);
  const [selectedSolIdx, setSelectedSolIdx] = useState(0);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const confirmTitleId = useId();

  useEffect(() => {
    if (!unlocked) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadProblemExplanation(meta.folder)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setSelectedSolIdx(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [unlocked, meta.folder]);

  const handleOpenGiveUpModal = () => {
    const dlg = confirmDialogRef.current;
    if (dlg && !dlg.open) {
      dlg.returnValue = '';
      dlg.showModal();
    }
  };

  const handleGiveUpClose = async () => {
    const dlg = confirmDialogRef.current;
    if (!dlg) return;
    const choice = dlg.returnValue;
    dlg.returnValue = '';
    if (choice === 'confirm') {
      await onConfirmGiveUp();
    }
  };

  if (!unlocked) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            Explanation Locked
          </h2>
          <p className="text-xs leading-6 text-neutral-600 dark:text-neutral-400">
            Pass all test cases with Submit to unlock the full explanation and reference solutions, or reveal them early if you are stuck.
          </p>
          <button
            type="button"
            onClick={handleOpenGiveUpModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Give up and view explanation
          </button>
        </div>

        <dialog
          ref={confirmDialogRef}
          aria-labelledby={confirmTitleId}
          onClose={handleGiveUpClose}
          className="m-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-950 dark:text-neutral-50 shadow-2xl w-[min(92vw,24rem)] p-5"
        >
          <h3 id={confirmTitleId} className="text-sm font-semibold mb-2">
            Reveal Reference Solution?
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
            Viewing the explanation before passing tests logs this problem as solutionViewed (it will no longer count as solved unaided).
          </p>
          <form method="dialog" className="flex items-center justify-end gap-2">
            <button
              type="submit"
              value="cancel"
              autoFocus
              className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Keep solving
            </button>
            <button
              type="submit"
              value="confirm"
              className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Reveal solution
            </button>
          </form>
        </dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8 text-center font-mono text-xs text-neutral-500">
        Loading explanation chunk...
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-xs text-neutral-500">
        Explanation content is not available for this problem yet.
      </p>
    );
  }

  const { explanation, solutionFiles } = data;
  const activeSol = explanation.solutions[selectedSolIdx] ?? explanation.solutions[0];
  const activeCode = activeSol ? solutionFiles[activeSol.file] ?? '' : '';

  const relatedProblemMatches = Array.from(
    explanation.body.matchAll(/\b(P\d{3})\b/g),
    (m) => m[1]
  )
    .filter((id, idx, arr) => id !== spec.id && arr.indexOf(id) === idx)
    .map((id) => getProblemMetaById(id))
    .filter((p): p is ProblemMeta => Boolean(p));

  const allModules = getAllModules();
  const relatedModuleCards = spec.relatedModules
    .map((modId) => {
      const mod = allModules.find((m) => m.id === modId);
      const lessons = mod ? getLessonsForModule(mod.id) : [];
      return mod ? { mod, firstLessonId: lessons[0]?.frontmatter.id } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <div className="space-y-6 text-sm text-neutral-800 dark:text-neutral-200">
      <div className="space-y-3 leading-7">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white mt-5 mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-white mt-4 mb-1.5">
                {children}
              </h3>
            ),
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 text-xs leading-6">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 text-xs leading-6">{children}</ol>,
            p: ({ children }) => <p className="text-xs leading-6">{children}</p>,
            pre: ({ children }) => (
              <pre className="rounded-lg bg-neutral-950 text-neutral-100 p-3 text-xs font-mono overflow-x-auto border border-neutral-800 my-2">
                {children}
              </pre>
            ),
            code: ({ className, children }) => {
              const isBlock = Boolean(className) || String(children).includes('\n');
              if (isBlock) return <code className="font-mono">{children}</code>;
              return (
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">
                  {children}
                </code>
              );
            },
          }}
        >
          {explanation.body}
        </ReactMarkdown>
      </div>

      {/* Reference Solutions & Complexities */}
      {explanation.solutions.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Reference Solutions ({explanation.solutions.length})
            </h2>
          </div>

          <div role="tablist" aria-label="Reference solution approaches" className="flex flex-wrap gap-1.5">
            {explanation.solutions.map((sol, idx) => {
              const active = idx === selectedSolIdx;
              return (
                <button
                  key={sol.file}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedSolIdx(idx)}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    active
                      ? 'border-neutral-900 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {sol.label}
                </button>
              );
            })}
          </div>

          {activeSol && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-[#111113] border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2">
                <span>
                  Time: <strong>{activeSol.time}</strong>
                </span>
                <span>
                  Space: <strong>{activeSol.space}</strong>
                </span>
                <span className="ml-auto text-neutral-400">{activeSol.file}</span>
              </div>
              <pre className="rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 p-3.5 text-xs font-mono overflow-x-auto leading-5">
                <code>{activeCode}</code>
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Related Problems & Lesson Links */}
      {(relatedProblemMatches.length > 0 || relatedModuleCards.length > 0) && (
        <section className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Related Practice &amp; Lessons
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedProblemMatches.map((rel) => (
              <Link
                key={rel.id}
                to={`/problems/${rel.slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] text-xs font-mono hover:border-neutral-400"
              >
                <span>
                  {rel.id}: {rel.title}
                </span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            ))}
            {relatedModuleCards.map(({ mod, firstLessonId }) => (
              <Link
                key={mod.id}
                to={firstLessonId ? `/lesson/${firstLessonId}` : '/'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] text-xs hover:border-neutral-400"
              >
                <span>Lesson: {mod.title}</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
