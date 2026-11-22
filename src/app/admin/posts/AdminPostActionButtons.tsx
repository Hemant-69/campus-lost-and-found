"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PromptModal } from "@/components/ui/PromptModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
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
  const [isTakedownOpen, setIsTakedownOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleTakedownConfirm = async (reason: string) => {
    setIsLoading(true);
    await moderatePost({ postId, action: "TAKEDOWN", reason });
    setIsLoading(false);
    setIsTakedownOpen(false);
    router.refresh();
  };

  const handleRestore = async () => {
    setIsLoading(true);
    await moderatePost({ postId, action: "RESTORE" });
    setIsLoading(false);
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    await moderatePost({ postId, action: "DELETE" });
    setIsLoading(false);
    setIsDeleteOpen(false);
    router.refresh();
  };

  return (
    <>
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
            disabled={isLoading}
            onClick={() => setIsTakedownOpen(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Takedown
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsDeleteOpen(true)}
          className="text-slate-400 hover:text-rose-700"
        >
          Delete
        </Button>
      </div>

      {/* Takedown Post Prompt Modal */}
      <PromptModal
        isOpen={isTakedownOpen}
        onClose={() => setIsTakedownOpen(false)}
        onSubmit={handleTakedownConfirm}
        title="Takedown Post"
        description="Provide a moderation reason for removing this post from the public campus notice board."
        label="Reason for Takedown"
        placeholder="e.g. Duplicate post, prohibited items, inaccurate photos..."
        confirmText="Confirm Takedown"
        variant="danger"
        required
        isLoading={isLoading}
      />

      {/* Delete Post Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Post Permanently"
        description="Are you sure you want to permanently delete this post? All associated claims, comments, and uploaded images will be permanently removed. This cannot be undone."
        confirmText="Delete Post"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
