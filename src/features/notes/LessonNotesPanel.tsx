import { useEffect, useState } from 'react';
import { StickyNote, Check } from 'lucide-react';
import { db } from '../../db/database';

interface LessonNotesPanelProps {
  lessonId: string;
}

export function LessonNotesPanel({ lessonId }: LessonNotesPanelProps) {
  const [markdown, setMarkdown] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    db.notes
      .get(lessonId)
      .then((rec) => {
        setMarkdown(rec?.markdown ?? '');
        setSavedAt(rec?.updatedAt ?? null);
      })
      .catch(() => {});
  }, [lessonId]);

  const handleSave = async (nextText: string) => {
    setMarkdown(nextText);
    const now = new Date().toISOString();
    await db.notes.put({
      lessonId,
      markdown: nextText,
      updatedAt: now,
    });
    setSavedAt(now);
  };

  return (
    <section className="mt-10 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0c0c0e] p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" aria-hidden="true" />
          Your Notes &amp; Reflection (&ldquo;Explain this in your own words&rdquo;)
        </h3>
        {savedAt && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Check className="w-3 h-3" aria-hidden="true" />
            Saved locally
          </span>
        )}
      </div>

      <textarea
        rows={4}
        value={markdown}
        onChange={(e) => handleSave(e.target.value)}
        placeholder="Write key takeaways, analogies, or questions in your own words (Markdown supported)…"
        aria-label="Lesson notes in your own words"
        className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
      />
    </section>
  );
}
