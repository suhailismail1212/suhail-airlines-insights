"use client";

import { useState } from "react";
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
      <rect x={x} y={y} width={width} height={height} fill={isTerminal ? "var(--color-chart-olive)" : "var(--color-chart-red)"} rx={2} />
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

/** Highlights the hovered flow — that link only, from its source bar to the
 * next bar — and dims the rest, rather than leaving every path flat. */
function makeSankeyLink(hoveredIndex: number | null) {
  return function SankeyLinkPath(props: unknown) {
    const {
      sourceX,
      sourceY,
      sourceControlX,
      targetX,
      targetY,
      targetControlX,
      linkWidth,
      index,
    } = props as {
      sourceX: number;
      sourceY: number;
      sourceControlX: number;
      targetX: number;
      targetY: number;
      targetControlX: number;
      linkWidth: number;
      index: number;
    };
    const isHovered = hoveredIndex === index;
    const isDimmed = hoveredIndex != null && !isHovered;
    return (
      <path
        d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke="var(--color-chart-sage)"
        strokeWidth={Math.max(linkWidth, 1)}
        strokeOpacity={isHovered ? 0.65 : isDimmed ? 0.08 : 0.25}
        style={{ transition: "stroke-opacity 120ms ease", cursor: "pointer" }}
      />
    );
  };
}

export function JourneySankeyChart({ links }: { links: SankeyLink[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = buildSankeyData(links);

  return (
    <ResponsiveContainer width="100%" height={480}>
      <Sankey
        data={data}
        node={SankeyNode}
        link={makeSankeyLink(hoveredIndex)}
        nodeWidth={10}
        nodePadding={22}
        margin={{ left: 16, right: 90, top: 16, bottom: 16 }}
        onMouseEnter={(item, type) => {
          if (type === "link" && "index" in item) setHoveredIndex((item as { index: number }).index);
        }}
        onMouseLeave={(_item, type) => {
          if (type === "link") setHoveredIndex(null);
        }}
      >
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }} />
      </Sankey>
    </ResponsiveContainer>
  );
}
