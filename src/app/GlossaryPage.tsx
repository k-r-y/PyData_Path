import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookA, Search } from 'lucide-react';
import glossaryData from '../content/glossary.json';
import type { GlossaryEntry } from '../types/content';

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const entries = (glossaryData as GlossaryEntry[]).filter(
    (e) =>
      e.term.toLowerCase().includes(query.toLowerCase()) ||
      e.definition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BookA className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Glossary
        </h1>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter terms..."
            aria-label="Filter glossary terms"
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e] text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>
      </header>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.term}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 space-y-1.5"
          >
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              {entry.term}
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{entry.definition}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 pt-1">
              <span>Sources: {entry.sourceIds.join(', ')}</span>
              {entry.relatedLessons.map((lid) => (
                <Link
                  key={lid}
                  to={`/lesson/${lid}`}
                  className="text-neutral-600 dark:text-neutral-400 hover:underline"
                >
                  Lesson: {lid}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
