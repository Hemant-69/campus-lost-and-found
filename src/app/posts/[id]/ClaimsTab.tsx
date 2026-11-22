"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusLabel } from "@/components/ui/Badge";
import { SafeImage } from "@/components/image/SafeImage";
import { ImageZoomModal } from "@/components/image/ImageZoomModal";
import { PromptModal } from "@/components/ui/PromptModal";
import { reviewClaim } from "@/app/actions/claims";
import { Check, X, MessageSquare } from "lucide-react";
import { HandoverTicketIllustration } from "@/components/illustrations/Illustrations";

export interface ClaimItem {
  id: string;
  claimantId: string;
  description: string;
  verificationAnswer: string;
  proofImageId: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SELECTED" | "MORE_INFO_REQUESTED";
  rejectionReason: string | null;
  handoverCode: string | null;
  handoverDeadline: string | Date | null;
  createdAt: string | Date;
  claimant: {
    id: string;
    name: string;
    department: string;
  };
}

export function ClaimsTab({
  postId,
  postTitle,
  claims,
  postStatus,
}: {
  postId: string;
  postTitle: string;
  claims: ClaimItem[];
  postStatus: string;
}) {
  const router = useRouter();
  const [selectedProofImageId, setSelectedProofImageId] = useState<string | null>(null);
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [rejectClaimId, setRejectClaimId] = useState<string | null>(null);

  const handleReview = async (
    claimId: string,
    action: "APPROVE" | "REJECT" | "MORE_INFO",
    reason?: string
  ) => {
    setProcessingClaimId(claimId);
    const res = await reviewClaim({
      claimId,
      action,
      rejectionReason: reason,
    });
    setProcessingClaimId(null);

    if (res.success) {
      if (res.conversationId) {
        router.push(`/messages/${res.conversationId}`);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3">
        <h3 className="font-serif text-2xl font-bold text-ink">
          Ownership Claims ({claims.length})
        </h3>
        <span className="text-xs font-semibold text-ink-soft">
          Review claimant answers to verify genuine ownership
        </span>
      </div>

      {claims.length === 0 ? (
        <div className="p-8 text-center bg-surface border-2.5 border-ink rounded-card text-sm text-ink-soft font-medium shadow-hard-card">
          No ownership claims have been submitted yet.
        </div>
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className={`p-6 rounded-card border-2.5 border-ink bg-surface shadow-hard-card space-y-4 transition ${
                claim.status === "APPROVED" ? "ring-4 ring-sage" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-serif font-bold text-ink text-lg">
                    {claim.claimant.name}
                  </span>
                  <span className="text-xs font-medium text-ink-soft ml-2">
                    {claim.claimant.department} &bull;{" "}
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <StatusLabel status={claim.status} />
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-ink block text-xs uppercase tracking-wider mb-1">
                    Claimant Item Description
                  </span>
                  <p className="text-ink font-medium bg-paper p-3 rounded-input border-2 border-ink">
                    {claim.description}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-ink block text-xs uppercase tracking-wider mb-1">
                    Blind Verification Answer
                  </span>
                  <p className="text-ink font-medium bg-blush/60 p-3 rounded-input border-2 border-ink">
                    {claim.verificationAnswer}
                  </p>
                </div>

                {claim.proofImageId && (
                  <div>
                    <span className="font-bold text-ink block text-xs uppercase tracking-wider mb-1.5">
                      Uploaded Proof Photograph
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProofImageId(claim.proofImageId)}
                      className="inline-flex items-center gap-3 p-2 rounded-input border-2 border-ink bg-paper hover:bg-yellow transition text-ink shadow-hard-btn"
                    >
                      <div className="w-12 h-12 rounded-sm border border-ink overflow-hidden bg-surface">
                        <SafeImage imageId={claim.proofImageId} variant="thumb" />
                      </div>
                      <div className="text-left pr-2">
                        <span className="font-bold text-xs block text-ink">View Full Proof Photo</span>
                        <span className="text-[10px] text-ink-soft">Click to enlarge</span>
                      </div>
                    </button>
                  </div>
                )}

                {claim.status === "APPROVED" && claim.handoverDeadline && (
                  <div className="p-4 bg-sage border-2 border-ink rounded-input text-ink text-xs sm:text-sm font-medium space-y-1">
                    <strong className="block font-bold">Approved Claim:</strong>
                    <span>The claimant holds a 6-digit handover code. Meet them at the Campus Security Office or Library Desk. Handover deadline: {new Date(claim.handoverDeadline).toLocaleDateString()}.</span>
                  </div>
                )}
              </div>

              {/* Action buttons if claim is PENDING */}
              {claim.status === "PENDING" && postStatus === "OPEN" && (
                <div className="flex flex-wrap gap-3 pt-3 border-t-2 border-paper">
                  <Button
                    variant="accent"
                    size="sm"
                    isLoading={processingClaimId === claim.id}
                    onClick={() => handleReview(claim.id, "APPROVE")}
                  >
                    <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                    Approve Claim
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={processingClaimId === claim.id}
                    onClick={() => handleReview(claim.id, "MORE_INFO")}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                    Ask for More Info
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={processingClaimId === claim.id}
                    onClick={() => setRejectClaimId(claim.id)}
                  >
                    <X className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Claim Modal */}
      <PromptModal
        isOpen={!!rejectClaimId}
        onClose={() => setRejectClaimId(null)}
        onSubmit={async (reason) => {
          if (rejectClaimId) {
            await handleReview(rejectClaimId, "REJECT", reason || undefined);
            setRejectClaimId(null);
          }
        }}
        title="Reject Ownership Claim"
        description="Are you sure you want to reject this claim? You can optionally include an explanatory note for the claimant."
        label="Reason for Rejection (Optional)"
        placeholder="e.g. Serial number does not match, distinctive marks not confirmed..."
        confirmText="Reject Claim"
        variant="danger"
        isLoading={!!processingClaimId && processingClaimId === rejectClaimId}
      />

      {selectedProofImageId && (
        <ImageZoomModal
          isOpen={!!selectedProofImageId}
          onClose={() => setSelectedProofImageId(null)}
          imageId={selectedProofImageId}
          title="Claim Proof Photo"
        />
      )}
    </div>
  );
}
