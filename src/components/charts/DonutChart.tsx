"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function DonutChart({
  data,
  colors,
  totalLabel,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  totalLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative w-[170px] h-[170px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
            formatter={(value, name) => {
              const numValue = typeof value === "number" ? value : Number(value ?? 0);
              const pct = total ? ((numValue / total) * 100).toFixed(1) : "0";
              return [`${numValue.toLocaleString()} (${pct}%)`, name];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-medium board-numerals">{total.toLocaleString()}</span>
        {totalLabel && <span className="text-[10px] text-foreground/40 uppercase tracking-wide">{totalLabel}</span>}
      </div>
    </div>
  );
}
