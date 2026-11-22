import React from "react";
import {
  PageHeaderSkeleton,
  MetricCardSkeleton,
  AdminTableSkeleton,
} from "@/components/ui/Skeletons";

export default function AdminLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-8">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Table / Content Skeleton */}
      <AdminTableSkeleton rows={6} />
    </div>
  );
}
