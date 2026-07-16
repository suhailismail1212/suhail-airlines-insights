"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WaitTimeChart({ data }: { data: { hour: number; avgWaitMinutes: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="hour"
          tickFormatter={(h) => `${h}:00`}
          tick={{ fontSize: 11, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          width={32}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
          formatter={(value) => [`${Number(value).toFixed(1)} min`, "Avg wait"]}
          labelFormatter={(h) => `${h}:00`}
        />
        <Line
          type="monotone"
          dataKey="avgWaitMinutes"
          stroke="var(--color-chart-gold)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
