function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Red (unhappy) -> gold (neutral) -> sage (happy). Domain is deliberately
 * narrower than the full 1-10 scale (most real scores land 3-8.5) so the
 * gradient actually shows variation instead of clustering near "neutral". */
export function sentimentColor(score: number): string {
  const t = clamp01((score - 2) / 6.5);
  if (t < 0.5) {
    return `color-mix(in srgb, var(--color-chart-gold) ${Math.round((t / 0.5) * 100)}%, var(--color-chart-red))`;
  }
  return `color-mix(in srgb, var(--color-chart-sage) ${Math.round(((t - 0.5) / 0.5) * 100)}%, var(--color-chart-gold))`;
}

/** Light-to-saturated red for a value relative to the max in its set. */
export function intensityColor(value: number, max: number): string {
  const t = max > 0 ? clamp01(value / max) : 0;
  return `color-mix(in srgb, var(--color-chart-red) ${Math.round(t * 90)}%, var(--color-surface-muted))`;
}

export const ZONE_COLOR_CYCLE = [
  "var(--color-chart-red)",
  "var(--color-chart-gold)",
  "var(--color-chart-olive)",
  "var(--color-chart-sage)",
  "var(--color-chart-tan)",
  "var(--color-red-400)",
  "var(--color-gold-600)",
  "var(--color-red-700)",
  "var(--color-red-600)",
  "var(--color-gold-400)",
];
