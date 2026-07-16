import { Clock, PlaneTakeoff, Smile, Users } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import {
  getAgeBreakdown,
  getAnomalyAlerts,
  getForecast,
  getGenderBreakdown,
  getHappinessByZone,
  getKpiComparison,
  getKpiSummary,
  getZoneBreakdown,
  getZoneFootfall,
} from "@/lib/queries";
import { GENDER_COLORS, AGE_COLORS } from "@/lib/chartColors";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { ZoneBarChart } from "@/components/charts/ZoneBarChart";
import { AlertsPanel } from "@/components/AlertsPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { CompareToggle } from "@/components/CompareToggle";
import { ExportButton } from "@/components/ExportButton";
import { InsightCard } from "@/components/InsightCard";
import { DemographicsCard } from "@/components/DemographicsCard";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; compare?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const compare = params.compare === "1";
  const rangeQuery = new URLSearchParams({ start: range.start, end: range.end }).toString();

  const comparison = compare ? getKpiComparison(range) : null;
  const kpi = comparison ? comparison.current : getKpiSummary(range);
  const zoneBreakdown = getZoneBreakdown(range);
  const footfall = getZoneFootfall(range);
  const happinessByZone = getHappinessByZone(range);
  const alerts = getAnomalyAlerts(range).slice(0, 6);
  const forecast = getForecast(maxDate);
  const genderBreakdown = getGenderBreakdown(range);
  const ageBreakdown = getAgeBreakdown(range);
  const peakHourLabel = kpi.peakHour != null ? `${kpi.peakHour}:00` : "—";

  const totalFootfall = footfall.reduce((s, z) => s + z.entries, 0) || 1;
  const busiest = footfall[0];
  const happiest = happinessByZone[0];
  const needsAttention = happinessByZone[happinessByZone.length - 1];
  const crossZoneAvg = happinessByZone.reduce((s, z) => s + z.avgHappiness, 0) / (happinessByZone.length || 1);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard
          label="Total visits"
          value={kpi.totalVisits.toLocaleString()}
          icon={PlaneTakeoff}
          deltaPct={comparison?.deltaPct.totalVisits}
          href={`/zones?${rangeQuery}`}
        />
        <KpiCard
          label="Unique visitors"
          value={kpi.uniqueVisitors.toLocaleString()}
          icon={Users}
          deltaPct={comparison?.deltaPct.uniqueVisitors}
          href={`/at-risk?${rangeQuery}`}
        />
        <KpiCard
          label="Avg happiness"
          value={`${kpi.avgHappiness.toFixed(1)} / 10`}
          icon={Smile}
          deltaPct={comparison?.deltaPct.avgHappiness}
          href={`/visits-happiness?${rangeQuery}`}
        />
        <KpiCard label="Peak hour" value={peakHourLabel} icon={Clock} href={`/zones?${rangeQuery}`} />
      </div>

      {busiest && happiest && needsAttention && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InsightCard
            dotColorClass="bg-chart-olive"
            eyebrow="Footfall"
            statValue={`${((busiest.entries / totalFootfall) * 100).toFixed(0)}% of entries`}
            title={`${busiest.name} is the busiest zone`}
            description={`${busiest.name} accounts for ${((busiest.entries / totalFootfall) * 100).toFixed(0)}% of all zone entries (${busiest.entries.toLocaleString()}). Staffing and queue attention should start here.`}
            href={`/zones?${rangeQuery}`}
            linkLabel="See zone analytics"
          />
          <InsightCard
            dotColorClass="bg-chart-sage"
            eyebrow="Bright spot"
            statValue={`${happiest.avgHappiness.toFixed(1)}/10`}
            title={`${happiest.name} is the happiest zone`}
            description={`${happiest.name} leads at ${happiest.avgHappiness.toFixed(1)}/10 across the period — ${(happiest.avgHappiness - crossZoneAvg).toFixed(1)} pts ahead of the ${crossZoneAvg.toFixed(1)} cross-zone average.`}
            href={`/visits-happiness?${rangeQuery}`}
            linkLabel="See happiness by zone"
          />
          <InsightCard
            dotColorClass="bg-red-600"
            eyebrow="Zone attention"
            statValue={`${(crossZoneAvg - needsAttention.avgHappiness).toFixed(1)} pts below avg`}
            title={`${needsAttention.name} runs least happy`}
            description={`${needsAttention.name} averages ${needsAttention.avgHappiness.toFixed(1)}/10 — ${(crossZoneAvg - needsAttention.avgHappiness).toFixed(1)} pts under the ${crossZoneAvg.toFixed(1)} average. Worth a closer look.`}
            href={`/visits-happiness?${rangeQuery}`}
            linkLabel="See happiness by zone"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardTitle subtitle="Each visit counted once, under its primary zone — sums to total visits above. Click a bar for the full breakdown.">
              Visits by zone
            </CardTitle>
            <ZoneBarChart data={zoneBreakdown.map((z) => ({ name: z.name, visits: z.visits }))} />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DemographicsCard
              title="Visitors by gender"
              subtitle="Unique visitors in range"
              totalLabel="visitors"
              colors={GENDER_COLORS}
              rows={genderBreakdown.map((g) => ({ label: g.gender, count: g.count, percent: g.percent }))}
            />
            <DemographicsCard
              title="Visitors by age"
              subtitle="Unique visitors, by age band"
              totalLabel="visitors"
              colors={AGE_COLORS}
              rows={ageBreakdown.map((a) => ({ label: a.ageBand, count: a.count, percent: a.percent }))}
            />
          </div>

          <Card>
            <CardTitle subtitle="Trend-adjusted weekday averages from the last 4 weeks of data">
              Forecast &mdash; predicted busy days ahead
            </CardTitle>
            <ForecastPanel days={forecast} />
          </Card>
        </div>

        <Card>
          <CardTitle subtitle="Deviation vs each zone's own 14-day baseline">Alerts</CardTitle>
          <AlertsPanel alerts={alerts} rangeQuery={rangeQuery} />
        </Card>
      </div>
    </div>
  );
}
