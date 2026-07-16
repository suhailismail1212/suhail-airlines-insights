import type { HeatmapCell } from "@/lib/queries";
import { intensityColor } from "@/lib/colorScale";

export function ZoneHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const zoneNames = Array.from(new Set(cells.map((c) => c.zoneName)));
  const max = Math.max(1, ...cells.map((c) => c.entries));
  const byKey = new Map(cells.map((c) => [`${c.zoneName}-${c.hour}`, c.entries]));

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
                const entries = byKey.get(`${name}-${h}`) ?? 0;
                return (
                  <td key={h} title={`${name} · ${h}:00 · ${entries} entries`}>
                    <div className="w-6 h-5 rounded-sm" style={{ backgroundColor: intensityColor(entries, max) }} />
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
