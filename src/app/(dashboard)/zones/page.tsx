import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getHappinessByZone, getZoneFootfall, getZoneHourHeatmap, getZoneTimeSeries } from "@/lib/queries";
import { intensityColor, sentimentColor } from "@/lib/colorScale";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { ZoneHeatmap } from "@/components/ZoneHeatmap";
import { ZoneTreemap } from "@/components/charts/ZoneTreemap";
import { ZoneTimeSeriesChart } from "@/components/charts/ZoneTimeSeriesChart";
import { WeekendToggle } from "@/components/WeekendToggle";
import { GrowBar } from "@/components/GrowBar";
import { ZoneBreakdownList } from "@/components/ZoneBreakdownList";
import { LensToggle, type Lens } from "@/components/LensToggle";

function formatCompact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
}

export default async function ZonesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; weekends?: string; lens?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const includeWeekends = params.weekends !== "0";
  const lens: Lens = params.lens === "happiness" ? "happiness" : "visits";

  const footfall = getZoneFootfall(range);
  const happinessByZone = getHappinessByZone(range);
  const heatmap = getZoneHourHeatmap(range);
  const maxEntries = Math.max(...footfall.map((z) => z.entries), 1);

  const trafficTreemapData = footfall.map((z) => ({
    name: z.name,
    value: z.entries,
    fill: intensityColor(z.entries, maxEntries),
    displayValue: z.entries.toLocaleString(),
  }));

  const happinessTreemapData = happinessByZone.map((z) => ({
    name: z.name,
    value: z.avgHappiness,
    fill: sentimentColor(z.avgHappiness),
    displayValue: `${z.avgHappiness.toFixed(1)}/10`,
  }));

  const timeSeriesRows = getZoneTimeSeries(range, includeWeekends);
  const zoneNames = Array.from(new Set(timeSeriesRows.map((r) => r.zoneName)));
  const byDate = new Map<string, Record<string, string | number>>();
  for (const row of timeSeriesRows) {
    if (!byDate.has(row.date)) byDate.set(row.date, { date: row.date });
    byDate.get(row.date)![row.zoneName] = row.entries;
  }
  const timeSeriesData = Array.from(byDate.values());

  const happinessListRows = happinessByZone.map((z) => ({
    name: z.name,
    widthPercent: (z.avgHappiness / 10) * 100,
    valueLabel: `${z.avgHappiness.toFixed(1)}/10`,
    color: sentimentColor(z.avgHappiness),
    sublabel: `${formatCompact(z.samples)} happiness checks`,
  }));

  return (
    <div>
      <PageHeader
        title="Zone analytics"
        subtitle="Traffic density and time-of-day patterns per zone"
        range={range}
        maxDate={maxDate}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <LensToggle lens={lens} />
        <span className="text-xs text-foreground/40">
          {lens === "visits" ? "Visits lens — footfall & movement" : "Happiness lens — colour maps to sentiment"}
        </span>
      </div>

      {lens === "visits" ? (
        <>
          <Card className="mb-4">
            <CardTitle subtitle="Block size = entries. Every zone entry counted, including pass-through.">
              Traffic by zone
            </CardTitle>
            <ZoneTreemap data={trafficTreemapData} />
          </Card>

          <Card className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <CardTitle subtitle="Daily zone entries, stacked by zone">Zone entries over time</CardTitle>
              <WeekendToggle enabled={includeWeekends} />
            </div>
            <ZoneTimeSeriesChart data={timeSeriesData} zoneNames={zoneNames} />
          </Card>

          <Card className="mb-4">
            <CardTitle subtitle="Every zone entry counted, including pass-through — measures movement & frequency, not unique visits">
              Traffic density by zone
            </CardTitle>
            <div className="space-y-3">
              {footfall.map((z) => (
                <div key={z.id} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-foreground/70 truncate">{z.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <GrowBar widthPercent={(z.entries / maxEntries) * 100} className="bg-chart-red" />
                  </div>
                  <span className="w-16 text-right text-sm board-numerals">{z.entries.toLocaleString()}</span>
                  <span className="w-20 text-right text-xs text-foreground/50">{z.avgHappiness.toFixed(1)} mood</span>
                  <span className="w-24 text-right text-xs text-foreground/50">
                    {Math.round(z.avgDurationMinutes)} min avg
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle subtitle="Zone entries by hour of day across the selected range">Time-of-day heatmap</CardTitle>
            <ZoneHeatmap cells={heatmap} mode="traffic" />
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-4">
            <CardTitle subtitle="Block size = happiness score. Red is unhappy, sage is happy.">
              Happiness by zone
            </CardTitle>
            <ZoneTreemap data={happinessTreemapData} />
          </Card>

          <Card className="mb-4">
            <CardTitle subtitle="Average happiness score recorded per zone, with sample size">
              Happiness by zone
            </CardTitle>
            <ZoneBreakdownList rows={happinessListRows} />
          </Card>

          <Card>
            <CardTitle subtitle="Average happiness score by hour of day across the selected range">
              Time-of-day heatmap
            </CardTitle>
            <ZoneHeatmap cells={heatmap} mode="happiness" />
          </Card>
        </>
      )}
    </div>
  );
}
