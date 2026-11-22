import { PostCardSkeleton } from "@/components/ui/Skeletons";

export default function PostsLoading() {
  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-10 space-y-8">
      <div className="h-10 bg-surface rounded-card border-2.5 border-ink w-48 animate-pulse shadow-hard" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <PostCardSkeleton key={n} />
        ))}
      </div>
    </div>
  );
}
