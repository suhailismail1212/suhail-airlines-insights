"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function HappinessTrendChart({ data }: { data: { date: string; avgHappiness: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
        <defs>
          <linearGradient id="happinessFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-sage)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-chart-sage)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 12, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
        <Area
          type="monotone"
          dataKey="avgHappiness"
          stroke="none"
          fill="url(#happinessFill)"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="avgHappiness"
          stroke="var(--color-chart-sage)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
