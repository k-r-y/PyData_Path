interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  label?: string;
}

export function ProgressRing({
  completed,
  total,
  size = 24,
  label,
}: ProgressRingProps) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={label ?? `${completed} of ${total} completed (${pct}%)`}
      aria-label={label ?? `${completed} of ${total} completed`}
    >
      <svg width={size} height={size} className="-rotate-90 shrink-0" role="img" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={
            pct === 100
              ? 'text-emerald-600 dark:text-emerald-400 transition-all duration-300'
              : 'text-neutral-900 dark:text-neutral-100 transition-all duration-300'
          }
        />
      </svg>
    </span>
  );
}
