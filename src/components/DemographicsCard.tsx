import { Card, CardTitle } from "./ui/Card";
import { DonutChart } from "./charts/DonutChart";

export function DemographicsCard({
  title,
  subtitle,
  colors,
  centerValue,
  centerLabel,
  rows,
}: {
  title: string;
  subtitle: string;
  colors: string[];
  centerValue: string;
  centerLabel: string;
  rows: { label: string; shareValue: number; displayText: string; percent: number }[];
}) {
  return (
    <Card>
      <CardTitle subtitle={subtitle}>{title}</CardTitle>
      <div className="flex items-center gap-6 flex-wrap">
        <DonutChart
          data={rows.map((r) => ({ name: r.label, value: r.shareValue, displayText: r.displayText, percent: r.percent }))}
          colors={colors}
          centerValue={centerValue}
          centerLabel={centerLabel}
        />
        <ul className="flex-1 min-w-[160px] space-y-2">
          {rows.map((r, i) => (
            <li key={r.label} className="flex items-center justify-between text-sm gap-3">
              <span className="flex items-center gap-2 text-foreground/70 capitalize">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                {r.label}
              </span>
              <span className="board-numerals text-foreground/50 text-xs whitespace-nowrap">
                {r.displayText} &middot; {r.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
