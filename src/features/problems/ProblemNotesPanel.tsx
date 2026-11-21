import { useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Bookmark, Check, Eye, PenLine, Save } from 'lucide-react';

interface ProblemNotesPanelProps {
  markdown: string;
  updatedAt: string | null;
  bookmarkReason: 'bookmark' | 'stuck' | null;
  onSaveNotes: (md: string) => Promise<void>;
  onToggleBookmark: (kind: 'bookmark' | 'stuck') => Promise<void>;
}

export function ProblemNotesPanel({
  markdown,
  updatedAt,
  bookmarkReason,
  onSaveNotes,
  onToggleBookmark,
}: ProblemNotesPanelProps) {
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const textareaId = useId();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveNotes(markdown);
      setSavedBanner(true);
      window.setTimeout(() => setSavedBanner(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={bookmarkReason === 'bookmark'}
            onClick={() => onToggleBookmark('bookmark')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              bookmarkReason === 'bookmark'
                ? 'border-neutral-900 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{bookmarkReason === 'bookmark' ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            aria-pressed={bookmarkReason === 'stuck'}
            onClick={() => onToggleBookmark('stuck')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
              bookmarkReason === 'stuck'
                ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{bookmarkReason === 'stuck' ? 'In Stuck List' : 'Mark as Stuck'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {preview ? <PenLine className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
          {preview ? 'Edit Markdown' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="min-h-48 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-4 text-xs leading-6 text-neutral-800 dark:text-neutral-200 space-y-2">
          {markdown.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          ) : (
            <p className="text-neutral-500">No notes written yet.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor={textareaId} className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Personal Notes &amp; Approach Reflections (Markdown)
          </label>
          <textarea
            id={textareaId}
            rows={10}
            value={markdown}
            onChange={(e) => onSaveNotes(e.target.value)}
            placeholder="Write key invariants, edge cases, complexity notes, or why a bug happened..."
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111113] p-3 font-mono text-xs text-neutral-900 dark:text-neutral-100 leading-5 focus:outline-none focus:border-neutral-400"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
        <span>
          {updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString()}` : 'Notes are saved locally in IndexedDB'}
        </span>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          {savedBanner ? <Check className="w-3 h-3" aria-hidden="true" /> : <Save className="w-3 h-3" aria-hidden="true" />}
          {savedBanner ? 'Saved' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
