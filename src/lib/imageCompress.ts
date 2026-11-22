import { ImageKind } from "@prisma/client";

export interface CompressionProfile {
  maxDimension: number;
  targetSizeBytes: number;
  qualityFloor: number;
}

export const PROFILES: Record<ImageKind, CompressionProfile> = {
  POST: {
    maxDimension: 1280,
    targetSizeBytes: 300 * 1024, // 300 KB
    qualityFloor: 0.4,
  },
  CHAT: {
    maxDimension: 1280,
    targetSizeBytes: 300 * 1024, // 300 KB
    qualityFloor: 0.4,
  },
  CLAIM_PROOF: {
    maxDimension: 1280,
    targetSizeBytes: 300 * 1024, // 300 KB
    qualityFloor: 0.4,
  },
  ID_CARD: {
    maxDimension: 1600,
    targetSizeBytes: 500 * 1024, // 500 KB
    qualityFloor: 0.6, // Keep text legible on student ID cards
  },
};

export const THUMBNAIL_PROFILE: CompressionProfile = {
  maxDimension: 400,
  targetSizeBytes: 40 * 1024, // 40 KB
  qualityFloor: 0.35,
};

export interface CompressionOutput {
  fullBlob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  thumbSizeBytes: number;
  originalSizeBytes: number;
  mimeType: "image/webp" | "image/jpeg";
}

const MAX_ORIGINAL_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Validates the initial picked file before any heavy processing.
 */
