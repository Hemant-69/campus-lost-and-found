import React from "react";
import { PostCardSkeleton, PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function MyPostsLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeaderSkeleton />
        <div className="h-10 bg-[#EADFC8] rounded-full w-32 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
