import { SkeletonCard, SkeletonHeader, SkeletonKpiRow } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonKpiRow count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SkeletonCard className="h-56" />
        <SkeletonCard className="h-56" />
      </div>
      <SkeletonCard className="h-52" />
    </div>
  );
}
