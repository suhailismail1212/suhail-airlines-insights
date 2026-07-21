import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import {
  getAgeBreakdown,
  getAnomalyAlerts,
  getForecast,
  getGenderBreakdown,
  getHappinessByAge,
  getHappinessByGender,
  getHappinessByZone,
  getHappinessTrend,
  getKpiComparison,
  getKpiSummary,
  getNewVsRepeatVisitors,
  getZoneBreakdown,
  getZoneFootfall,
} from "@/lib/queries";
import { GENDER_COLORS, AGE_COLORS } from "@/lib/chartColors";
import { sentimentColor, ZONE_COLOR_CYCLE } from "@/lib/colorScale";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Card, CardTitle } from "@/components/ui/Card";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { HappinessTrendChart } from "@/components/charts/HappinessTrendChart";
import { ZoneBreakdownList } from "@/components/ZoneBreakdownList";
import { LensToggle, type Lens } from "@/components/LensToggle";
import { AlertsPanel } from "@/components/AlertsPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { CompareToggle } from "@/components/CompareToggle";
import { ExportButton } from "@/components/ExportButton";
import { InsightCard } from "@/components/InsightCard";
import { DemographicsCard } from "@/components/DemographicsCard";

function formatCompact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; compare?: string; lens?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const compare = params.compare === "1";
  const lens: Lens = params.lens === "happiness" ? "happiness" : "visits";
  const rangeQuery = new URLSearchParams({ start: range.start, end: range.end }).toString();

  const comparison = compare ? getKpiComparison(range) : null;
  const kpi = comparison ? comparison.current : getKpiSummary(range);
  const newRepeat = getNewVsRepeatVisitors(range);
  const zoneBreakdown = getZoneBreakdown(range);
  const footfall = getZoneFootfall(range);
  const happinessByZone = getHappinessByZone(range);
  const happinessTrend = getHappinessTrend(range);
  const alerts = getAnomalyAlerts(range).slice(0, 6);
  const forecast = getForecast(maxDate);
  const peakHourLabel = kpi.peakHour != null ? `${kpi.peakHour}:00` : "—";

  const totalFootfall = footfall.reduce((s, z) => s + z.entries, 0);
  const maxFootfall = Math.max(...footfall.map((z) => z.entries), 1);
  const busiest = footfall[0];
  const happiest = happinessByZone[0];
  const needsAttention = happinessByZone[happinessByZone.length - 1];
  const crossZoneAvg = happinessByZone.reduce((s, z) => s + z.avgHappiness, 0) / (happinessByZone.length || 1);
  const totalFootfallForShare = totalFootfall || 1;

  const trendPeak = happinessTrend.reduce((max, p) => Math.max(max, p.avgHappiness), 0);
  const trendLowest = happinessTrend.reduce((min, p) => Math.min(min, p.avgHappiness), 10);

  const genderBreakdown = getGenderBreakdown(range);
  const ageBreakdown = getAgeBreakdown(range);
  const genderHappiness = lens === "happiness" ? getHappinessByGender(range) : [];
  const ageHappiness = lens === "happiness" ? getHappinessByAge(range) : [];
  const genderSamples = genderHappiness.reduce((s, g) => s + g.samples, 0) || 1;
  const ageSamples = ageHappiness.reduce((s, a) => s + a.samples, 0) || 1;

  const zoneListRows =
    lens === "visits"
      ? footfall.map((z, i) => ({
          name: z.name,
          widthPercent: (z.entries / maxFootfall) * 100,
          valueLabel: z.entries.toLocaleString(),
          color: ZONE_COLOR_CYCLE[i % ZONE_COLOR_CYCLE.length],
        }))
      : happinessByZone.map((z) => ({
          name: z.name,
          widthPercent: (z.avgHappiness / 10) * 100,
          valueLabel: `${z.avgHappiness.toFixed(1)}/10`,
          color: sentimentColor(z.avgHappiness),
          sublabel: `${formatCompact(z.samples)} happiness checks`,
        }));

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
                  { label: "Unique people", value: newRepeat.total.toLocaleString() },
                  { label: "New visitors", value: newRepeat.newCount.toLocaleString() },
                  { label: "Repeat visitors", value: newRepeat.repeatCount.toLocaleString() },
                  { label: "Visits – footfall", value: totalFootfall.toLocaleString() },
                  { label: "Visitor mood", value: `${kpi.avgHappiness.toFixed(1)} / 10` },
                  { label: "Peak hour", value: peakHourLabel },
                ],
                zoneRows: zoneBreakdown.map((z) => ({ name: z.name, visits: z.visits, percent: z.percent })),
              }}
            />
          </>
        }
      />

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <LensToggle lens={lens} />
        <span className="text-xs text-foreground/40">
          {lens === "visits" ? "Visits lens — footfall & movement" : "Happiness lens — colour maps to sentiment"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <span className="text-xs text-foreground/50">Unique people</span>
          <div className="mt-2 text-2xl font-medium board-numerals text-red-300">
            <AnimatedNumber value={newRepeat.total} />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-foreground/60 board-numerals">
            <span>{newRepeat.newCount.toLocaleString()} new</span>
            <span className="text-foreground/30">+</span>
            <span>{newRepeat.repeatCount.toLocaleString()} repeat</span>
          </div>
          <p className="text-[11px] text-foreground/40 mt-3 leading-relaxed">
            One person, counted once — even across many visits
          </p>
        </Card>

        <Card>
          <span className="text-xs text-foreground/50">Visits &ndash; footfall</span>
          <div className="mt-2 text-2xl font-medium board-numerals text-red-300">
            <AnimatedNumber value={totalFootfall} />
          </div>
          <p className="text-[11px] text-foreground/40 mt-3 leading-relaxed">
            Not unique — one person entering three zones counts as three visits
          </p>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <span className="text-xs text-foreground/50 self-start mb-1">Visitor mood</span>
          <GaugeChart value={kpi.avgHappiness} max={10} />
        </Card>
      </div>

      {busiest && happiest && needsAttention && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InsightCard
            dotColorClass="bg-red-600"
            eyebrow="Zone attention"
            statValue={`${(crossZoneAvg - needsAttention.avgHappiness).toFixed(1)} pts below avg`}
            title={`${needsAttention.name} runs least happy`}
            description={`${needsAttention.name} averages ${needsAttention.avgHappiness.toFixed(1)}/10 — ${(crossZoneAvg - needsAttention.avgHappiness).toFixed(1)} pts under the ${crossZoneAvg.toFixed(1)} average. Worth a closer look.`}
            href={`/visits-happiness?${rangeQuery}`}
            linkLabel="See happiness by zone"
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
            dotColorClass="bg-chart-olive"
            eyebrow="Footfall"
            statValue={`${((busiest.entries / totalFootfallForShare) * 100).toFixed(0)}% of entries`}
            title={`${busiest.name} is the busiest zone`}
            description={`${busiest.name} accounts for ${((busiest.entries / totalFootfallForShare) * 100).toFixed(0)}% of all zone entries (${busiest.entries.toLocaleString()}). Staffing and queue attention should start here.`}
            href={`/zones?${rangeQuery}`}
            linkLabel="See zone analytics"
          />
        </div>
      )}

      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-1">
          <CardTitle subtitle="Daily average across the selected period">Visitor happiness over time</CardTitle>
          <span className="text-xl font-medium board-numerals text-red-300 shrink-0">
            <AnimatedNumber value={kpi.avgHappiness} format={{ decimals: 1, suffix: "/10" }} />
          </span>
        </div>
        <HappinessTrendChart data={happinessTrend} />
        <div className="flex items-center gap-8 mt-4 pt-4 border-t border-border">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-foreground/40">Average</span>
            <span className="text-sm font-medium board-numerals">{kpi.avgHappiness.toFixed(1)}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-foreground/40">Peak</span>
            <span className="text-sm font-medium board-numerals">{trendPeak.toFixed(1)}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-foreground/40">Lowest</span>
            <span className="text-sm font-medium board-numerals">{trendLowest.toFixed(1)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {lens === "visits" ? (
          <>
            <DemographicsCard
              title="Total visitors by gender"
              subtitle="Unique visitors in range"
              colors={GENDER_COLORS}
              centerValue={newRepeat.total.toLocaleString()}
              centerLabel="Visitors"
              rows={genderBreakdown.map((g) => ({
                label: g.gender,
                shareValue: g.count,
                displayText: g.count.toLocaleString(),
                percent: g.percent,
              }))}
            />
            <DemographicsCard
              title="Total visitors by age"
              subtitle="Unique visitors, by age band"
              colors={AGE_COLORS}
              centerValue={newRepeat.total.toLocaleString()}
              centerLabel="Visitors"
              rows={ageBreakdown.map((a) => ({
                label: a.ageBand,
                shareValue: a.count,
                displayText: a.count.toLocaleString(),
                percent: a.percent,
              }))}
            />
          </>
        ) : (
          <>
            <DemographicsCard
              title="Happiness by gender"
              subtitle="Area = visitor share, colour = sentiment"
              colors={genderHappiness.map((g) => sentimentColor(g.avgHappiness))}
              centerValue={`${kpi.avgHappiness.toFixed(1)}/10`}
              centerLabel="Happiness"
              rows={genderHappiness.map((g) => ({
                label: g.gender,
                shareValue: g.samples,
                displayText: `${g.avgHappiness.toFixed(1)}/10`,
                percent: (g.samples / genderSamples) * 100,
              }))}
            />
            <DemographicsCard
              title="Happiness by age"
              subtitle="Area = visitor share, colour = sentiment"
              colors={ageHappiness.map((a) => sentimentColor(a.avgHappiness))}
              centerValue={`${kpi.avgHappiness.toFixed(1)}/10`}
              centerLabel="Happiness"
              rows={ageHappiness.map((a) => ({
                label: a.ageBand,
                shareValue: a.samples,
                displayText: `${a.avgHappiness.toFixed(1)}/10`,
                percent: (a.samples / ageSamples) * 100,
              }))}
            />
          </>
        )}
      </div>

      <Card className="mb-4">
        <CardTitle
          subtitle={
            lens === "visits"
              ? "Raw zone entries — a visitor passing through several zones counts once per zone"
              : "Average happiness score recorded per zone, with sample size"
          }
        >
          {lens === "visits" ? "Footfall by zone" : "Happiness by zone"}
        </CardTitle>
        <ZoneBreakdownList rows={zoneListRows} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardTitle subtitle="Trend-adjusted weekday averages from the last 4 weeks of data">
            Forecast &mdash; predicted busy days ahead
          </CardTitle>
          <ForecastPanel days={forecast} />
        </Card>

        <Card>
          <CardTitle subtitle="Deviation vs each zone's own 14-day baseline">Alerts</CardTitle>
          <AlertsPanel alerts={alerts} rangeQuery={rangeQuery} />
        </Card>
      </div>
    </div>
  );
}
