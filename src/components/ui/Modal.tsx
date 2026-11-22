"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:p-0">
      {/* Flat solid backdrop, no blur */}
      <div
        className="fixed inset-0 bg-ink/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          "relative w-full bg-surface border-2.5 border-ink rounded-card shadow-[6px_6px_0_#231F20] overflow-hidden transform transition-all z-10 max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:flex max-sm:flex-col",
          widthClasses[maxWidth]
        )}
      >
        <div className="p-6 border-b-2.5 border-ink bg-paper flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold font-serif text-ink">
              {title}
            </h2>
            {description && <p className="text-xs sm:text-sm text-ink-soft">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border-2 border-ink text-ink bg-surface hover:bg-yellow active:translate-x-[1px] active:translate-y-[1px] transition shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6 max-sm:flex-1 max-sm:overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
