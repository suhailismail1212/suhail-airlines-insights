"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ZoneBarChart({ data }: { data: { name: string; visits: number }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToZoneAnalytics() {
    const qs = searchParams.toString();
    router.push(qs ? `/zones?${qs}` : "/zones");
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12, fill: "var(--foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
          cursor={{ fill: "var(--color-surface-muted)" }}
        />
        <Bar
          dataKey="visits"
          fill="var(--color-chart-red)"
          radius={[0, 4, 4, 0]}
          barSize={16}
          onClick={goToZoneAnalytics}
          cursor="pointer"
          animationDuration={600}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
