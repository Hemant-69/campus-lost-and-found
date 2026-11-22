import React from "react";
import { PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function NotificationsLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <PageHeaderSkeleton />

      <div className="divide-y-2.5 divide-ink bg-surface rounded-card border-2.5 border-ink shadow-hard-card overflow-hidden animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 sm:p-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-[#EADFC8] rounded w-1/3" />
              <div className="h-3 bg-[#EADFC8] rounded w-16" />
            </div>
            <div className="h-3.5 bg-[#EADFC8] rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
