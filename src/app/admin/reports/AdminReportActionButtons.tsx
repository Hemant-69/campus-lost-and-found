"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { resolveReport, moderatePost, toggleUserDisabled } from "@/app/actions/admin";
import { deleteComment } from "@/app/actions/comments";

export function AdminReportActionButtons({
  reportId,
  targetType,
  postId,
  commentId,
  reportedUserId,
}: {
  reportId: string;
  targetType: "POST" | "COMMENT" | "USER";
  postId?: string;
  commentId?: string;
  reportedUserId?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDismiss = async () => {
    const note = prompt("Admin note for dismissing report:", "No policy violation found");
    if (!note) return;

    setIsLoading(true);
    await resolveReport({
      reportId,
      actionTaken: `Dismissed: ${note}`,
      status: "REVIEWED",
    });
    setIsLoading(false);
    router.refresh();
  };

  const handleAction = async () => {
    const note = prompt("Action details and moderation note:");
    if (!note) return;

    setIsLoading(true);

    if (targetType === "POST" && postId) {
      await moderatePost({ postId, action: "TAKEDOWN", reason: note });
    } else if (targetType === "COMMENT" && commentId) {
      await deleteComment(commentId);
    } else if (targetType === "USER" && reportedUserId) {
      await toggleUserDisabled(reportedUserId, true, note);
    }

    await resolveReport({
      reportId,
      actionTaken: note,
      status: "ACTIONED",
    });

    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        isLoading={isLoading}
        onClick={handleDismiss}
      >
        Dismiss
      </Button>
      <Button
        variant="danger"
        size="sm"
        isLoading={isLoading}
        onClick={handleAction}
      >
        Take Action
      </Button>
    </div>
  );
}
