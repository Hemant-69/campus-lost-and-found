"use client";

import React, { useState } from "react";
import { SafeImage } from "../image/SafeImage";
import { ImageZoomModal } from "../image/ImageZoomModal";
import { Maximize2 } from "lucide-react";

export function ImageGallery({
  images,
  title,
}: {
  images: { imageId: string; sortOrder: number }[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-paper border-2.5 border-ink rounded-card shadow-hard-card flex items-center justify-center text-ink-soft text-sm font-semibold">
        No photograph provided
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full rounded-card overflow-hidden bg-paper border-2.5 border-ink shadow-hard-card group">
        <SafeImage
          imageId={currentImage.imageId}
          variant="full"
          alt={title}
          className="w-full h-full object-contain"
        />
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-surface border-2 border-ink text-ink hover:bg-yellow transition shadow-hard-btn text-xs font-bold flex items-center gap-1.5"
          aria-label="Enlarge image"
        >
          <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Zoom</span>
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.imageId}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-16 rounded-input overflow-hidden border-2.5 border-ink transition shrink-0 ${
                selectedIndex === idx
                  ? "ring-3 ring-sky shadow-hard-btn -translate-y-0.5"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <SafeImage
                imageId={img.imageId}
                variant="thumb"
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageId={currentImage.imageId}
        title={title}
      />
    </div>
  );
}
