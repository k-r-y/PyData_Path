import { useState } from 'react';
import { Gauge, Loader2 } from 'lucide-react';
import { pyodideRunner } from '../../runtime/runner';
import type { ProblemSpec } from '../../types/problem';

interface BenchPoint {
  size: number;
  ms: number;
}

interface ComplexityBenchCardProps {
  spec: ProblemSpec;
  code: string;
}

export function ComplexityBenchCard({ spec, code }: ComplexityBenchCardProps) {
  const [running, setRunning] = useState(false);
  const [points, setPoints] = useState<BenchPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!spec.benchSizes || spec.benchSizes.length === 0 || !spec.benchInputExpr || spec.entry.type !== 'function') {
    return null;
  }

  const handleBenchmark = async () => {
    setRunning(true);
    setError(null);
    setPoints([]);

    const entryName = spec.entry.type === 'function' ? spec.entry.name : '';
    const script = `
import time, json as _json
_sizes = ${JSON.stringify(spec.benchSizes)}
_expr = ${JSON.stringify(spec.benchInputExpr)}
_results = []
for n in _sizes:
    _raw = eval(_expr, globals(), {"n": n})
    _args = _raw if isinstance(_raw, tuple) else (_raw,)
    _t0 = time.perf_counter()
    ${entryName}(*_args)
    _elapsed = (time.perf_counter() - _t0) * 1000.0
    _results.append({"size": n, "ms": round(_elapsed, 3)})
print(_json.dumps(_results))
`;
    try {
      const combined = `${code}\n${script}`;
      const res = await pyodideRunner.run(combined, { timeoutMs: 10000 });
      if (!res.ok) {
        setError(res.error ?? 'Benchmark failed to run.');
      } else {
        setPoints(JSON.parse(res.stdout.trim()) as BenchPoint[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to parse benchmark timings.');
    } finally {
      setRunning(false);
    }
  };

  const maxMs = Math.max(0.01, ...points.map((p) => p.ms));

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-neutral-950 dark:text-white flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
            Rough Complexity Scaling Check
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Rough timing estimate across N = {spec.benchSizes.join(', ')}. WebAssembly timers and GC make small readings noisy.
          </p>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={handleBenchmark}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141417] text-[11px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
        >
          {running && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
          Run Rough Benchmark
        </button>
      </div>

      {error && (
        <pre className="text-[11px] font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
          {error}
        </pre>
      )}

      {points.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {points.map((pt) => (
              <div key={pt.size} className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-16 text-right text-neutral-500 tabular-nums">n={pt.size}</span>
                <div className="flex-1 h-3 rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(4, (pt.ms / maxMs) * 100)}%` }}
                    className="h-full bg-neutral-900 dark:bg-neutral-100 rounded"
                  />
                </div>
                <span className="w-16 tabular-nums text-neutral-700 dark:text-neutral-200">
                  {pt.ms.toFixed(2)} ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
