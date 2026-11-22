"use client";

import React, { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { PostFeedItem } from "@/types";
import { getPostsFeed } from "@/app/actions/posts";
import { PostType, PostCategory, CampusLocation, PostStatus } from "@prisma/client";

export interface FeedListProps {
  initialPosts: PostFeedItem[];
  initialCursor: string | null;
  filters: {
    type?: PostType;
    category?: PostCategory;
    location?: CampusLocation;
    status?: PostStatus;
    search?: string;
  };
}

export function FeedList({ initialPosts, initialCursor, filters }: FeedListProps) {
  const [posts, setPosts] = useState<PostFeedItem[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state if initialPosts changes (e.g. filter change from server navigation)
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
  }, [initialPosts, initialCursor]);

  const handleLoadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const result = await getPostsFeed({
        cursor,
        limit: 12,
        ...filters,
      });

      setPosts((prev) => [...prev, ...(result.posts as any)]);
      setCursor(result.nextCursor);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Nothing pinned here yet"
        description="No lost or found items match your current criteria. Be the first to pin a note or try adjusting your search filters."
        action={{
          label: "Report an Item",
          href: "/posts/new",
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-4 pb-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
            className="px-8"
          >
            Load more items
          </Button>
        </div>
      )}
    </div>
  );
}
