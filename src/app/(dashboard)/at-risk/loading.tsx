import { SkeletonCard, SkeletonHeader, SkeletonKpiRow } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonKpiRow count={3} />
      <SkeletonCard className="h-[420px]" />
    </div>
  );
}
