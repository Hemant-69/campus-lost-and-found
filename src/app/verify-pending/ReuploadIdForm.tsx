"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image/ImageUploader";
import { Button } from "@/components/ui/Button";
import { reuploadIdVerification } from "@/app/actions/auth";

export function ReuploadIdForm() {
  const router = useRouter();
  const [imageId, setImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await reuploadIdVerification(imageId);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to submit new ID photo.");
    } else {
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUploader
        kind="ID_CARD"
        maxFiles={1}
        label="Re-upload Student ID Card Photograph"
        hint="Ensure good lighting, sharp focus, and that your name and roll number are clearly visible."
        onImagesChange={(ids) => setImageId(ids[0] || null)}
      />

      {errorMessage && (
        <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        isLoading={isSubmitting}
        disabled={!imageId}
        className="w-full"
      >
        Re-submit for Review
      </Button>
    </form>
  );
}
