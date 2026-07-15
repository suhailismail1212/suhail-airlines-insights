import { clsx } from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("bg-surface border border-border rounded-xl p-5", className)}>{children}</div>
  );
}

export function CardTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-medium text-foreground">{children}</h2>
      {subtitle && <p className="text-xs text-foreground/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}
