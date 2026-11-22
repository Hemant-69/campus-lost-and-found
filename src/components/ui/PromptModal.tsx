"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Input } from "./Input";
import { AlertCircle, HelpCircle } from "lucide-react";

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  description?: string | React.ReactNode;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "accent";
  multiline?: boolean;
  required?: boolean;
  isLoading?: boolean;
}

export function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  label,
  placeholder = "Enter details...",
  defaultValue = "",
  confirmText = "Submit",
  cancelText = "Cancel",
  variant = "primary",
  multiline = true,
  required = false,
  isLoading = false,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (required && !trimmed) {
      setError(label ? `${label} is required.` : "This field is required.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {description && (
          <div className="text-sm text-ink-soft leading-relaxed font-medium">
            {description}
          </div>
        )}

        <div>
          {multiline ? (
            <Textarea
              label={label}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              rows={3}
              autoFocus
            />
          ) : (
            <Input
              label={label}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              autoFocus
            />
          )}
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
            type="submit"
            variant={variant}
            size="sm"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
