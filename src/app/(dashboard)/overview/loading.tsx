import { SkeletonBlock, SkeletonCard, SkeletonHeader, SkeletonKpiRow } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonKpiRow count={4} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} className="h-40" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard className="h-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard className="h-44" />
            <SkeletonCard className="h-44" />
          </div>
          <SkeletonCard className="h-40" />
        </div>
        <SkeletonCard className="h-96" />
      </div>
    </div>
  );
}
