import { AlertTriangle, Clock } from "lucide-react";
import { getDatasetMaxDate, formatDisplayDate } from "@/lib/dates";
import { resolveRange } from "@/lib/searchParams";
import { getAtRiskVisitors, getKpiSummary } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";

function shortId(id: string): string {
  return `PSGR-${id.slice(0, 8).toUpperCase()}`;
}

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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-foreground/50 border-b border-border">
                <th className="py-2 pr-4 font-normal">Passenger ID</th>
                <th className="py-2 pr-4 font-normal">Visits</th>
                <th className="py-2 pr-4 font-normal">Avg mood</th>
                <th className="py-2 pr-4 font-normal">Lowest mood</th>
                <th className="py-2 pr-4 font-normal">Longest visit</th>
                <th className="py-2 pr-4 font-normal">Last seen</th>
                <th className="py-2 pr-4 font-normal">Flags</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((v) => (
                <tr key={v.visitorId} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-xs text-foreground/70">{shortId(v.visitorId)}</td>
                  <td className="py-2.5 pr-4 board-numerals">{v.visitCount}</td>
                  <td className="py-2.5 pr-4 board-numerals">{v.avgHappiness.toFixed(1)}</td>
                  <td className="py-2.5 pr-4 board-numerals">{v.minHappiness.toFixed(1)}</td>
                  <td className="py-2.5 pr-4 board-numerals">{v.maxDurationMinutes} min</td>
                  <td className="py-2.5 pr-4 text-foreground/60">{formatDisplayDate(v.lastVisitDate)}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      {v.lowHappinessFlag && (
                        <span title="Low happiness" className="text-red-600">
                          <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
                        </span>
                      )}
                      {v.longDurationFlag && (
                        <span title="Long total visit duration" className="text-chart-gold">
                          <Clock className="w-4 h-4" strokeWidth={1.75} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-foreground/40">
                    No flagged passengers in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
