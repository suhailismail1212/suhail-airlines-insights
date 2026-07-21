"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "../AnimatedNumber";

/** Half-circle mood gauge — hand-rolled SVG arc rather than recharts'
 * RadialBarChart, which fights you on precise start/end angles for a
 * true semicircle and adds a lot of ceremony for a single stroke. */
export function GaugeChart({ value, max = 10 }: { value: number; max?: number }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const size = 160;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r;
  const pct = Math.max(0, Math.min(1, animated / max));
  const filled = circumference * pct;
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <path d={path} fill="none" stroke="var(--color-surface-muted)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-chart-sage)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
      </svg>
      <div className="-mt-4 text-center">
        <span className="text-2xl font-medium board-numerals text-red-300">
          <AnimatedNumber value={value} format={{ decimals: 1, suffix: `/${max}` }} />
        </span>
      </div>
    </div>
  );
}
