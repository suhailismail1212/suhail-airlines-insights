import { SkeletonBlock, SkeletonCard, SkeletonHeader, SkeletonKpiRow } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-8 w-64" />
      </div>
      <SkeletonKpiRow count={4} />
      <SkeletonCard className="h-[480px]" />
    </div>
  );
}
