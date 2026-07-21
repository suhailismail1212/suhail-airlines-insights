"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

/** A width-percent bar that grows in from 0 on mount, rather than
 * appearing at full width immediately. */
export function GrowBar({
  widthPercent,
  className,
  color,
}: {
  widthPercent: number;
  className?: string;
  color?: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const id = requestAnimationFrame(() => setWidth(widthPercent));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setWidth(widthPercent));
    return () => cancelAnimationFrame(id);
  }, [widthPercent]);

  return (
    <div
      className={clsx("h-full rounded-full transition-[width] duration-500 ease-out", className)}
      style={{ width: `${width}%`, ...(color ? { background: color } : {}) }}
    />
  );
}
