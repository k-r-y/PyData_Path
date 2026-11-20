import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { Database, Play, Loader2 } from 'lucide-react';
import { pyodideRunner } from '../../runtime/runner';
import { useTheme } from '../../components/ThemeProvider';

const SEED_SQL_SETUP = `
import sqlite3, json
conn = sqlite3.connect(":memory:")
cur = conn.cursor()
cur.execute("CREATE TABLE courses (code TEXT PRIMARY KEY, title TEXT, credits INTEGER)")
cur.execute("CREATE TABLE enrollments (id INTEGER PRIMARY KEY, student TEXT, course_code TEXT, grade REAL)")
cur.executemany("INSERT INTO courses VALUES (?, ?, ?)", [
    ("IS-101", "Intro to IS", 3),
    ("IS-204", "Database Systems", 3),
    ("IS-301", "Business Analytics", 3),
])
cur.executemany("INSERT INTO enrollments VALUES (?, ?, ?, ?)", [
    (1, "Ana", "IS-101", 91.0),
    (2, "Ben", "IS-101", 84.5),
    (3, "Ana", "IS-204", 88.0),
    (4, "Cara", "IS-301", 95.0),
    (5, "Ben", "IS-301", 79.0),
])
conn.commit()
`;

export function SqlLabPage() {
  const { resolvedTheme } = useTheme();
  const [query, setQuery] = useState(
    `SELECT c.code, c.title, COUNT(e.id) AS enrolled, ROUND(AVG(e.grade), 1) AS avg_grade\nFROM courses c\nLEFT JOIN enrollments e ON c.code = e.course_code\nGROUP BY c.code, c.title\nORDER BY enrolled DESC;`
  );
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const pyCode = `${SEED_SQL_SETUP}
cur.execute(${JSON.stringify(query)})
cols = [d[0] for d in cur.description] if cur.description else []
data = cur.fetchall()
print(json.dumps({"columns": cols, "rows": data}))`;

      const res = await pyodideRunner.run(pyCode);
      if (!res.ok) {
        setError(res.error ?? res.stderr ?? 'SQL execution failed');
        return;
      }
      const parsed = JSON.parse(res.stdout.trim()) as { columns: string[]; rows: unknown[][] };
      setColumns(parsed.columns);
      setRows(parsed.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          SQL Playground (SQLite)
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Runs against an in-browser SQLite database with <code className="font-mono">courses</code> and <code className="font-mono">enrollments</code> tables.
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <CodeMirror
          value={query}
          height="160px"
          theme={resolvedTheme === 'dark' ? oneDark : 'light'}
          onChange={setQuery}
        />
      </div>

      <button
        type="button"
        disabled={running}
        onClick={handleRun}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
      >
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        Execute SQL
      </button>

      {error && (
        <pre className="rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
          {error}
        </pre>
      )}

      {columns.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-[#09090b] border-b border-neutral-200 dark:border-neutral-800">
                {columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800/60">
                  {r.map((val, j) => (
                    <td key={j} className="px-3 py-1.5 font-mono">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
