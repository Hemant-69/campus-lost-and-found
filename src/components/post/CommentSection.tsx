"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { addComment, deleteComment } from "@/app/actions/comments";
import { CornerDownRight, Trash2, Flag, AlertCircle } from "lucide-react";
import { ReportModal } from "./ReportModal";

export interface CommentNode {
  id: string;
  content: string;
  isDeleted: boolean;
  createdAt: string | Date;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    department: string;
  };
  replies?: CommentNode[];
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
  isLoggedIn,
  isVerified,
  isPostClosed,
}: {
  postId: string;
  comments: CommentNode[];
  currentUserId?: string;
  isLoggedIn: boolean;
  isVerified: boolean;
  isPostClosed: boolean;
}) {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) return;

    setIsSubmitting(true);
    await addComment({
      postId,
      content: text,
      parentId: parentId || null,
    });
    setIsSubmitting(false);

    if (parentId) {
      setReplyText("");
      setReplyingToId(null);
    } else {
      setNewCommentText("");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Are you sure you want to remove this comment?")) {
      await deleteComment(commentId);
    }
  };

  // Group top-level and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const repliesMap: Record<string, CommentNode[]> = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
      repliesMap[c.parentId].push(c);
    }
  });

  return (
    <div id="comments" className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3">
        <h3 className="font-serif text-2xl font-bold text-ink">
          Public Questions &amp; Discussion ({comments.length})
        </h3>
      </div>

      <div className="flex items-center gap-2.5 p-3.5 bg-blush border-2 border-ink rounded-input text-ink text-xs font-semibold">
        <AlertCircle className="w-4 h-4 text-coral shrink-0 stroke-[2.5]" />
        <span>Don&apos;t post private identifying details here. File an ownership claim instead.</span>
      </div>

      {/* Main Comment Box */}
      {!isPostClosed ? (
        isLoggedIn && isVerified ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Ask a question about where this item was seen or general details..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                variant="accent"
                size="sm"
                onClick={() => handlePostComment()}
                isLoading={isSubmitting && !replyingToId}
                disabled={!newCommentText.trim()}
              >
                Post Question
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-paper border-2 border-ink rounded-input text-xs text-ink-soft font-medium text-center">
            {!isLoggedIn
              ? "Please sign in to ask a question."
              : "Your account is awaiting ID verification. Commenting is restricted to verified students."}
          </div>
        )
      ) : (
        <div className="p-3 bg-paper border-2 border-ink rounded-input text-xs text-ink-soft font-semibold text-center">
          This post is resolved or closed. Comments are locked.
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {rootComments.length === 0 ? (
          <p className="text-xs text-ink-soft py-4 text-center font-medium">
            No questions asked yet. Be the first to start the discussion.
          </p>
        ) : (
          rootComments.map((comment) => {
            const replies = repliesMap[comment.id] || [];
            const isAuthor = currentUserId === comment.author.id;

            return (
              <div key={comment.id} className="space-y-3 p-5 rounded-card bg-surface border-2.5 border-ink shadow-hard-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-ink text-sm">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-ink-soft ml-2">
                      {comment.author.department} &bull;{" "}
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-soft">
                    {isAuthor && !comment.isDeleted && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 hover:text-coral transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    )}
                    <button
                      onClick={() => setReportTargetId(comment.id)}
                      className="p-1 hover:text-coral transition"
                      title="Report comment"
                    >
                      <Flag className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>

                <p className={`text-sm ${comment.isDeleted ? "text-ink-soft/70 italic" : "text-ink"}`}>
                  {comment.content}
                </p>

                {/* Reply button */}
                {!isPostClosed && isLoggedIn && isVerified && !comment.isDeleted && (
                  <div>
                    <button
                      onClick={() =>
                        setReplyingToId(replyingToId === comment.id ? null : comment.id)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-coral transition"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Reply Box */}
                {replyingToId === comment.id && (
                  <div className="pt-2 pl-4 border-l-2.5 border-ink space-y-3">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handlePostComment(comment.id)}
                        isLoading={isSubmitting}
                        disabled={!replyText.trim()}
                      >
                        Submit Reply
                      </Button>
                    </div>
                  </div>
                )}

                {/* 1 Level of Replies */}
                {replies.length > 0 && (
                  <div className="space-y-3 pt-2 pl-4 border-l-2.5 border-ink">
                    {replies.map((reply) => {
                      const isReplyAuthor = currentUserId === reply.author.id;
                      return (
                        <div key={reply.id} className="space-y-1.5 bg-paper p-3.5 rounded-input border-2 border-ink text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">
                              {reply.author.name}
                              <span className="text-[11px] font-normal text-ink-soft ml-1.5">
                                ({reply.author.department})
                              </span>
                            </span>
                            <div className="flex items-center gap-1 text-ink-soft">
                              {isReplyAuthor && !reply.isDeleted && (
                                <button
                                  onClick={() => handleDelete(reply.id)}
                                  className="p-0.5 hover:text-coral transition"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setReportTargetId(reply.id)}
                                className="p-0.5 hover:text-coral transition"
                                title="Report reply"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className={reply.isDeleted ? "text-ink-soft/70 italic" : "text-ink"}>
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {reportTargetId && (
        <ReportModal
          isOpen={!!reportTargetId}
          onClose={() => setReportTargetId(null)}
          targetType="COMMENT"
          targetId={reportTargetId}
        />
      )}
    </div>
  );
}
