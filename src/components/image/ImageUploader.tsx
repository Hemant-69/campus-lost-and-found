"use client";

import React, { useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { ImageKind } from "@prisma/client";
import { useImageUpload } from "@/lib/useImageUpload";
import clsx from "clsx";

export interface ImageUploaderProps {
  kind: ImageKind;
  maxFiles?: number;
  label?: string;
  hint?: string;
  onImagesChange: (imageIds: string[]) => void;
  className?: string;
}

export function ImageUploader({
  kind,
  maxFiles = 4,
  label,
  hint,
  onImagesChange,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    progressText,
    errorMessage,
    uploadedImages,
    isProcessing,
    uploadMultiple,
    removeImage,
  } = useImageUpload();

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const remainingSlots = maxFiles - uploadedImages.length;
    if (remainingSlots <= 0) return;

    const selectedFiles = Array.from(e.target.files).slice(0, remainingSlots);
    const newIds = await uploadMultiple(selectedFiles, kind, remainingSlots);

    const updatedIds = [...uploadedImages.map((img) => img.id), ...newIds];
    onImagesChange(updatedIds);

    // Reset input value so same file can be picked again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    removeImage(id);
    const updated = uploadedImages.filter((img) => img.id !== id).map((img) => img.id);
    onImagesChange(updated);
  };

  return (
    <div className={clsx("w-full space-y-2.5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}

      {/* Grid of uploaded images */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {uploadedImages.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-input overflow-hidden border-2.5 border-ink bg-surface aspect-square shadow-hard-btn"
            >
              <img
                src={img.previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="p-2 rounded-full bg-surface border-2 border-ink text-coral hover:bg-blush transition shadow-hard-btn"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-xs bg-ink text-paper text-[10px] font-mono font-medium truncate text-center">
                {img.originalSize} to {img.compressedSize}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button area */}
      {uploadedImages.length < maxFiles && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple={maxFiles > 1}
            disabled={isProcessing}
            onChange={handleFileSelection}
            className="hidden"
            id={`uploader-${kind}`}
          />
          <label
            htmlFor={`uploader-${kind}`}
            className={clsx(
              "flex flex-col items-center justify-center p-6 border-2.5 border-dashed border-ink rounded-input transition cursor-pointer text-center",
              isProcessing
                ? "bg-paper cursor-not-allowed opacity-80"
                : "bg-surface hover:bg-paper/60 active:bg-paper"
            )}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-ink">
                <Loader2 className="w-6 h-6 animate-spin text-ink" />
                <span className="text-xs font-semibold text-ink">{progressText}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-soft">
                <UploadCloud className="w-8 h-8 text-ink stroke-[2]" />
                <span className="text-sm font-bold text-ink">
                  Click to select photo {maxFiles > 1 ? `(${uploadedImages.length}/${maxFiles})` : ""}
                </span>
                <span className="text-xs text-ink-soft">
                  JPEG, PNG, WebP or HEIC up to 15 MB. Automatically compressed.
                </span>
              </div>
            )}
          </label>
        </div>
      )}

      {hint && !errorMessage && <p className="text-xs text-ink-soft">{hint}</p>}
      {errorMessage && (
        <div className="p-3 bg-blush border-2 border-ink text-coral text-xs font-semibold rounded-input">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
