"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

/**
 * No <Tooltip> here on purpose — recharts floats pie tooltips near the
 * chart's center for small charts like this one, which collides with the
 * total-count label already sitting there. Instead the center label itself
 * swaps to the hovered segment's value, the same "hover reveals detail"
 * idea as the Sankey flow highlight, without two things fighting for the
 * same pixels.
 */
export function DonutChart({
  data,
  colors,
  totalLabel,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  totalLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const active = activeIndex != null ? data[activeIndex] : null;
  const activePct = active && total ? ((active.value / total) * 100).toFixed(1) : null;

  return (
    <div className="relative w-[170px] h-[170px] shrink-0" onMouseLeave={() => setActiveIndex(null)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
            activeShape={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={colors[i % colors.length]}
                opacity={activeIndex == null || activeIndex === i ? 1 : 0.3}
                style={{ transition: "opacity 120ms ease", cursor: "pointer" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
        <span className="text-xl font-medium board-numerals">
          {(active ? active.value : total).toLocaleString()}
        </span>
        <span className="text-[10px] text-foreground/40 uppercase tracking-wide truncate max-w-full">
          {active ? `${active.name}${activePct ? ` · ${activePct}%` : ""}` : totalLabel}
        </span>
      </div>
    </div>
  );
}
