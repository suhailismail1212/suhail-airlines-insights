import { getDatasetMaxDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getJourneyFlows } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { JourneySankeyChart } from "@/components/charts/JourneySankeyChart";

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();
  const links = getJourneyFlows(range);

  return (
    <div>
      <PageHeader
        title="Journeys"
        subtitle="How passengers move between zones, from arrival to departure"
        range={range}
        maxDate={maxDate}
      />
      <Card>
        <CardTitle subtitle="Entry on the left, exit on the right — band width is visit volume">
          Passenger flow
        </CardTitle>
        <JourneySankeyChart links={links} />
      </Card>
    </div>
  );
}
