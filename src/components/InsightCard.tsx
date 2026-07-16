import Link from "next/link";
import { clsx } from "clsx";

export function InsightCard({
  dotColorClass,
  eyebrow,
  statValue,
  title,
  description,
  href,
  linkLabel,
}: {
  dotColorClass: string;
  eyebrow: string;
  statValue: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-surface border border-border rounded-xl p-5 transition-[border-color,box-shadow] duration-200 ease-out hover:border-red-500 hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
          <span className={clsx("w-1.5 h-1.5 rounded-full", dotColorClass)} />
          {eyebrow}
        </span>
        <span className="text-sm font-medium text-foreground/70 board-numerals">{statValue}</span>
      </div>
      <p className="text-sm font-medium text-foreground mb-1.5">{title}</p>
      <p className="text-xs text-foreground/50 leading-relaxed mb-3">{description}</p>
      <span className="text-xs font-medium text-red-600">{linkLabel} &rarr;</span>
    </Link>
  );
}
