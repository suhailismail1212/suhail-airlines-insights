import { Suspense } from "react";
import { DateRangePicker } from "./DateRangePicker";

export function PageHeader({
  title,
  subtitle,
  range,
  maxDate,
  actions,
}: {
  title: string;
  subtitle?: string;
  range: { start: string; end: string };
  maxDate: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-foreground/50 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {actions}
        <Suspense fallback={<div className="h-9 w-64" />}>
          <DateRangePicker start={range.start} end={range.end} maxDate={maxDate} />
        </Suspense>
      </div>
    </div>
  );
}
