"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Send, Image as ImageIcon, Flag, ShieldAlert, Check, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import { sendMessage } from "@/app/actions/chat";
import { SafeImage } from "../image/SafeImage";
import { ImageUploader } from "../image/ImageUploader";
import { StatusLabel } from "../ui/Badge";
import { ReportModal } from "../post/ReportModal";
import { formatISTTime } from "@/lib/date";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface ChatContainerProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    department: string;
  };
  post: {
    id: string;
    title: string;
    type: "LOST" | "FOUND";
    status: "OPEN" | "CLAIM_IN_PROGRESS" | "RETURNED" | "CLOSED";
    imageId?: string;
  };
  isReadOnly: boolean;
}

export function ChatContainer({
  conversationId,
  currentUserId,
  otherUser,
  post,
  isReadOnly,
}: ChatContainerProps) {
  const [content, setContent] = useState("");
  const [attachmentImageId, setAttachmentImageId] = useState<string | null>(null);
  const [showAttachUploader, setShowAttachUploader] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll messages every 3.5 seconds; back off when window is hidden
  const { data: messages, mutate } = useSWR<any[]>(
    `/api/messages/${conversationId}`,
    fetcher,
    {
      refreshInterval: 3500,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
      errorRetryCount: 5,
      errorRetryInterval: 5000,
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !attachmentImageId) || isSending || isReadOnly) return;

    setIsSending(true);
    const res = await sendMessage({
      conversationId,
      content,
      attachmentImageId: attachmentImageId || undefined,
    });
    setIsSending(false);

    if (res.success) {
      setContent("");
      setAttachmentImageId(null);
      setShowAttachUploader(false);
      mutate();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)] min-h-[500px] max-w-4xl mx-auto bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card">
      {/* Pinned Mini-Card of Post & Header */}
      <div className="p-4 border-b-2.5 border-ink bg-paper flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {post.imageId && (
            <div className="w-12 h-12 rounded-input overflow-hidden shrink-0 border-2 border-ink bg-surface shadow-hard-btn">
              <SafeImage imageId={post.imageId} variant="thumb" alt={post.title} />
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${post.id}`}
                className="font-serif font-bold text-ink hover:text-coral transition-colors truncate max-w-xs text-base"
              >
                {post.title}
              </Link>
              <StatusLabel status={post.type} />
            </div>
            <p className="text-xs text-ink-soft font-medium">
              Chatting with <span className="font-bold text-ink">{otherUser.name}</span> &bull; {otherUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-ink hover:text-coral border-2 border-ink rounded-full bg-surface hover:bg-blush transition shadow-hard-btn"
          >
            <Flag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Report User</span>
          </button>
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-blush border-b-2.5 border-ink text-center text-xs font-semibold text-coral flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          <span>This conversation is read-only because the item is closed or returned.</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-paper/30">
        {!messages || messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm font-semibold text-ink-soft">
            No messages yet. Send a greeting to start coordinating.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm border-2.5 border-ink space-y-2 ${
                    isMe
                      ? "bg-yellow text-ink rounded-br-xs font-medium"
                      : "bg-surface text-ink rounded-bl-xs font-medium"
                  }`}
                >
                  {msg.attachmentImageId && (
                    <div className="rounded-input overflow-hidden max-w-xs aspect-[4/3] bg-paper border-2 border-ink">
                      <SafeImage
                        imageId={msg.attachmentImageId}
                        variant="full"
                        alt="Message attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                </div>
                <div className="flex items-center gap-1.5 px-1 mt-1 text-[11px] font-semibold text-ink-soft">
                  <span>
                    {formatISTTime(msg.createdAt)}
                  </span>
                  {isMe && (
                    <span title={msg.isRead ? "Read" : "Sent"}>
                      {msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-coral stroke-[2.5]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-ink-soft stroke-[2.5]" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Uploader Drawer */}
      {showAttachUploader && !isReadOnly && (
        <div className="p-4 bg-paper border-t-2.5 border-ink">
          <ImageUploader
            kind="CHAT"
            maxFiles={1}
            label="Send Photo Attachment"
            onImagesChange={(ids) => {
              setAttachmentImageId(ids[0] || null);
              setShowAttachUploader(false);
            }}
          />
        </div>
      )}

      {/* Input Box */}
      {!isReadOnly && (
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 bg-surface border-t-2.5 border-ink flex items-center gap-2 sm:gap-3"
        >
          <button
            type="button"
            onClick={() => setShowAttachUploader(!showAttachUploader)}
            className={`p-2.5 rounded-full border-2 border-ink transition shadow-hard-btn ${
              attachmentImageId
                ? "bg-yellow text-ink"
                : "bg-surface hover:bg-paper text-ink"
            }`}
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5 stroke-[2.5]" />
          </button>

          <input
            type="text"
            placeholder={
              attachmentImageId ? "Add a caption..." : "Type your message here..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-4 min-h-[48px] text-sm sm:text-base font-medium bg-paper border-2.5 border-ink rounded-input text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-sky transition"
          />

          <button
            type="submit"
            disabled={(!content.trim() && !attachmentImageId) || isSending}
            className="p-3 rounded-full bg-ink text-paper border-2 border-ink hover:bg-coral disabled:opacity-40 transition shadow-hard-btn"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>
      )}

      {isReportOpen && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="USER"
          targetId={otherUser.id}
        />
      )}
    </div>
  );
}
