interface BreakdownSegment {
  label: string;
  value: number;
  formattedValue: string;
  colorClass: string;
}

interface BreakdownBarProps {
  title?: string;
  segments: BreakdownSegment[];
}

export function BreakdownBar({ title, segments }: BreakdownBarProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  return (
    <div className="space-y-2.5">
      {title && (
        <p className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase">{title}</p>
      )}

      <div className="flex h-2.5 w-full overflow-hidden rounded-sm bg-stone-200">
        {total > 0 ? (
          segments.map((segment) => {
            const pct = Math.max(0, (segment.value / total) * 100);
            if (pct <= 0.2) return null;
            return (
              <div
                key={segment.label}
                style={{ width: `${pct}%` }}
                className={`${segment.colorClass} transition-all duration-300`}
                title={`${segment.label}: ${segment.formattedValue}`}
              />
            );
          })
        ) : (
          <div className="h-full w-full bg-stone-300" />
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-stone-700">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-xs ${segment.colorClass}`} />
            <span className="text-stone-600">{segment.label}:</span>
            <span className="font-mono-num font-semibold text-zinc-900">
              {segment.formattedValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
