"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ClaimModal } from "@/components/post/ClaimModal";
import { FoundReachoutModal } from "@/components/post/FoundReachoutModal";
import { HandoverModal } from "@/components/post/HandoverModal";
import { ReportModal } from "@/components/post/ReportModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { closePost } from "@/app/actions/posts";
import { startPostConversation } from "@/app/actions/chat";
import { useRouter } from "next/navigation";
import { MessageSquare, Flag, Edit, CheckCircle, XCircle } from "lucide-react";

export function PostActionButtons({
  post,
  currentUserId,
  isLoggedIn,
  isVerified,
  approvedClaimCode,
}: {
  post: {
    id: string;
    userId: string;
    type: "LOST" | "FOUND";
    status: "OPEN" | "CLAIM_IN_PROGRESS" | "RETURNED" | "CLOSED";
    title: string;
  };
  currentUserId?: string;
  isLoggedIn: boolean;
  isVerified: boolean;
  approvedClaimCode?: string;
}) {
  const router = useRouter();
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isFoundOpen, setIsFoundOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const isOwner = currentUserId === post.userId;
  const isClosed = post.status === "CLOSED" || post.status === "RETURNED";

  const handleStartChat = async () => {
    setIsStartingChat(true);
    const res = await startPostConversation(post.id);
    setIsStartingChat(false);
    if (res.success && res.conversationId) {
      router.push(`/messages/${res.conversationId}`);
    }
  };

  const handleCloseConfirm = async () => {
    setIsClosing(true);
    await closePost(post.id);
    setIsClosing(false);
    setIsCloseModalOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Claim / Reachout for non-owner */}
        {!isOwner && !isClosed && (
          <>
            {post.type === "FOUND" && (
              <Button
                variant="accent"
                onClick={() => {
                  if (!isLoggedIn) router.push("/login");
                  else if (!isVerified) router.push("/verify-pending");
                  else setIsClaimOpen(true);
                }}
              >
                This is mine
              </Button>
            )}

            {post.type === "LOST" && (
              <Button
                variant="accent"
                onClick={() => {
                  if (!isLoggedIn) router.push("/login");
                  else if (!isVerified) router.push("/verify-pending");
                  else setIsFoundOpen(true);
                }}
              >
                I found this
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleStartChat}
              isLoading={isStartingChat}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Message Poster</span>
            </Button>
          </>
        )}

        {/* Poster Actions */}
        {isOwner && !isClosed && (
          <>
            {post.status === "CLAIM_IN_PROGRESS" && (
              <Button
                variant="accent"
                onClick={() => setIsHandoverOpen(true)}
              >
                <CheckCircle className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Enter Handover Code
              </Button>
            )}

            <Link href={`/posts/${post.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Edit
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => setIsCloseModalOpen(true)}
              disabled={isClosing}
              className="text-ink hover:text-coral"
            >
              <XCircle className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Close Post
            </Button>
          </>
        )}

        {/* Report Button */}
        {!isOwner && (
          <Button
            variant="ghost"
            onClick={() => {
              if (!isLoggedIn) router.push("/login");
              else setIsReportOpen(true);
            }}
            className="text-ink-soft hover:text-coral ml-auto text-xs"
          >
            <Flag className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
            Report
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Close Post"
        description="Are you sure you want to close this post? This marks the item as resolved or inactive on the campus board."
        confirmText="Close Post"
        variant="primary"
        isLoading={isClosing}
      />

      <ClaimModal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        postId={post.id}
        postTitle={post.title}
      />

      <FoundReachoutModal
        isOpen={isFoundOpen}
        onClose={() => setIsFoundOpen(false)}
        postId={post.id}
        postTitle={post.title}
      />

      <HandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        postId={post.id}
        postTitle={post.title}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="POST"
        targetId={post.id}
      />
    </div>
  );
}
