import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  deltaPct,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  deltaPct?: number | null;
}) {
  return (
    <div className="bg-surface-muted rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-foreground/50">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-foreground/30" strokeWidth={1.75} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-medium board-numerals">{value}</span>
        {deltaPct != null && (
          <span
            className={clsx(
              "text-xs font-medium mb-0.5",
              deltaPct > 0 ? "text-chart-green" : deltaPct < 0 ? "text-crimson-500" : "text-foreground/40"
            )}
          >
            {deltaPct > 0 ? "+" : ""}
            {deltaPct.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
