import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { LineChart, Play, Loader2 } from 'lucide-react';
import { pyodideRunner } from '../../runtime/runner';
import { useTheme } from '../../components/ThemeProvider';

const DEFAULT_PLOT_CODE = `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May"]
sales = [120, 145, 132, 178, 210]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.bar(months, sales, color="#4f46e5")
ax.set_title("Monthly Campus Store Sales")
ax.set_ylabel("Units Sold")
ax.grid(axis="y", alpha=0.3)`;

export function ChartLabPage() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(DEFAULT_PLOT_CODE);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRender = async () => {
    setRunning(true);
    setError(null);
    try {
      await pyodideRunner.loadPackages(['matplotlib']);
      const wrapper = `import matplotlib
matplotlib.use("Agg")
import io, base64
${code}
__buf = io.BytesIO()
plt.savefig(__buf, format="png", bbox_inches="tight", dpi=130)
plt.close("all")
print("__IMG_B64__:" + base64.b64encode(__buf.getvalue()).decode("ascii"))`;

      const res = await pyodideRunner.run(wrapper, { timeoutMs: 20000 });
      if (!res.ok) {
        setError(res.error ?? res.stderr ?? 'Plot failed');
        return;
      }
      const line = res.stdout.split('\n').find((l) => l.startsWith('__IMG_B64__:'));
      if (line) {
        setImageUrl(`data:image/png;base64,${line.slice('__IMG_B64__:'.length)}`);
      }
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
          <LineChart className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Chart Lab (Matplotlib)
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Renders Matplotlib figures inside Pyodide using the non-interactive Agg backend as PNG images.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <CodeMirror
              value={code}
              height="260px"
              extensions={[python()]}
              theme={resolvedTheme === 'dark' ? oneDark : 'light'}
              onChange={setCode}
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={handleRender}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Rendering...' : 'Render Chart'}
          </button>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-4 flex items-center justify-center min-h-[260px]">
          {error ? (
            <pre className="text-xs font-mono text-rose-600 dark:text-rose-400 whitespace-pre-wrap">{error}</pre>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Matplotlib chart output" className="max-w-full rounded" />
          ) : (
            <p className="text-xs text-neutral-400">Click Render Chart to generate your plot.</p>
          )}
        </div>
      </div>
    </div>
  );
}
