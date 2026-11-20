import { useMemo, useState } from 'react';
import { Activity, RotateCcw } from 'lucide-react';

type SimTab = 'clt' | 'ci' | 'pvalue' | 'correlation' | 'regression';

export function SimulatorsPage() {
  const [tab, setTab] = useState<SimTab>('clt');

  // 1. CLT state
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(200);
  const [seed, setSeed] = useState(1);

  // 2. Confidence Interval state
  const [ciSeed, setCiSeed] = useState(1);

  // 3. P-value state
  const [effectDiff, setEffectDiff] = useState(0.5);
  const [nGroup, setNGroup] = useState(40);

  // 4. Correlation vs Outlier state
  const [includeOutlier, setIncludeOutlier] = useState(false);

  // 5. Regression state
  const [slope, setSlope] = useState(1.2);
  const [intercept, setIntercept] = useState(10);

  // Deterministic PRNG for reproducible simulations
  const cltBins = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const means: number[] = [];
    for (let i = 0; i < numSamples; i++) {
      let sum = 0;
      for (let j = 0; j < sampleSize; j++) {
        // Skewed exponential-like population: -ln(1 - u)
        sum += -Math.log(Math.max(1e-6, 1 - rand()));
      }
      means.push(sum / sampleSize);
    }
    const bins = Array(15).fill(0) as number[];
    for (const m of means) {
      const idx = Math.min(14, Math.max(0, Math.floor((m / 2.2) * 15)));
      bins[idx]++;
    }
    return bins;
  }, [sampleSize, numSamples, seed]);

  const ciIntervals = useMemo(() => {
    let s = ciSeed * 7919 + 104729;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    // Box-Muller normal(50, 10)
    const normal = () => {
      const u1 = Math.max(1e-6, rand());
      const u2 = rand();
      return 50 + 10 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    const results: { low: number; high: number; mean: number; covers: boolean }[] = [];
    const n = 25;
    const margin = 1.96 * (10 / Math.sqrt(n));
    for (let i = 0; i < 25; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += normal();
      const mean = sum / n;
      const low = mean - margin;
      const high = mean + margin;
      results.push({ low, high, mean, covers: low <= 50 && 50 <= high });
    }
    return results;
  }, [ciSeed]);

  const zStat = (effectDiff * Math.sqrt(nGroup / 2)).toFixed(2);
  const approxP = Math.exp(-0.5 * Number(zStat) * Number(zStat));

  const corrPoints = useMemo(() => {
    const base = [
      { x: 1, y: 2.1 },
      { x: 2, y: 3.9 },
      { x: 3, y: 6.2 },
      { x: 4, y: 7.8 },
      { x: 5, y: 10.1 },
      { x: 6, y: 11.9 },
    ];
    return includeOutlier ? [...base, { x: 7, y: 1.0 }] : base;
  }, [includeOutlier]);

  const pearsonR = useMemo(() => {
    const n = corrPoints.length;
    const mx = corrPoints.reduce((a, p) => a + p.x, 0) / n;
    const my = corrPoints.reduce((a, p) => a + p.y, 0) / n;
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (const p of corrPoints) {
      num += (p.x - mx) * (p.y - my);
      dx += (p.x - mx) ** 2;
      dy += (p.y - my) ** 2;
    }
    return (num / Math.sqrt(dx * dy)).toFixed(3);
  }, [corrPoints]);

  const regPoints = [
    { x: 10, y: 22 },
    { x: 20, y: 34 },
    { x: 30, y: 48 },
    { x: 40, y: 55 },
    { x: 50, y: 72 },
  ];
  const sse = regPoints
    .reduce((acc, p) => acc + (p.y - (slope * p.x + intercept)) ** 2, 0)
    .toFixed(1);

  const tabs: { id: SimTab; label: string }[] = [
    { id: 'clt', label: '1. Central Limit Theorem' },
    { id: 'ci', label: '2. Confidence Intervals' },
    { id: 'pvalue', label: '3. p-value & Hypothesis' },
    { id: 'correlation', label: '4. Correlation vs Outliers' },
    { id: 'regression', label: '5. Regression Fitting' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Interactive Statistics Simulators
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Build intuition for sampling distributions, confidence intervals, p-values, outliers, and linear regression.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'bg-white dark:bg-[#0c0c0e] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-6 space-y-5">
        {tab === 'clt' && (
          <>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <label className="space-y-1">
                <span>Sample size (n = {sampleSize})</span>
                <input
                  type="range"
                  min={2}
                  max={100}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="block"
                />
              </label>
              <label className="space-y-1">
                <span>Samples ({numSamples})</span>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={50}
                  value={numSamples}
                  onChange={(e) => setNumSamples(Number(e.target.value))}
                  className="block"
                />
              </label>
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Resample
              </button>
            </div>

            <svg viewBox="0 0 450 160" className="w-full max-w-xl h-44 bg-neutral-50 dark:bg-[#09090b] rounded border border-neutral-200 dark:border-neutral-800 p-2">
              {cltBins.map((count, idx) => {
                const maxC = Math.max(1, ...cltBins);
                const h = (count / maxC) * 120;
                return (
                  <rect
                    key={idx}
                    x={idx * 28 + 15}
                    y={140 - h}
                    width={22}
                    height={h}
                    rx={2}
                    className="fill-neutral-500"
                  />
                );
              })}
            </svg>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Even when the underlying population is right-skewed, increasing sample size n makes the distribution of sample means tighter and more bell-shaped.
            </p>
          </>
        )}

        {tab === 'ci' && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span>
                25 independent 95% confidence intervals around true mean = 50. Captured:{' '}
                <strong>{ciIntervals.filter((i) => i.covers).length} / 25</strong>
              </span>
              <button
                type="button"
                onClick={() => setCiSeed((s) => s + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Draw New 25 Samples
              </button>
            </div>
            <svg viewBox="0 0 400 220" className="w-full max-w-xl h-56 bg-neutral-50 dark:bg-[#09090b] rounded border border-neutral-200 dark:border-neutral-800">
              <line x1={200} y1={10} x2={200} y2={210} stroke="currentColor" strokeDasharray="4 4" className="text-neutral-400" />
              {ciIntervals.map((iv, idx) => {
                const y = idx * 8 + 12;
                const x1 = 200 + (iv.low - 50) * 12;
                const x2 = 200 + (iv.high - 50) * 12;
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    strokeWidth={3}
                    className={iv.covers ? 'stroke-emerald-500' : 'stroke-rose-500'}
                  />
                );
              })}
            </svg>
          </>
        )}

        {tab === 'pvalue' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-6">
              <label className="space-y-1">
                <span>Effect size (d = {effectDiff})</span>
                <input
                  type="range"
                  min={0}
                  max={1.2}
                  step={0.1}
                  value={effectDiff}
                  onChange={(e) => setEffectDiff(Number(e.target.value))}
                  className="block"
                />
              </label>
              <label className="space-y-1">
                <span>Group size (n = {nGroup})</span>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={10}
                  value={nGroup}
                  onChange={(e) => setNGroup(Number(e.target.value))}
                  className="block"
                />
              </label>
            </div>
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-[#09090b] border border-neutral-200 dark:border-neutral-800 space-y-1">
              <p>Test statistic (z): <strong>{zStat}</strong></p>
              <p>Approximate two-sided p-value indicator: <strong>{approxP.toFixed(4)}</strong></p>
              <p className="text-neutral-500 pt-1">
                Notice how larger sample sizes can produce small p-values even for tiny effect sizes. Always inspect effect size alongside p-values.
              </p>
            </div>
          </div>
        )}

        {tab === 'correlation' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span>Pearson r: <strong className="text-base">{pearsonR}</strong></span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOutlier}
                  onChange={(e) => setIncludeOutlier(e.target.checked)}
                />
                Add single outlier at (7, 1.0)
              </label>
            </div>
            <svg viewBox="0 0 320 180" className="w-full max-w-md h-48 bg-neutral-50 dark:bg-[#09090b] rounded border border-neutral-200 dark:border-neutral-800">
              {corrPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x * 38 + 20}
                  cy={165 - p.y * 12}
                  r={5}
                  className={idx === 6 ? 'fill-rose-500' : 'fill-neutral-600'}
                />
              ))}
            </svg>
          </div>
        )}

        {tab === 'regression' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-6 items-center">
              <label className="space-y-1">
                <span>Slope ({slope})</span>
                <input
                  type="range"
                  min={0.2}
                  max={2.2}
                  step={0.1}
                  value={slope}
                  onChange={(e) => setSlope(Number(e.target.value))}
                  className="block"
                />
              </label>
              <label className="space-y-1">
                <span>Intercept ({intercept})</span>
                <input
                  type="range"
                  min={-10}
                  max={30}
                  step={1}
                  value={intercept}
                  onChange={(e) => setIntercept(Number(e.target.value))}
                  className="block"
                />
              </label>
              <span>Sum of Squared Errors (SSE): <strong>{sse}</strong></span>
            </div>
            <svg viewBox="0 0 300 180" className="w-full max-w-md h-48 bg-neutral-50 dark:bg-[#09090b] rounded border border-neutral-200 dark:border-neutral-800">
              <line
                x1={0}
                y1={170 - (slope * 0 + intercept) * 1.8}
                x2={300}
                y2={170 - (slope * 60 + intercept) * 1.8}
                strokeWidth={2}
                className="stroke-emerald-500"
              />
              {regPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x * 5}
                  cy={170 - p.y * 1.8}
                  r={4.5}
                  className="fill-neutral-600"
                />
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
