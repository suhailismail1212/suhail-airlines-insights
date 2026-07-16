import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getZoneFootfall, getZoneHourHeatmap } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { ZoneHeatmap } from "@/components/ZoneHeatmap";

export default async function ZonesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();

  const footfall = getZoneFootfall(range);
  const heatmap = getZoneHourHeatmap(range);
  const maxEntries = Math.max(...footfall.map((z) => z.entries), 1);

  return (
    <div>
      <PageHeader
        title="Zone analytics"
        subtitle="Traffic density and time-of-day patterns per zone"
        range={range}
        maxDate={maxDate}
      />

      <Card className="mb-4">
        <CardTitle subtitle="Every zone entry counted, including pass-through — measures movement & frequency, not unique visits">
          Traffic density by zone
        </CardTitle>
        <div className="space-y-3">
          {footfall.map((z) => (
            <div key={z.id} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-foreground/70 truncate">{z.name}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-chart-red rounded-full"
                  style={{ width: `${(z.entries / maxEntries) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm board-numerals">{z.entries.toLocaleString()}</span>
              <span className="w-20 text-right text-xs text-foreground/50">{z.avgHappiness.toFixed(1)} mood</span>
              <span className="w-24 text-right text-xs text-foreground/50">{Math.round(z.avgDurationMinutes)} min avg</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle subtitle="Zone entries by hour of day across the selected range">Time-of-day heatmap</CardTitle>
        <ZoneHeatmap cells={heatmap} />
      </Card>
    </div>
  );
}
