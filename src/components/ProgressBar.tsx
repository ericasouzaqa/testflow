interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>
          {value} / {max}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-neon transition-all duration-300 shadow-glow"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
