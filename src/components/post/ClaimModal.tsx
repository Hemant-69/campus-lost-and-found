"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { ImageUploader } from "../image/ImageUploader";
import { submitClaim } from "@/app/actions/claims";
import { CheckCircle2 } from "lucide-react";

export interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function ClaimModal({ isOpen, onClose, postId, postTitle }: ClaimModalProps) {
  const [description, setDescription] = useState("");
  const [verificationAnswer, setVerificationAnswer] = useState("");
  const [proofImageId, setProofImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitClaim({
      postId,
      description,
      verificationAnswer,
      proofImageId,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to submit claim.");
    } else {
      setIsSuccess(true);
    }
  };

  const handleReset = () => {
    setDescription("");
    setVerificationAnswer("");
    setProofImageId(null);
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="File Ownership Claim"
      description={`Submitting claim for: ${postTitle}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-sage border-2.5 border-ink text-ink rounded-full flex items-center justify-center mx-auto shadow-hard-btn">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-ink">Claim Submitted Successfully</h4>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            The finder will review your responses. If approved, you will receive a 6-digit handover code to verify item collection.
          </p>
          <Button onClick={handleReset} variant="accent" className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Describe the Item in Your Own Words"
            placeholder="Provide specific details such as brand, colour, model, scratches, or unique markings..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            hint="Be as specific as possible so the finder can verify your identity."
          />

          <Textarea
            label="Identifying Verification Details"
            placeholder="State distinguishing details that only the true owner would know (e.g. phone lock screen wallpaper, items inside pockets, special serial number or keychain)..."
            rows={3}
            value={verificationAnswer}
            onChange={(e) => setVerificationAnswer(e.target.value)}
            required
            hint="The finder has set a private check question for this item. Answer accurately."
          />

          <ImageUploader
            kind="CLAIM_PROOF"
            maxFiles={1}
            label="Proof of Ownership (Optional)"
            hint="Upload an old photo with the item, original purchase bill, or box."
            onImagesChange={(ids) => setProofImageId(ids[0] || null)}
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
              disabled={!description.trim() || !verificationAnswer.trim()}
            >
              Submit Claim
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
