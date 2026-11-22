"use client";

import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  title?: string;
}

export function ImageZoomModal({
  isOpen,
  onClose,
  imageId,
  title = "Photograph Detail",
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.3, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.3, 0.7));
  const handleReset = () => setScale(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface rounded-card overflow-hidden border-2.5 border-ink shadow-[6px_6px_0_#231F20]">
        <div className="flex items-center justify-between px-5 py-4 bg-paper border-b-2.5 border-ink text-ink">
          <span className="font-serif font-bold text-base text-ink">{title}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-full border-2 border-ink bg-surface hover:bg-yellow shadow-hard-btn text-ink transition"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-full border-2 border-ink bg-surface hover:bg-yellow shadow-hard-btn text-ink transition"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-full border-2 border-ink bg-surface hover:bg-yellow shadow-hard-btn text-ink transition"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full border-2 border-ink bg-surface hover:bg-blush shadow-hard-btn text-coral transition ml-2"
              title="Close"
              aria-label="Close image modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px] bg-paper/40">
          <img
            src={`/api/images/${imageId}`}
            alt={title}
            style={{ transform: `scale(${scale})`, transition: "transform 0.15s ease-out" }}
            className="max-w-full max-h-[72vh] object-contain rounded-input border-2 border-ink"
          />
        </div>
      </div>
    </div>
  );
}
