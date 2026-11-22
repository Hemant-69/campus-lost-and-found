"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { moderatePost } from "@/app/actions/admin";

export function AdminPostActionButtons({
  postId,
  isAutoHidden,
}: {
  postId: string;
  isAutoHidden: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTakedown = async () => {
    const reason = prompt("Reason for removing/taking down this post:");
    if (!reason) return;

    setIsLoading(true);
    await moderatePost({ postId, action: "TAKEDOWN", reason });
    setIsLoading(false);
    router.refresh();
  };

  const handleRestore = async () => {
    setIsLoading(true);
    await moderatePost({ postId, action: "RESTORE" });
    setIsLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this post?")) {
      setIsLoading(true);
      await moderatePost({ postId, action: "DELETE" });
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {isAutoHidden ? (
        <Button
          variant="outline"
          size="sm"
          isLoading={isLoading}
          onClick={handleRestore}
          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        >
          Restore
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          isLoading={isLoading}
          onClick={handleTakedown}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          Takedown
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        isLoading={isLoading}
        onClick={handleDelete}
        className="text-slate-400 hover:text-rose-700"
      >
        Delete
      </Button>
    </div>
  );
}
