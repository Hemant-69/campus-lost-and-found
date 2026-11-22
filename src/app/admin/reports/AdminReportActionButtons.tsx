"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PromptModal } from "@/components/ui/PromptModal";
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
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const getActionDescription = () => {
    switch (targetType) {
      case "POST":
        return "This will take down the reported post from the public campus board and record this resolution in the audit log.";
      case "COMMENT":
        return "This will permanently delete the reported comment and mark the report as actioned.";
      case "USER":
        return "This will disable the reported student's account and revoke active platform privileges.";
      default:
        return "Apply administrative action to resolve this community report.";
    }
  };

  const handleDismissConfirm = async (note: string) => {
    setIsLoading(true);
    await resolveReport({
      reportId,
      actionTaken: `Dismissed: ${note || "No policy violation found"}`,
      status: "REVIEWED",
    });
    setIsLoading(false);
    setIsDismissOpen(false);
    router.refresh();
  };

  const handleActionConfirm = async (note: string) => {
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
    setIsActionOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsDismissOpen(true)}
        >
          Dismiss
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsActionOpen(true)}
        >
          Take Action
        </Button>
      </div>

      {/* Dismiss Report Modal */}
      <PromptModal
        isOpen={isDismissOpen}
        onClose={() => setIsDismissOpen(false)}
        onSubmit={handleDismissConfirm}
        title="Dismiss Report"
        description="Dismiss this report without taking punitive action if no campus violation occurred."
        label="Dismissal Note"
        placeholder="Reason or note for dismissing this report..."
        defaultValue="No policy violation found"
        confirmText="Dismiss Report"
        variant="primary"
        isLoading={isLoading}
      />

      {/* Take Action Modal */}
      <PromptModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onSubmit={handleActionConfirm}
        title={`Take Action on ${targetType.charAt(0) + targetType.slice(1).toLowerCase()} Report`}
        description={getActionDescription()}
        label="Action Details & Moderation Note"
        placeholder="Provide details about the moderation action taken..."
        confirmText="Execute Action"
        variant="danger"
        required
        isLoading={isLoading}
      />
    </>
  );
}
