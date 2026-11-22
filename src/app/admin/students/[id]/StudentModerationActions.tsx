"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
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

  const handleToggle = async (disable: boolean) => {
    const reason = prompt(
      disable
        ? "Reason for disabling this student account:"
        : "Reason for re-enabling this student account:"
    );
    if (reason === null) return;

    setIsLoading(true);
    await toggleUserDisabled(userId, disable, reason);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {status === "DISABLED" ? (
        <Button
          variant="primary"
          size="sm"
          isLoading={isLoading}
          onClick={() => handleToggle(false)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Enable Account
        </Button>
      ) : (
        <Button
          variant="danger"
          size="sm"
          isLoading={isLoading}
          onClick={() => handleToggle(true)}
        >
          Disable Account
        </Button>
      )}
    </div>
  );
}
