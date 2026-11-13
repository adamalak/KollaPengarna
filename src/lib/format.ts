/**
 * Format a numeric amount as Swedish Kronor without decimals by default.
 */
export function formatSEK(amount: number, decimals = 0): string {
  if (!Number.isFinite(amount)) return "0 kr";
  return (
    new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount) + " kr"
  );
}

/**
 * Format a percentage value with Swedish decimal comma.
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "0 %";
  return (
    new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + " %"
  );
}

/**
 * Format hours cleanly in Swedish (e.g. "12,5 tim" or "42 min").
 */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 tim";
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  return (
    new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(hours) + " tim"
  );
}

/**
 * Clamp a number between min and max, returning fallback if NaN/Infinity.
 */
export function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
