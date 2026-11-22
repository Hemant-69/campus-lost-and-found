"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { formatISTDate } from "@/lib/date";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: countData, mutate: mutateCount } = useSWR<{ unreadCount: number }>(
    "/api/notifications/count",
    fetcher,
    {
      refreshInterval: 25000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    }
  );

  const { data: notificationList, mutate: mutateList } = useSWR<any[]>(
    isOpen ? "/api/notifications" : null,
    fetcher
  );

  const unreadCount = countData?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    mutateCount({ unreadCount: 0 }, false);
    if (mutateList) mutateList();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border-2 border-ink bg-surface text-ink hover:bg-yellow active:translate-x-[1px] active:translate-y-[1px] shadow-hard-btn transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 stroke-[2.5]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold text-ink bg-yellow border-1.5 border-ink rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface rounded-card border-2.5 border-ink shadow-hard-card z-50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2.5 border-ink bg-paper">
              <span className="font-serif font-bold text-ink text-base">Notices</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-coral transition"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-ink/10">
              {!notificationList ? (
                <div className="p-6 text-center text-xs text-ink-soft">Loading notices...</div>
              ) : notificationList.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-soft">No new notices on your board.</div>
              ) : (
                notificationList.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || "/notifications"}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 transition text-xs ${
                      !n.isRead ? "bg-note-yellow/50 hover:bg-note-yellow" : "bg-surface hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-ink">{n.title}</span>
                      <span className="text-[10px] text-ink-soft shrink-0">
                        {formatISTDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-ink-soft line-clamp-2">{n.message}</p>
                  </Link>
                ))
              )}
            </div>

            <div className="p-3 bg-paper border-t-2 border-ink text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-ink hover:text-coral transition"
              >
                View all notifications &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
