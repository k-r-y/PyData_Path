import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getAllSources } from '../content/loader';

export function SourcesPage() {
  const sources = getAllSources();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <header className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Sources &amp; Verification Status
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Every factual claim in PyData Path cites an entry from{' '}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
            src/content/sources.json
          </code>
          . All entries start with{' '}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
            verified: false
          </code>{' '}
          until manually checked.
        </p>
      </header>

      <div className="space-y-3">
        {sources.map((src) => (
          <div
            key={src.id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  {src.title}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {src.type}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                ID: <code className="font-mono">{src.id}</code> | Author: {src.author} | Publisher: {src.publisher} | License: {src.license}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                URL: <code className="font-mono">{src.url}</code>
              </p>
              {src.notes && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 pt-1">
                  {src.notes}
                </p>
              )}
            </div>

            <div className="shrink-0">
              {src.verified ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Unverified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
