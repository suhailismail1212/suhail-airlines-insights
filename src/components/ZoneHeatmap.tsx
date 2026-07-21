import type { HeatmapCell } from "@/lib/queries";
import { intensityColor, sentimentColor } from "@/lib/colorScale";

export function ZoneHeatmap({ cells, mode = "traffic" }: { cells: HeatmapCell[]; mode?: "traffic" | "happiness" }) {
  const zoneNames = Array.from(new Set(cells.map((c) => c.zoneName)));
  const maxEntries = Math.max(1, ...cells.map((c) => c.entries));
  const byKey = new Map(cells.map((c) => [`${c.zoneName}-${c.hour}`, c]));

  function cellStyle(cell: HeatmapCell | undefined): React.CSSProperties {
    if (mode === "traffic") return { backgroundColor: intensityColor(cell?.entries ?? 0, maxEntries) };
    if (!cell || cell.avgHappiness == null || cell.entries < 3) {
      return { backgroundColor: "var(--color-surface-muted)" };
    }
    return { backgroundColor: sentimentColor(cell.avgHappiness) };
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-[3px] text-xs">
        <thead>
          <tr>
            <th className="w-32" />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="font-normal text-foreground/40 text-[10px] w-6">
                {h % 3 === 0 ? h : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zoneNames.map((name) => (
            <tr key={name}>
              <td className="text-right pr-2 text-foreground/70 whitespace-nowrap">{name}</td>
              {Array.from({ length: 24 }, (_, h) => {
                const cell = byKey.get(`${name}-${h}`);
                const title =
                  mode === "traffic"
                    ? `${name} · ${h}:00 · ${cell?.entries ?? 0} entries`
                    : `${name} · ${h}:00${cell?.avgHappiness != null ? ` · ${cell.avgHappiness.toFixed(1)} mood` : " · no data"}`;
                return (
                  <td key={h} title={title}>
                    <div className="w-6 h-5 rounded-sm" style={cellStyle(cell)} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
