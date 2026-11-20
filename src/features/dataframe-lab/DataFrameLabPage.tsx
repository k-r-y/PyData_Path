import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Table2, Play, Upload, Loader2 } from 'lucide-react';
import { SAMPLE_DATASETS } from '../../content/datasets/sampleDatasets';
import { pyodideRunner } from '../../runtime/runner';
import { useTheme } from '../../components/ThemeProvider';

export function DataFrameLabPage() {
  const { resolvedTheme } = useTheme();
  const [selectedId, setSelectedId] = useState(SAMPLE_DATASETS[0].id);
  const [customCsv, setCustomCsv] = useState<{ name: string; content: string } | null>(null);
  const [code, setCode] = useState(
    `import pandas as pd\ndf = pd.read_csv("store_sales.csv")\nprint(df.head())\nprint("\\nSummary by category:")\nprint(df.groupby("category")["units"].sum())`
  );
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(false);
  const [running, setRunning] = useState(false);

  const activeDataset = customCsv
    ? { filename: customCsv.name, csv: customCsv.content }
    : SAMPLE_DATASETS.find((d) => d.id === selectedId) ?? SAMPLE_DATASETS[0];

  const previewRows = activeDataset.csv
    .trim()
    .split('\n')
    .slice(0, 11)
    .map((line) => line.split(','));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      setCustomCsv({ name: file.name, content });
      setCode(`import pandas as pd\ndf = pd.read_csv("${file.name}")\nprint(df.head())\nprint(df.info())`);
    };
    reader.readAsText(file);
  };

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      setLoadingPkg(true);
      await pyodideRunner.loadPackages(['numpy', 'pandas']);
      setLoadingPkg(false);

      const res = await pyodideRunner.run(code, {
        datasets: { [activeDataset.filename]: activeDataset.csv },
        timeoutMs: 15000,
      });
      setOutput(res.stdout);
      if (!res.ok) setError(res.error ?? res.stderr ?? 'Execution error');
    } catch (err) {
      setLoadingPkg(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Table2 className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            DataFrame Lab
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Select a synthetic dataset or upload a local CSV, inspect the table, and run pandas code in Pyodide.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Choose sample dataset"
            value={customCsv ? '__custom__' : selectedId}
            onChange={(e) => {
              setCustomCsv(null);
              setSelectedId(e.target.value);
              const ds = SAMPLE_DATASETS.find((d) => d.id === e.target.value);
              if (ds) {
                setCode(`import pandas as pd\ndf = pd.read_csv("${ds.filename}")\nprint(df.head())`);
              }
            }}
            className="text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e] px-3 py-1.5"
          >
            {SAMPLE_DATASETS.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
            {customCsv && <option value="__custom__">Uploaded: {customCsv.name}</option>}
          </select>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e] text-xs font-medium cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
            <input type="file" accept=".csv,text/csv" onChange={handleUpload} className="sr-only" />
          </label>
        </div>
      </header>

      {/* Table Preview */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#09090b] border-b border-neutral-200 dark:border-neutral-800">
              {previewRows[0]?.map((col, idx) => (
                <th key={idx} className="px-3 py-2 font-semibold text-neutral-700 dark:text-neutral-300">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-neutral-100 dark:border-neutral-800/60">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <CodeMirror
              value={code}
              height="220px"
              extensions={[python()]}
              theme={resolvedTheme === 'dark' ? oneDark : 'light'}
              onChange={setCode}
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={handleRun}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {loadingPkg ? 'Loading pandas & numpy (first load may take a moment)...' : 'Run pandas Code'}
          </button>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-auto h-[260px]">
          {error ? (
            <pre className="text-rose-400 whitespace-pre-wrap">{error}</pre>
          ) : (
            <pre className="whitespace-pre-wrap">{output || '(Run code to inspect DataFrame output)'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
