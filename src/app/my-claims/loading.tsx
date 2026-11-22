import React from "react";
import { PageHeaderSkeleton, ListItemSkeleton } from "@/components/ui/Skeletons";

export default function MyClaimsLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <PageHeaderSkeleton />

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-surface rounded-card border-2.5 border-ink shadow-hard-card animate-pulse space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-[#EADFC8] rounded w-1/3" />
                <div className="h-3.5 bg-[#EADFC8] rounded w-1/4" />
              </div>
              <div className="h-6 bg-[#EADFC8] rounded-full w-20" />
            </div>
            <div className="h-12 bg-[#EADFC8] rounded-input w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
