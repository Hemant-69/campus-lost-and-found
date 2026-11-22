"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { CategoryDrawing } from "../illustrations/Illustrations";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageId?: string;
  variant?: "thumb" | "full";
  category?: string;
  fallbackAlt?: string;
}

export function SafeImage({
  imageId,
  variant = "thumb",
  category = "OTHER",
  fallbackAlt = "Notice Board Item",
  className,
  src: propSrc,
  loading,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const src = propSrc || (imageId ? `/api/images/${imageId}${variant === "thumb" ? "/thumb" : ""}` : "");

  // If already complete (e.g. from browser cache or prefetch), check if it rendered properly
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) {
        setHasError(true);
      }
    }
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={clsx(
          "w-full h-full min-h-0 flex flex-col items-center justify-center bg-paper border-b-2.5 border-ink select-none p-2 sm:p-4 bg-cover bg-center",
          className
        )}
        style={{ backgroundImage: "url('/images/paper-bg.webp')" }}
      >
        <CategoryDrawing category={category} size={36} className="opacity-90 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-[11px] font-bold text-ink">No photo attached</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={props.alt || fallbackAlt}
      loading={loading || (variant === "thumb" ? "eager" : "lazy")}
      decoding="async"
      onError={() => setHasError(true)}
      className={clsx("w-full h-full object-cover block", className)}
      {...props}
    />
  );
}
