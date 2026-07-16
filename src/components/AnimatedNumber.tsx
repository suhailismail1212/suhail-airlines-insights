"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 500;

export interface NumberFormat {
  /** Decimal places. 0 (default) renders as a locale-formatted integer (with
   * thousands separators); >0 renders via toFixed (no separators, but none
   * of our values need them at that scale). */
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Only plain data crosses the Server->Client boundary — a function prop
 * (e.g. a formatter closure defined in a Server Component page) can't be
 * passed to a Client Component, so formatting is described declaratively
 * here instead. */
function formatNumber(n: number, { decimals = 0, prefix = "", suffix = "" }: NumberFormat): string {
  const body = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  return `${prefix}${body}${suffix}`;
}

export function AnimatedNumber({ value, format = {} }: { value: number; format?: NumberFormat }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }

    // Anchor "start" to the first rAF callback's own timestamp rather than
    // performance.now() called here — the two clocks can differ by a hair,
    // which briefly drove t negative and flashed a negative number.
    let start: number | null = null;
    function tick(now: number) {
      if (start === null) start = now;
      const t = Math.max(0, Math.min(1, (now - start) / DURATION_MS));
      setDisplay(value * easeOutCubic(t));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <>{formatNumber(display, format)}</>;
}
