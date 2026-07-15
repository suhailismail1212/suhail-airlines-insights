import { Smile } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getHappinessByZone, getHappinessTrend, getKpiSummary } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { HappinessTrendChart } from "@/components/charts/HappinessTrendChart";
import { ZoneHappinessBarChart } from "@/components/charts/ZoneHappinessBarChart";
import { KpiCard } from "@/components/KpiCard";

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
        <KpiCard label="Total visits" value={kpi.totalVisits.toLocaleString()} icon={Smile} />
        <KpiCard label="Avg happiness" value={`${kpi.avgHappiness.toFixed(1)} / 10`} />
        <KpiCard label="Happiest zone" value={best ? best.name : "—"} />
        <KpiCard label="Lowest scoring zone" value={worst ? worst.name : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle subtitle="Daily average happiness score across all visits (1-10)">Happiness trend</CardTitle>
          <HappinessTrendChart data={trend.map((t) => ({ date: t.date, avgHappiness: t.avgHappiness }))} />
        </Card>
        <Card>
          <CardTitle subtitle="Average score recorded on each pass through a zone">Happiness by zone</CardTitle>
          <ZoneHappinessBarChart data={byZone.map((z) => ({ name: z.name, avgHappiness: z.avgHappiness }))} />
        </Card>
      </div>
    </div>
  );
}
