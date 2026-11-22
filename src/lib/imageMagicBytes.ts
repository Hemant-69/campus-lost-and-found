/**
 * Magic bytes validation for uploaded images.
 * Ensures the payload is genuinely a JPEG, PNG, or WebP image regardless of file extension or client header.
 */

export interface MagicByteValidationResult {
  valid: boolean;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | null;
  error?: string;
}

export function validateImageMagicBytes(buffer: Uint8Array): MagicByteValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      valid: false,
      mimeType: null,
      error: "File is too small or empty to be a valid image.",
    };
  }

  // Check JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      valid: true,
      mimeType: "image/jpeg",
    };
  }

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      valid: true,
      mimeType: "image/png",
    };
  }

  // Check WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  const isRiff =
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46;   // F

  const isWebp =
    buffer[8] === 0x57 &&  // W
    buffer[9] === 0x45 &&  // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50;  // P

  if (isRiff && isWebp) {
    return {
      valid: true,
      mimeType: "image/webp",
    };
  }

  return {
    valid: false,
    mimeType: null,
    error: "Invalid image format. Only JPEG, PNG, and WebP files are permitted.",
  };
}
