"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { ImageUploader } from "../image/ImageUploader";
import { startPostConversation } from "@/app/actions/chat";

export interface FoundReachoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function FoundReachoutModal({
  isOpen,
  onClose,
  postId,
  postTitle,
}: FoundReachoutModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [photoImageId, setPhotoImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await startPostConversation(postId, message, photoImageId || undefined);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to reach out to owner.");
    } else if (res.conversationId) {
      onClose();
      router.push(`/messages/${res.conversationId}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="I Found This Item"
      description={`Notify the owner of: ${postTitle}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Message to Owner"
          placeholder="Where did you spot or retrieve this item? E.g., 'I found your keys near the library counter and handed them to the security guard'..."
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <ImageUploader
          kind="CHAT"
          maxFiles={1}
          label="Attach Photo of Found Item (Optional)"
          onImagesChange={(ids) => setPhotoImageId(ids[0] || null)}
        />

        {errorMessage && (
          <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t-2 border-paper">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
            disabled={!message.trim()}
          >
            Start Conversation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
