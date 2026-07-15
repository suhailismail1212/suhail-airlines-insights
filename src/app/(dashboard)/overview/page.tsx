import { Clock, PlaneTakeoff, Smile, Users } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getAnomalyAlerts, getForecast, getKpiComparison, getKpiSummary, getZoneBreakdown } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { ZoneBarChart } from "@/components/charts/ZoneBarChart";
import { AlertsPanel } from "@/components/AlertsPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { CompareToggle } from "@/components/CompareToggle";
import { ExportButton } from "@/components/ExportButton";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; compare?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const compare = params.compare === "1";

  const comparison = compare ? getKpiComparison(range) : null;
  const kpi = comparison ? comparison.current : getKpiSummary(range);
  const zoneBreakdown = getZoneBreakdown(range);
  const alerts = getAnomalyAlerts(range);
  const forecast = getForecast(maxDate);
  const peakHourLabel = kpi.peakHour != null ? `${kpi.peakHour}:00` : "—";

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Terminal footfall and passenger experience at a glance"
        range={range}
        maxDate={maxDate}
        actions={
          <>
            <CompareToggle enabled={compare} />
            <ExportButton
              data={{
                rangeLabel: `${range.start}_to_${range.end}`,
                kpis: [
                  { label: "Total visits", value: kpi.totalVisits.toLocaleString() },
                  { label: "Unique visitors", value: kpi.uniqueVisitors.toLocaleString() },
                  { label: "Avg happiness", value: `${kpi.avgHappiness.toFixed(1)} / 10` },
                  { label: "Peak hour", value: peakHourLabel },
                ],
                zoneRows: zoneBreakdown.map((z) => ({ name: z.name, visits: z.visits, percent: z.percent })),
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Total visits"
          value={kpi.totalVisits.toLocaleString()}
          icon={PlaneTakeoff}
          deltaPct={comparison?.deltaPct.totalVisits}
        />
        <KpiCard
          label="Unique visitors"
          value={kpi.uniqueVisitors.toLocaleString()}
          icon={Users}
          deltaPct={comparison?.deltaPct.uniqueVisitors}
        />
        <KpiCard
          label="Avg happiness"
          value={`${kpi.avgHappiness.toFixed(1)} / 10`}
          icon={Smile}
          deltaPct={comparison?.deltaPct.avgHappiness}
        />
        <KpiCard label="Peak hour" value={peakHourLabel} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardTitle subtitle="Each visit counted once, under its primary zone — sums to total visits above">
              Visits by zone
            </CardTitle>
            <ZoneBarChart data={zoneBreakdown.map((z) => ({ name: z.name, visits: z.visits }))} />
          </Card>

          <Card>
            <CardTitle subtitle="Trend-adjusted weekday averages from the last 4 weeks of data">
              Forecast &mdash; predicted busy days ahead
            </CardTitle>
            <ForecastPanel days={forecast} />
          </Card>
        </div>

        <Card>
          <CardTitle subtitle="Deviation vs each zone's own 14-day baseline">Alerts</CardTitle>
          <AlertsPanel alerts={alerts} />
        </Card>
      </div>
    </div>
  );
}
