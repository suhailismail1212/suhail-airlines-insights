"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ZoneHappinessBarChart({ data }: { data: { name: string; avgHappiness: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={70}
        />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
          formatter={(value) => (typeof value === "number" ? value.toFixed(1) : String(value ?? ""))}
        />
        <Bar dataKey="avgHappiness" fill="var(--color-chart-amber)" radius={[4, 4, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
