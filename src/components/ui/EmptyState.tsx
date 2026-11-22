import React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { LostNoteScene } from "../illustrations/Illustrations";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "Nothing pinned here yet",
  description = "No items match your search. Check back soon or pin a new note.",
  actionText,
  actionHref,
  action,
  onAction,
  className = "",
}: EmptyStateProps) {
  const label = actionText || action?.label;
  const href = actionHref || action?.href;
  const handleAction = onAction || action?.onClick;

  return (
    <div
      className={`bg-surface border-2.5 border-ink rounded-card shadow-hard-card p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <LostNoteScene title={title} subtitle="" className="p-0 mb-4" />
      <p className="text-ink-soft text-base mb-6 max-w-sm">{description}</p>
      {label && href && (
        <Link href={href}>
          <Button variant="accent">{label}</Button>
        </Link>
      )}
      {label && !href && handleAction && (
        <Button variant="accent" onClick={handleAction}>
          {label}
        </Button>
      )}
    </div>
  );
}
