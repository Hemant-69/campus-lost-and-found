"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { SafeImage } from "@/components/image/SafeImage";
import { EmptyState } from "@/components/ui/EmptyState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InboxList({ currentUserId }: { currentUserId: string }) {
  // SWR polling every 10 seconds; back off when window is hidden
  const { data: conversations, error } = useSWR<any[]>(
    "/api/conversations",
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    }
  );

  if (!conversations && !error) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-surface rounded-card border-2.5 border-ink animate-pulse" />
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <EmptyState
        title="Your inbox is empty"
        description="Conversations are created when someone reaches out on your post or requests more information about an ownership claim."
        action={{
          label: "Browse Found Items",
          href: "/posts",
        }}
      />
    );
  }

  return (
    <div className="divide-y-2.5 divide-ink bg-surface rounded-card border-2.5 border-ink shadow-hard-card overflow-hidden">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/messages/${conv.id}`}
          className={`flex items-center gap-4 p-5 hover:bg-paper/60 transition ${
            conv.unreadCount > 0 ? "bg-note-yellow" : ""
          }`}
        >
          {/* Post Thumbnail */}
          <div className="w-14 h-14 rounded-input overflow-hidden shrink-0 border-2 border-ink bg-paper shadow-hard-btn">
            <SafeImage
              imageId={conv.postThumbnailImageId}
              variant="thumb"
              alt={conv.postTitle}
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif font-bold text-base text-ink truncate">
                {conv.otherUser.name}
              </span>
              <span className="text-xs text-ink-soft shrink-0">
                {new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <p className="text-xs text-coral font-bold truncate">
              Re: {conv.postTitle}
            </p>

            <p className="text-xs text-ink-soft truncate font-medium">
              {conv.lastMessage ? (
                <span>
                  {conv.lastMessage.isFromMe && "You: "}
                  {conv.lastMessage.content}
                </span>
              ) : (
                <span className="italic">No messages yet</span>
              )}
            </p>
          </div>

          {conv.unreadCount > 0 && (
            <span className="w-7 h-7 rounded-full bg-yellow border-2 border-ink text-ink font-bold text-xs flex items-center justify-center shrink-0 shadow-hard-btn">
              {conv.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
