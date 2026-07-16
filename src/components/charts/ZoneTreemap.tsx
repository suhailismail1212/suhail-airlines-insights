"use client";

import { ResponsiveContainer, Treemap } from "recharts";

export interface TreemapDatum {
  name: string;
  value: number;
  fill: string;
  displayValue: string;
  [key: string]: unknown;
}

function TreemapCell(props: unknown) {
  const { x, y, width, height, name, fill, displayValue } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    fill: string;
    displayValue: string;
  };
  if (!width || !height) return null;
  const showLabel = width > 55 && height > 28;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="var(--color-surface)" strokeWidth={2} rx={3} />
      {showLabel && (
        <>
          <text x={x + 8} y={y + 17} fontSize={11} fill="#fff" fontWeight={500}>
            {name}
          </text>
          <text x={x + 8} y={y + height - 9} fontSize={13} fill="#fff" fontWeight={500}>
            {displayValue}
          </text>
        </>
      )}
    </g>
  );
}

export function ZoneTreemap({ data }: { data: TreemapDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap data={data} dataKey="value" stroke="var(--color-surface)" content={<TreemapCell />} isAnimationActive={false} />
    </ResponsiveContainer>
  );
}
