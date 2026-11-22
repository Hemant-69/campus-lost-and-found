"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PromptModal } from "@/components/ui/PromptModal";
import { toggleUserDisabled } from "@/app/actions/admin";

export function StudentModerationActions({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isEnableOpen, setIsEnableOpen] = useState(false);

  const handleDisableConfirm = async (reason: string) => {
    setIsLoading(true);
    await toggleUserDisabled(userId, true, reason);
    setIsLoading(false);
    setIsDisableOpen(false);
    router.refresh();
  };

  const handleEnableConfirm = async (reason: string) => {
    setIsLoading(true);
    await toggleUserDisabled(userId, false, reason || "Re-enabled by administrator");
    setIsLoading(false);
    setIsEnableOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {status === "DISABLED" ? (
          <Button
            variant="primary"
            size="sm"
            disabled={isLoading}
            onClick={() => setIsEnableOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Enable Account
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            disabled={isLoading}
            onClick={() => setIsDisableOpen(true)}
          >
            Disable Account
          </Button>
        )}
      </div>

      {/* Disable Account Modal */}
      <PromptModal
        isOpen={isDisableOpen}
        onClose={() => setIsDisableOpen(false)}
        onSubmit={handleDisableConfirm}
        title="Disable Student Account"
        description="Disabling this account immediately revokes the student's access to post, comment, claim, or chat on the platform."
        label="Reason for Disabling"
        placeholder="e.g. Violation of campus lost and found conduct policy..."
        confirmText="Disable Account"
        variant="danger"
        required
        isLoading={isLoading}
      />

      {/* Enable Account Modal */}
      <PromptModal
        isOpen={isEnableOpen}
        onClose={() => setIsEnableOpen(false)}
        onSubmit={handleEnableConfirm}
        title="Re-enable Student Account"
        description="Restore active access and privileges for this student on the platform."
        label="Note / Reason (Optional)"
        placeholder="e.g. Account reviewed and reinstated..."
        confirmText="Re-enable Account"
        variant="primary"
        isLoading={isLoading}
      />
    </>
  );
}
