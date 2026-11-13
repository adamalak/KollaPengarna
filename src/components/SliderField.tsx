"use client";

import { useId } from "react";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  allowDecimals?: boolean;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  hint,
  allowDecimals = false,
}: SliderFieldProps) {
  const inputId = useId();
  const sliderId = useId();

  const handleNumberChange = (raw: string) => {
    const normalized = raw.replace(",", ".");
    if (normalized.trim() === "") {
      onChange(min);
      return;
    }
    const parsed = allowDecimals ? parseFloat(normalized) : parseInt(normalized, 10);
    if (!Number.isNaN(parsed)) {
      onChange(Math.min(max * 2, Math.max(0, parsed)));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-zinc-900">
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="number"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            min={min}
            max={max * 2}
            step={step}
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => handleNumberChange(e.target.value)}
            className="font-mono-num w-28 rounded-md border border-stone-300 bg-white py-1.5 pr-9 pl-2.5 text-right text-sm font-medium text-zinc-900 transition focus:border-[#0B4F3F] focus:ring-2 focus:ring-[#0B4F3F]/15 focus:outline-none sm:w-32"
          />
          {unit && (
            <span className="pointer-events-none absolute right-2.5 text-xs font-medium text-stone-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="kp-slider"
      />

      {hint && <p className="text-xs leading-relaxed text-stone-500">{hint}</p>}
    </div>
  );
}
