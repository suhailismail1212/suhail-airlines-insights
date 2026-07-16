"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ZONE_COLOR_CYCLE } from "@/lib/colorScale";

export function ZoneTimeSeriesChart({
  data,
  zoneNames,
}: {
  data: Record<string, string | number>[];
  zoneNames: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
        {zoneNames.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            stackId="zones"
            fill={ZONE_COLOR_CYCLE[i % ZONE_COLOR_CYCLE.length]}
            animationDuration={600}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
