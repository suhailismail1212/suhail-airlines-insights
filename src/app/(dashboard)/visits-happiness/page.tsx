import { Smile } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getDayHourHeatmap, getHappinessByZone, getHappinessTrend, getKpiSummary, getWaitTimeByHour } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { HappinessTrendChart } from "@/components/charts/HappinessTrendChart";
import { ZoneHappinessBarChart } from "@/components/charts/ZoneHappinessBarChart";
import { WaitTimeChart } from "@/components/charts/WaitTimeChart";
import { KpiCard } from "@/components/KpiCard";
import { WeeklyHeatmap } from "@/components/WeeklyHeatmap";

export default async function VisitsHappinessPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();

  const trend = getHappinessTrend(range);
  const byZone = getHappinessByZone(range);
  const kpi = getKpiSummary(range);
  const dayHourCells = getDayHourHeatmap(range);
  const waitTime = getWaitTimeByHour(range);
  const best = byZone[0];
  const worst = byZone[byZone.length - 1];

  return (
    <div>
      <PageHeader
        title="Visits & happiness"
        subtitle="AI-inferred mood scoring across every touchpoint"
        range={range}
        maxDate={maxDate}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total visits" value={kpi.totalVisits} icon={Smile} />
        <KpiCard label="Avg happiness" value={kpi.avgHappiness} format={{ decimals: 1, suffix: " / 10" }} />
        <KpiCard label="Happiest zone" value={best ? best.name : "—"} />
        <KpiCard label="Lowest scoring zone" value={worst ? worst.name : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardTitle subtitle="Daily average happiness score across all visits (1-10)">Happiness trend</CardTitle>
          <HappinessTrendChart data={trend.map((t) => ({ date: t.date, avgHappiness: t.avgHappiness }))} />
        </Card>
        <Card>
          <CardTitle subtitle="Average score recorded on each pass through a zone">Happiness by zone</CardTitle>
          <ZoneHappinessBarChart data={byZone.map((z) => ({ name: z.name, avgHappiness: z.avgHappiness }))} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardTitle subtitle="Visit volume by day of week and hour — darker means busier">Visits heatmap</CardTitle>
          <WeeklyHeatmap cells={dayHourCells} mode="traffic" />
        </Card>
        <Card>
          <CardTitle subtitle="Same grid, colored by mood — red is unhappy, sage is happy. Cells under 3 visits are dimmed.">
            Happiness heatmap
          </CardTitle>
          <WeeklyHeatmap cells={dayHourCells} mode="happiness" />
        </Card>
      </div>

      <Card>
        <CardTitle subtitle="Average time spent in security and immigration, by hour — a proxy for queue length">
          Avg wait time by hour
        </CardTitle>
        <WaitTimeChart data={waitTime} />
      </Card>
    </div>
  );
}
