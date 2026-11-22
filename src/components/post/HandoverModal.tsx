"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { completeHandover } from "@/app/actions/claims";
import { CheckCircle2 } from "lucide-react";

export interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function HandoverModal({ isOpen, onClose, postId, postTitle }: HandoverModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await completeHandover(postId, code.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to confirm handover.");
    } else {
      setIsSuccess(true);
    }
  };

  const handleReset = () => {
    setCode("");
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Verify Item Handover"
      description={`Enter the 6-digit code provided by the claimant for: ${postTitle}`}
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-sage border-2.5 border-ink text-ink rounded-full flex items-center justify-center mx-auto shadow-hard-btn">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-ink">Handover Complete</h4>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            This item has officially been marked as RETURNED. Thank you for helping keep our campus safe and honest!
          </p>
          <Button onClick={handleReset} variant="accent" className="mt-2">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="6-Digit Verification Code"
            placeholder="e.g. 482917"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            className="text-center font-serif text-2xl tracking-widest font-bold"
            maxLength={6}
            hint="Ask the claimant for the code shown in their My Claims dashboard."
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
              variant="accent"
              isLoading={isSubmitting}
              disabled={code.trim().length !== 6}
            >
              Verify &amp; Complete
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
