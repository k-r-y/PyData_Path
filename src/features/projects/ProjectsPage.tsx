import { useEffect, useState } from 'react';
import { FolderKanban, Check } from 'lucide-react';
import { db } from '../../db/database';

const CAPSTONE_STEPS = [
  '1. Define a clear business or IS analytical question',
  '2. Inspect dataset shape, dtypes, and missing values',
  '3. Clean duplicates, invalid values, and date formats',
  '4. Explore distributions and group summaries',
  '5. Create at least 2 clear, labeled visualizations',
  '6. Write a concise findings memo separating observations from recommendations',
];

const RUBRIC = [
  { criterion: 'Clear analytical question and scope', weight: 20 },
  { criterion: 'Documented data cleaning decisions', weight: 25 },
  { criterion: 'Accurate summaries and statistical checks', weight: 25 },
  { criterion: 'Clear charts with titles, units, and honest scales', weight: 15 },
  { criterion: 'Plain-language findings memo for non-technical readers', weight: 15 },
];

export function ProjectsPage() {
  const projectId = 'capstone-eda';
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [writeup, setWriteup] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    db.projects
      .get(projectId)
      .then((rec) => {
        if (rec) {
          setChecklist(rec.checklistState);
          setWriteup(rec.writeup);
          setSavedAt(rec.updatedAt);
        }
      })
      .catch(() => {});
  }, []);

  const persist = async (nextChecklist: Record<string, boolean>, nextWriteup: string) => {
    const now = new Date().toISOString();
    await db.projects.put({
      projectId,
      checklistState: nextChecklist,
      writeup: nextWriteup,
      updatedAt: now,
    });
    setSavedAt(now);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Guided EDA &amp; Capstone Project
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Use the DataFrame Lab and Chart Lab to analyze a dataset, track your workflow below, and draft your findings memo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            EDA Workflow Checklist
          </h2>
          <div className="space-y-2">
            {CAPSTONE_STEPS.map((step, idx) => {
              const key = `step-${idx}`;
              const checked = Boolean(checklist[key]);
              return (
                <label
                  key={key}
                  className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = { ...checklist, [key]: !checked };
                      setChecklist(next);
                      persist(next, writeup);
                    }}
                    className="mt-0.5 accent-neutral-600"
                  />
                  <span>{step}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Self-Assessment Rubric
          </h2>
          <ul className="space-y-2 text-xs">
            {RUBRIC.map((r, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <span className="text-neutral-700 dark:text-neutral-300">{r.criterion}</span>
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">{r.weight}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Findings Memo (Markdown)
          </h2>
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
        <textarea
          rows={8}
          value={writeup}
          onChange={(e) => {
            const val = e.target.value;
            setWriteup(val);
            persist(checklist, val);
          }}
          placeholder="1. Question...&#10;2. Key Observations...&#10;3. Limitations & Next Steps..."
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#09090b] p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-neutral-500"
        />
      </section>
    </div>
  );
}
