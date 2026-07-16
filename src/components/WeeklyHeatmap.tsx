import type { DayHourCell } from "@/lib/queries";
import { intensityColor, sentimentColor } from "@/lib/colorScale";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyHeatmap({ cells, mode }: { cells: DayHourCell[]; mode: "traffic" | "happiness" }) {
  const maxVisits = Math.max(1, ...cells.map((c) => c.visits));
  const byKey = new Map(cells.map((c) => [`${c.dow}-${c.hour}`, c]));

  function cellStyle(cell: DayHourCell): React.CSSProperties {
    if (mode === "traffic") {
      return { backgroundColor: intensityColor(cell.visits, maxVisits) };
    }
    if (cell.avgHappiness == null || cell.visits < 3) {
      return { backgroundColor: "var(--color-surface-muted)" };
    }
    return { backgroundColor: sentimentColor(cell.avgHappiness) };
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-[3px] text-xs">
        <thead>
          <tr>
            <th className="w-10" />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="font-normal text-foreground/40 text-[10px] w-6">
                {h % 3 === 0 ? h : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOW_LABELS.map((label, dow) => (
            <tr key={label}>
              <td className="text-right pr-2 text-foreground/70">{label}</td>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = byKey.get(`${dow}-${hour}`) ?? { dow, hour, visits: 0, avgHappiness: null };
                return (
                  <td
                    key={hour}
                    title={`${label} ${hour}:00 · ${cell.visits} visits${
                      cell.avgHappiness != null ? ` · ${cell.avgHappiness.toFixed(1)} mood` : ""
                    }`}
                  >
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
