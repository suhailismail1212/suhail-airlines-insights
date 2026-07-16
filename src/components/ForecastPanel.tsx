import type { ForecastDay } from "@/lib/queries";
import { formatDisplayDate } from "@/lib/dates";

export function ForecastPanel({ days }: { days: ForecastDay[] }) {
  const max = Math.max(...days.map((d) => d.predictedVisits), 1);

  return (
    <div className="space-y-3.5">
      {days.map((d) => (
        <div key={d.date} className="flex items-center gap-3">
          <div className="w-24 shrink-0">
            <p className="text-xs font-medium text-foreground">{d.dayLabel}</p>
            <p className="text-[11px] text-foreground/40">{formatDisplayDate(d.date)}</p>
          </div>
          <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full bg-chart-gold rounded-full"
              style={{ width: `${(d.predictedVisits / max) * 100}%` }}
            />
          </div>
          <span className="text-sm board-numerals w-10 text-right">{d.predictedVisits}</span>
          {d.peakHour != null && (
            <span className="text-[11px] text-foreground/40 w-16 text-right shrink-0">peak {d.peakHour}:00</span>
          )}
        </div>
      ))}
    </div>
  );
}
