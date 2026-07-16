import { SkeletonCard, SkeletonHeader } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SkeletonCard className="h-72" />
        <SkeletonCard className="h-72" />
      </div>
      <SkeletonCard className="h-64 mb-4" />
      <SkeletonCard className="h-64 mb-4" />
      <SkeletonCard className="h-56" />
    </div>
  );
}
