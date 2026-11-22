import { getPostsFeed } from "@/app/actions/posts";
import { FeedList } from "@/components/feed/FeedList";
import { SearchBar } from "@/components/feed/SearchBar";
import { PostFilters } from "@/components/feed/PostFilters";
import { PostType, PostCategory, CampusLocation, PostStatus } from "@prisma/client";

export const revalidate = 60;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: {
    cursor?: string;
    type?: PostType;
    category?: PostCategory;
    location?: CampusLocation;
    status?: PostStatus;
    search?: string;
  };
}) {
  const result = await getPostsFeed({
    cursor: searchParams.cursor,
    type: searchParams.type,
    category: searchParams.category,
    location: searchParams.location,
    status: searchParams.status,
    search: searchParams.search,
    limit: 12,
  });

  return (
    <div className="w-full px-4 sm:px-[48px] lg:px-[64px] py-8 sm:py-10 space-y-8">
      {/* Search and Filters Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Campus Lost &amp; Found
            </h1>
            <p className="text-sm text-ink-soft mt-1">
              Browse reported items, search campus spots, or filter by category
            </p>
          </div>
          <SearchBar />
        </div>

        <div className="pt-2">
          <PostFilters />
        </div>
      </div>

      {/* Posts List with Cursor Pagination */}
      <FeedList
        initialPosts={result.posts as any}
        initialCursor={result.nextCursor}
        filters={{
          type: searchParams.type,
          category: searchParams.category,
          location: searchParams.location,
          status: searchParams.status,
          search: searchParams.search,
        }}
      />
    </div>
  );
}
