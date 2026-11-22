import React from "react";
import { PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function ProfileLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8 animate-pulse">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface rounded-card border-2.5 border-ink shadow-hard-card p-6 space-y-4">
          <div className="h-6 bg-[#EADFC8] rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-10 bg-[#EADFC8] rounded" />
            <div className="h-10 bg-[#EADFC8] rounded" />
            <div className="h-10 bg-[#EADFC8] rounded" />
            <div className="h-10 bg-[#EADFC8] rounded" />
          </div>
        </div>

        <div className="bg-surface rounded-card border-2.5 border-ink shadow-hard-card p-6 space-y-4">
          <div className="h-6 bg-[#EADFC8] rounded w-1/2" />
          <div className="aspect-[4/3] bg-[#EADFC8] rounded-input border-2 border-ink/20" />
        </div>
      </div>
    </div>
  );
}
