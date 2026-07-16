import Link from "next/link";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber, type NumberFormat } from "./AnimatedNumber";

export function KpiCard({
  label,
  value,
  format,
  icon: Icon,
  deltaPct,
  href,
}: {
  label: string;
  value: number | string;
  format?: NumberFormat;
  icon?: LucideIcon;
  deltaPct?: number | null;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-foreground/50">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-foreground/30" strokeWidth={1.75} />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-medium board-numerals">
          {typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}
        </span>
        {deltaPct != null && (
          <span
            className={clsx(
              "text-xs font-medium mb-0.5",
              deltaPct > 0 ? "text-chart-sage" : deltaPct < 0 ? "text-red-600" : "text-foreground/40"
            )}
          >
            {deltaPct > 0 ? "+" : ""}
            {deltaPct.toFixed(1)}%
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block bg-surface-muted rounded-xl p-4 transition-[background-color,box-shadow,color] duration-200 ease-out hover:bg-surface hover:ring-1 hover:ring-red-500 hover:shadow-sm"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-surface-muted rounded-xl p-4 transition-shadow duration-200 ease-out hover:shadow-sm">
      {content}
    </div>
  );
}
