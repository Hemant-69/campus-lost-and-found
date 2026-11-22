"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { SafeImage } from "../image/SafeImage";
import { reviewStudentVerification } from "@/app/actions/admin";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

export interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: {
    id: string;
    imageId: string;
    createdAt: string | Date;
    user: {
      id: string;
      name: string;
      email: string;
      rollNumber: string;
      department: string;
      year: number;
    };
  };
  onSuccess: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  verification,
  onSuccess,
}: VerificationModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !rejectionReason.trim()) {
      setErrorMessage("Please enter a reason for rejecting the ID card verification.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await reviewStudentVerification({
      verificationId: verification.id,
      action,
      rejectionReason: action === "REJECT" ? rejectionReason : undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to process verification decision.");
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student ID Verification Review"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Student Info */}
        <div className="space-y-4">
          <div className="p-5 bg-paper rounded-card border-2 border-ink space-y-3 text-xs sm:text-sm">
            <h4 className="font-serif font-bold text-ink text-lg">{verification.user.name}</h4>
            <div className="grid grid-cols-2 gap-2.5 text-ink-soft">
              <div>
                <span className="text-ink font-bold block text-[10px] uppercase">College Email</span>
                <span className="font-mono text-ink break-all text-xs font-medium">{verification.user.email}</span>
              </div>
              <div>
                <span className="text-ink font-bold block text-[10px] uppercase">Roll Number</span>
                <span className="font-mono font-bold text-ink text-xs">{verification.user.rollNumber}</span>
              </div>
              <div>
                <span className="text-ink font-bold block text-[10px] uppercase">Department</span>
                <span className="font-medium text-ink">{verification.user.department}</span>
              </div>
              <div>
                <span className="text-ink font-bold block text-[10px] uppercase">Academic Year</span>
                <span className="font-medium text-ink">Year {verification.user.year}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-ink/20 text-xs text-ink-soft">
              Submitted: {new Date(verification.createdAt).toLocaleString()}
            </div>
          </div>

          {showRejectInput ? (
            <div className="space-y-3">
              <Textarea
                label="Rejection Reason (Required)"
                placeholder="Explain why the ID was rejected: e.g., 'Name is illegible', 'Not a valid college ID card', 'Expired enrollment'..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectInput(false)}
                >
                  Back
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleAction("REJECT")}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="accent"
                onClick={() => handleAction("APPROVE")}
                isLoading={isSubmitting}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Approve Student ID
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowRejectInput(true)}
                className="w-full"
              >
                <X className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Reject with Reason
              </Button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right: ID Card Photo with Zoom Controls */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink">
            <span>Uploaded Student ID Card</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setImageScale((s) => Math.min(s + 0.25, 2.5))}
                className="p-1 rounded border border-ink hover:bg-yellow shadow-hard-btn bg-surface"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => setImageScale((s) => Math.max(s - 0.25, 1))}
                className="p-1 rounded border border-ink hover:bg-yellow shadow-hard-btn bg-surface"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-card overflow-auto border-2.5 border-ink bg-paper flex items-center justify-center p-2 shadow-hard-card">
            <div
              style={{
                transform: `scale(${imageScale})`,
                transition: "transform 0.15s ease-out",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <SafeImage
                imageId={verification.imageId}
                variant="full"
                alt="Student ID card"
                className="max-w-full max-h-full object-contain rounded-input"
              />
            </div>
          </div>
          <span className="text-[11px] font-medium text-ink-soft text-center">
            Double check name, department, roll number, and valid expiration date.
          </span>
        </div>
      </div>
    </Modal>
  );
}
