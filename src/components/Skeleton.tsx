import { clsx } from "clsx";

/** A single pulsing placeholder block. Compose these into per-page loading
 * skeletons that roughly match the real layout, so the transition from
 * skeleton to content doesn't jump around. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-surface-muted", className)} />;
}

export function SkeletonHeader() {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <SkeletonBlock className="h-9 w-72" />
    </div>
  );
}

export function SkeletonKpiRow({ count = 4 }: { count?: number }) {
  return (
    <div className={clsx("grid grid-cols-2 gap-3 mb-4", count === 3 ? "md:grid-cols-3" : "md:grid-cols-4")}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} className="h-[72px]" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <SkeletonBlock className="h-4 w-32 mb-2" />
      <SkeletonBlock className="h-3 w-48 mb-4" />
      <SkeletonBlock className={clsx("w-full", className ?? "h-56")} />
    </div>
  );
}
