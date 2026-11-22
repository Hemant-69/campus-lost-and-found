import React from "react";
import { PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function MessagesLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-6">
      <PageHeaderSkeleton />

      <div className="bg-surface rounded-card border-2.5 border-ink shadow-hard-card divide-y-2 divide-paper overflow-hidden animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EADFC8] border-2 border-ink/20 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-[#EADFC8] rounded w-1/4" />
                <div className="h-3 bg-[#EADFC8] rounded w-12" />
              </div>
              <div className="h-3.5 bg-[#EADFC8] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
