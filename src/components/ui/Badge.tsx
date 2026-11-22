import React from "react";
import clsx from "clsx";

export interface BadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ status, size = "sm", className }: BadgeProps) {
  const normalized = status.toUpperCase();

  const colorStyles: Record<string, string> = {
    OPEN: "bg-surface text-ink",
    CLAIM_IN_PROGRESS: "bg-sky text-ink",
    RETURNED: "bg-sage text-ink",
    CLOSED: "bg-paper text-ink-soft",
    TAKEN_DOWN: "bg-blush text-ink",
    PENDING: "bg-yellow text-ink",
    VERIFIED: "bg-sage text-ink",
    REJECTED: "bg-blush text-ink",
    DISABLED: "bg-paper text-ink-muted",
    LOST: "bg-yellow text-ink",
    FOUND: "bg-sage text-ink",
    STUDENT: "bg-surface text-ink",
    ADMIN: "bg-sky text-ink",
  };

  const style = colorStyles[normalized] || "bg-surface text-ink";

  const readableText = status === "CLAIM_IN_PROGRESS" ? "In progress" : status.replace(/_/g, " ");

  return (
    <span
      className={clsx(
        "inline-flex items-center font-semibold border-2 border-ink rounded-lg text-ink uppercase tracking-wide",
        size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1",
        style,
        className
      )}
    >
      {readableText}
    </span>
  );
}

// Export StatusLabel alias for semantic naming
export const StatusLabel = Badge;