export function validatePickedFile(file: File): void {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isHeicExt = extension === "heic" || extension === "heif";
  const isValidMime = ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) || isHeicExt;

  if (!isValidMime) {
    throw new Error(
      "Unsupported file format. Please upload a JPEG, PNG, WebP, or HEIC image."
    );
  }

  if (file.size > MAX_ORIGINAL_SIZE_BYTES) {
    throw new Error(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed original file size is 15 MB.`
    );
  }
}

/**
 * Converts HEIC/HEIF blobs to JPEG via dynamically loaded heic2any.
 */
async function convertHeicIfNeeded(file: Blob): Promise<Blob> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    (file instanceof File && /\.(heic|heif)$/i.test(file.name));

  if (!isHeic) {
    return file;
  }

  try {
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default || heic2anyModule;
    const conversionResult = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    return Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
  } catch (err) {
    throw new Error("Failed to process HEIC image. Please convert to JPEG or PNG and retry.");
  }
}

/**
 * Computes constrained dimensions while preserving aspect ratio and preventing upscaling.
 */
function calculateDimensions(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: srcWidth, height: srcHeight };
  }

  if (srcWidth >= srcHeight) {
    const ratio = maxDimension / srcWidth;
    return {
      width: Math.round(maxDimension),
      height: Math.max(1, Math.round(srcHeight * ratio)),
    };
  } else {
    const ratio = maxDimension / srcHeight;
    return {
      width: Math.max(1, Math.round(srcWidth * ratio)),
      height: Math.round(maxDimension),
    };
  }
}

/**
 * Draws an ImageBitmap or HTMLImageElement onto a canvas and converts to Blob.
 * Prefers OffscreenCanvas when available.
 */
async function renderToBlob(
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  mimeType: "image/webp" | "image/jpeg",
  quality: number
): Promise<Blob> {
  if (typeof OffscreenCanvas !== "undefined") {
    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = offscreen.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D canvas context.");
    ctx.drawImage(source as any, 0, 0, targetWidth, targetHeight);
    return await offscreen.convertToBlob({ type: mimeType, quality });
  }

  // Fallback to standard DOM Canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D canvas context.");
  ctx.drawImage(source as any, 0, 0, targetWidth, targetHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas blob conversion returned null."));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Detects whether the current browser environment supports WebP encoding in Canvas.
 */
async function checkWebpEncodingSupport(): Promise<boolean> {
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      const off = new OffscreenCanvas(1, 1);
      const blob = await off.convertToBlob({ type: "image/webp" });
      return blob.type === "image/webp";
    } catch {
      return false;
    }
  }

  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const dataUrl = canvas.toDataURL("image/webp");
      return dataUrl.startsWith("data:image/webp");
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Executes the adaptive compression loop.
 * Decreases quality by 0.07 per step down to qualityFloor, then decreases dimensions by 15%.
 * Max 6 attempts.
 */
async function compressAdaptive(
  source: ImageBitmap,
  initialWidth: number,
  initialHeight: number,
  profile: CompressionProfile,
  preferredMimeType: "image/webp" | "image/jpeg"
): Promise<{ blob: Blob; width: number; height: number; mimeType: "image/webp" | "image/jpeg" }> {
  let currentWidth = initialWidth;
  let currentHeight = initialHeight;
  let currentQuality = 0.8;
  const maxAttempts = 6;
  let bestBlob: Blob | null = null;
  let bestBlobMime = preferredMimeType;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let blob: Blob;
    try {
      blob = await renderToBlob(
        source,
        currentWidth,
        currentHeight,
        preferredMimeType,
        currentQuality
      );
      bestBlobMime = preferredMimeType;
    } catch {
      // Fallback to JPEG if WebP encoding failed
      blob = await renderToBlob(source, currentWidth, currentHeight, "image/jpeg", currentQuality);
      bestBlobMime = "image/jpeg";
    }

    bestBlob = blob;

    if (blob.size <= profile.targetSizeBytes) {
      return {
        blob,
        width: currentWidth,
        height: currentHeight,
        mimeType: bestBlobMime,
      };
    }

    // Adjust parameters for next attempt
    if (currentQuality - 0.07 >= profile.qualityFloor) {
      currentQuality = Math.max(profile.qualityFloor, currentQuality - 0.07);
    } else {
      // Reduce dimensions by 15%
      currentWidth = Math.max(100, Math.round(currentWidth * 0.85));
      currentHeight = Math.max(100, Math.round(currentHeight * 0.85));
    }
  }

  // If after 6 attempts target is not reached, check if within a reasonable margin or throw
  if (bestBlob && bestBlob.size <= profile.targetSizeBytes * 1.25) {
    return {
      blob: bestBlob,
      width: currentWidth,
      height: currentHeight,
      mimeType: bestBlobMime,
    };
  }

  throw new Error(
    `Unable to compress image below the target size threshold (${Math.round(
      profile.targetSizeBytes / 1024
    )} KB). Please choose a different photo.`
  );
}

/**
 * Main compression pipeline for client-side uploads.
 * Takes a raw File, validates, extracts orientation-corrected bitmap, generates
 * target-sized full image and 400px thumbnail, strips EXIF metadata, and returns both Blobs.
 */
export async function compressImage(
  file: File,
  kind: ImageKind
): Promise<CompressionOutput> {
  validatePickedFile(file);

  const processedFile = await convertHeicIfNeeded(file);
  const originalSizeBytes = file.size;

  let bitmap: ImageBitmap;
  if (typeof createImageBitmap !== "undefined") {
    bitmap = await createImageBitmap(processedFile, {
      imageOrientation: "from-image",
    });
  } else {
    throw new Error("createImageBitmap is not supported in this browser environment.");
  }

  try {
    const supportsWebp = await checkWebpEncodingSupport();
    const targetMime: "image/webp" | "image/jpeg" = supportsWebp ? "image/webp" : "image/jpeg";

    const profile = PROFILES[kind];
    const fullDims = calculateDimensions(bitmap.width, bitmap.height, profile.maxDimension);

    // Compress full image
    const fullResult = await compressAdaptive(
      bitmap,
      fullDims.width,
      fullDims.height,
      profile,
      targetMime
    );

    // Compress thumbnail (max 400px, 40 KB target)
    const thumbDims = calculateDimensions(bitmap.width, bitmap.height, THUMBNAIL_PROFILE.maxDimension);
    const thumbResult = await compressAdaptive(
      bitmap,
      thumbDims.width,
      thumbDims.height,
      THUMBNAIL_PROFILE,
      targetMime
    );

    return {
      fullBlob: fullResult.blob,
      thumbBlob: thumbResult.blob,
      width: fullResult.width,
      height: fullResult.height,
      sizeBytes: fullResult.blob.size,
      thumbSizeBytes: thumbResult.blob.size,
      originalSizeBytes,
      mimeType: fullResult.mimeType,
    };
  } finally {
    // Crucial: Release memory immediately to avoid mobile browser crashes
    bitmap.close();
  }
}

/**
 * Formats byte count to a clean human-readable string (e.g. "4.2 MB to 210 KB").
 */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
