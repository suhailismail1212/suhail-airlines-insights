import { AlertTriangle } from "lucide-react";
import { getDatasetMaxDate, formatDisplayDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getAtRiskVisitors, getKpiSummary } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { AtRiskTable } from "@/components/AtRiskTable";

export default async function AtRiskPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);
  const maxDate = getDatasetMaxDate();

  const atRisk = getAtRiskVisitors(range);
  const kpi = getKpiSummary(range);
  const sharePct = kpi.uniqueVisitors ? (atRisk.length / kpi.uniqueVisitors) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="At-risk passengers"
        subtitle={`Flagged as of ${formatDisplayDate(range.end)} — persistent anonymous ID, reused across a passenger's visits`}
        range={range}
        maxDate={maxDate}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Flagged passengers" value={atRisk.length.toLocaleString()} icon={AlertTriangle} />
        <KpiCard label="Share of visitors" value={`${sharePct.toFixed(1)}%`} />
        <KpiCard label="Low mood threshold" value="≤ 4.5 / 10" />
      </div>

      <Card>
        <CardTitle subtitle="Low avg happiness (≤4.5) or a visit with ≥120 min total terminal time, within the selected range">
          Flagged passengers
        </CardTitle>
        <AtRiskTable rows={atRisk} />
      </Card>
    </div>
  );
}
