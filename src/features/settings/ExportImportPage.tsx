import { useState } from 'react';
import { Settings, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../db/database';
import { useTheme } from '../../components/ThemeProvider';

interface ExportPayload {
  version: number;
  exportedAt: string;
  tables: {
    progress: unknown[];
    attempts: unknown[];
    mastery: unknown[];
    flashcards: unknown[];
    notes: unknown[];
    bookmarks: unknown[];
    settings: unknown[];
    streaks: unknown[];
    projects: unknown[];
  };
}

export function ExportImportPage() {
  const { theme, setTheme } = useTheme();
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleExport = async () => {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: {
        progress: await db.progress.toArray(),
        attempts: await db.attempts.toArray(),
        mastery: await db.mastery.toArray(),
        flashcards: await db.flashcards.toArray(),
        notes: await db.notes.toArray(),
        bookmarks: await db.bookmarks.toArray(),
        settings: await db.settings.toArray(),
        streaks: await db.streaks.toArray(),
        projects: await db.projects.toArray(),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pydata-path-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ ok: true, text: 'Progress exported as JSON.' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportPayload;

      if (parsed.version !== 1 || !parsed.tables || typeof parsed.tables !== 'object') {
        setStatusMsg({ ok: false, text: 'Invalid backup file: unsupported version or missing tables.' });
        return;
      }

      const tableEntries = [
        [db.progress, parsed.tables.progress],
        [db.attempts, parsed.tables.attempts],
        [db.mastery, parsed.tables.mastery],
        [db.flashcards, parsed.tables.flashcards],
        [db.notes, parsed.tables.notes],
        [db.bookmarks, parsed.tables.bookmarks],
        [db.settings, parsed.tables.settings],
        [db.streaks, parsed.tables.streaks],
        [db.projects, parsed.tables.projects],
      ] as const;

      await db.transaction('rw', db.tables, async () => {
        for (const [table, rows] of tableEntries) {
          if (!Array.isArray(rows)) continue;
          const tbl = table as unknown as {
            clear: () => Promise<void>;
            bulkPut: (items: unknown[]) => Promise<unknown>;
          };
          if (importMode === 'replace') {
            await tbl.clear();
          }
          if (rows.length > 0) {
            await tbl.bulkPut(rows);
          }
        }
      });

      window.dispatchEvent(new Event('pdp-progress-updated'));
      setStatusMsg({
        ok: true,
        text: `Imported backup successfully (${importMode} mode).`,
      });
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'Failed to parse JSON backup.',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Settings &amp; Backup
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Customize your workspace and export or restore your local IndexedDB progress.
        </p>
      </header>

      {/* Appearance */}
      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Appearance</h2>
        <div className="flex items-center gap-3 text-xs">
          <span>Theme:</span>
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-md capitalize border ${
                theme === t
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-600'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Export / Import */}
      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Export &amp; Import Progress (JSON)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export Progress JSON
          </button>

          <div className="flex items-center gap-2 text-xs">
            <select
              aria-label="Import mode"
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#09090b] px-2.5 py-1.5"
            >
              <option value="merge">Merge with existing</option>
              <option value="replace">Replace existing</option>
            </select>

            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
              <input type="file" accept=".json,application/json" onChange={handleImport} className="sr-only" />
            </label>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`flex items-center gap-2 text-xs p-3 rounded-md border ${
              statusMsg.ok
                ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
            }`}
          >
            {statusMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </section>
    </div>
  );
}
