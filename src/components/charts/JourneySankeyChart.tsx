"use client";

import { Layer, ResponsiveContainer, Sankey, Tooltip } from "recharts";
import type { SankeyLink } from "@/lib/queries";

function buildSankeyData(links: SankeyLink[]) {
  const names = Array.from(new Set(links.flatMap((l) => [l.source, l.target])));
  const indexByName = new Map(names.map((n, i) => [n, i]));
  return {
    nodes: names.map((name) => ({ name })),
    links: links.map((l) => ({
      source: indexByName.get(l.source)!,
      target: indexByName.get(l.target)!,
      value: l.value,
    })),
  };
}

function SankeyNode(props: unknown) {
  const { x, y, width, height, payload } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    payload: { name: string };
  };
  const isTerminal = payload.name === "Entry" || payload.name === "Exit";
  return (
    <Layer>
      <rect x={x} y={y} width={width} height={height} fill={isTerminal ? "var(--color-navy-700)" : "var(--color-chart-coral)"} rx={2} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={11}
        fill="var(--foreground)"
      >
        {payload.name}
      </text>
    </Layer>
  );
}

export function JourneySankeyChart({ links }: { links: SankeyLink[] }) {
  const data = buildSankeyData(links);
  return (
    <ResponsiveContainer width="100%" height={480}>
      <Sankey
        data={data}
        node={SankeyNode}
        nodeWidth={10}
        nodePadding={22}
        link={{ stroke: "var(--color-chart-teal)", strokeOpacity: 0.25 }}
        margin={{ left: 16, right: 90, top: 16, bottom: 16 }}
      >
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
      </Sankey>
    </ResponsiveContainer>
  );
}
