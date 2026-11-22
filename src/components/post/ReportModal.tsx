"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { fileReport } from "@/app/actions/reports";
import { ReportReason, ReportTargetType } from "@prisma/client";
import { CheckCircle2 } from "lucide-react";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam or automated advertising" },
  { value: "FAKE_POST", label: "Fake item post or misleading photos" },
  { value: "ABUSIVE", label: "Abusive, harassing, or hostile behavior" },
  { value: "INAPPROPRIATE", label: "Inappropriate or prohibited content" },
  { value: "SCAM_ATTEMPT", label: "Scam or fraudulent claim attempt" },
  { value: "OTHER", label: "Other campus policy violation" },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await fileReport({
      targetType,
      targetId,
      reason,
      note: note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to submit report.");
    } else {
      setIsSuccess(true);
    }
  };

  const handleReset = () => {
    setReason("SPAM");
    setNote("");
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Report Content"
      description="Help maintain a safe, spam-free campus environment."
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-sage border-2.5 border-ink text-ink rounded-full flex items-center justify-center mx-auto shadow-hard-btn">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-ink">Report Submitted</h4>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            Thank you for keeping our board safe. Campus moderators will review this report promptly.
          </p>
          <Button onClick={handleReset} variant="accent" className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Violation Category"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            options={REASONS}
          />

          <Textarea
            label="Additional Details (Optional)"
            placeholder="Describe what is inappropriate or fraudulent..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {errorMessage && (
            <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-paper">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isSubmitting}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
