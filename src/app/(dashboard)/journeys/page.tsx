import { Layers, Clock3, PlaneTakeoff, AlertTriangle } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getJourneyFlows, getJourneyStats, type TimeOfDay } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { JourneySankeyChart } from "@/components/charts/JourneySankeyChart";
import { KpiCard } from "@/components/KpiCard";
import { TimeOfDayFilter } from "@/components/TimeOfDayFilter";

const VALID_TOD: TimeOfDay[] = ["all", "morning", "afternoon", "evening"];

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; tod?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const tod: TimeOfDay = VALID_TOD.includes(params.tod as TimeOfDay) ? (params.tod as TimeOfDay) : "all";
  const rangeQuery = new URLSearchParams({ start: range.start, end: range.end }).toString();

  const links = getJourneyFlows(range, tod);
  const stats = getJourneyStats(range, tod);

  return (
    <div>
      <PageHeader
        title="Journeys"
        subtitle="How passengers move between zones, from arrival to departure"
        range={range}
        maxDate={maxDate}
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-foreground/50">Time of day</span>
        <TimeOfDayFilter value={tod} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Avg zones / journey" value={stats.avgZonesPerJourney.toFixed(1)} icon={Layers} />
        <KpiCard label="Avg total dwell" value={`${Math.round(stats.avgTotalDwellMinutes)} min`} icon={Clock3} />
        <KpiCard label="Departure flow share" value={`${stats.departureSharePct.toFixed(0)}%`} icon={PlaneTakeoff} />
        <KpiCard
          label="Exceed 120-min dwell"
          value={`${stats.longJourneySharePct.toFixed(1)}%`}
          icon={AlertTriangle}
          href={`/at-risk?${rangeQuery}`}
        />
      </div>

      <Card>
        <CardTitle subtitle="Entry on the left, exit on the right — band width is visit volume. Hover a flow to trace it to the next zone.">
          Passenger flow
        </CardTitle>
        <JourneySankeyChart links={links} />
      </Card>
    </div>
  );
}
