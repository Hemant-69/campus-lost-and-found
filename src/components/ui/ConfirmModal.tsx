"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import clsx from "clsx";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "accent";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-blush border-2 border-coral flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-coral stroke-[2.5]" />
          </div>
        );
      case "accent":
        return (
          <div className="w-12 h-12 rounded-full bg-yellow border-2 border-ink flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-sky border-2 border-ink flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="text-sm sm:text-base text-ink-soft leading-relaxed font-medium">
            {description}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
