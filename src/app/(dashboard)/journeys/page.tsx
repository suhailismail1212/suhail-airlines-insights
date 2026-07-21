import { Layers, Clock3, PlaneTakeoff, AlertTriangle } from "lucide-react";
import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getJourneyFlows, getJourneyStats, type TimeOfDay } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { JourneySankeyChart } from "@/components/charts/JourneySankeyChart";
import { KpiCard } from "@/components/KpiCard";
import { TimeOfDayFilter } from "@/components/TimeOfDayFilter";
import { LensToggle, type Lens } from "@/components/LensToggle";

const VALID_TOD: TimeOfDay[] = ["all", "morning", "afternoon", "evening"];

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; tod?: string; lens?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const tod: TimeOfDay = VALID_TOD.includes(params.tod as TimeOfDay) ? (params.tod as TimeOfDay) : "all";
  const lens: Lens = params.lens === "happiness" ? "happiness" : "visits";
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

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <LensToggle lens={lens} />
        <span className="text-xs text-foreground/40">
          {lens === "visits" ? "Visits lens — footfall & movement" : "Happiness lens — colour maps to sentiment"}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-foreground/50">Time of day</span>
        <TimeOfDayFilter value={tod} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Avg zones / journey" value={stats.avgZonesPerJourney} format={{ decimals: 1 }} icon={Layers} />
        <KpiCard
          label="Avg total dwell"
          value={stats.avgTotalDwellMinutes}
          format={{ suffix: " min" }}
          icon={Clock3}
        />
        <KpiCard
          label="Departure flow share"
          value={stats.departureSharePct}
          format={{ suffix: "%" }}
          icon={PlaneTakeoff}
        />
        <KpiCard
          label="Exceed 120-min dwell"
          value={stats.longJourneySharePct}
          format={{ decimals: 1, suffix: "%" }}
          icon={AlertTriangle}
          href={`/at-risk?${rangeQuery}`}
        />
      </div>

      <Card>
        <CardTitle
          subtitle={
            lens === "visits"
              ? "Entry on the left, exit on the right — band width is visit volume. Hover a flow to trace it to the next zone."
              : "Entry on the left, exit on the right — colour maps to sentiment. Hover a flow to trace it to the next zone."
          }
        >
          Passenger flow
        </CardTitle>
        <JourneySankeyChart links={links} mode={lens} />
      </Card>
    </div>
  );
}
