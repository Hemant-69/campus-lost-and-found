import { describe, it, expect, vi } from "vitest";
import {
  validatePickedFile,
  PROFILES,
  THUMBNAIL_PROFILE,
  formatByteSize,
} from "@/lib/imageCompress";
import { validateImageMagicBytes } from "@/lib/imageMagicBytes";

describe("Image Compression and Validation Unit Tests", () => {
  it("rejects non-image files such as PDF or executables", () => {
    const fakePdf = {
      name: "id_document.pdf",
      type: "application/pdf",
      size: 500 * 1024,
    } as File;

    expect(() => validatePickedFile(fakePdf)).toThrowError(/Unsupported file format/);
  });

  it("rejects original files exceeding 15 MB cap before processing", () => {
    const fakeLargePhoto = {
      name: "dslr_raw_export.jpg",
      type: "image/jpeg",
      size: 16 * 1024 * 1024, // 16 MB
    } as File;

    expect(() => validatePickedFile(fakeLargePhoto)).toThrowError(/File is too large/);
  });

  it("accepts valid JPEG, PNG, WebP, and HEIC files", () => {
    const validJpeg = { name: "card.jpg", type: "image/jpeg", size: 2 * 1024 * 1024 } as File;
    const validPng = { name: "card.png", type: "image/png", size: 1 * 1024 * 1024 } as File;
    const validWebp = { name: "card.webp", type: "image/webp", size: 800 * 1024 } as File;
    const validHeic = { name: "photo.heic", type: "image/heic", size: 3 * 1024 * 1024 } as File;

    expect(() => validatePickedFile(validJpeg)).not.toThrow();
    expect(() => validatePickedFile(validPng)).not.toThrow();
    expect(() => validatePickedFile(validWebp)).not.toThrow();
    expect(() => validatePickedFile(validHeic)).not.toThrow();
  });

  it("enforces strict profile limits for each kind", () => {
    // POST: max 1280px, target under 300 KB
    expect(PROFILES.POST.maxDimension).toBe(1280);
    expect(PROFILES.POST.targetSizeBytes).toBe(300 * 1024);

    // CHAT: max 1280px, target under 300 KB
    expect(PROFILES.CHAT.maxDimension).toBe(1280);
    expect(PROFILES.CHAT.targetSizeBytes).toBe(300 * 1024);

    // CLAIM_PROOF: max 1280px, target under 300 KB
    expect(PROFILES.CLAIM_PROOF.maxDimension).toBe(1280);
    expect(PROFILES.CLAIM_PROOF.targetSizeBytes).toBe(300 * 1024);

    // ID_CARD: max 1600px, target under 500 KB, quality floor 0.6
    expect(PROFILES.ID_CARD.maxDimension).toBe(1600);
    expect(PROFILES.ID_CARD.targetSizeBytes).toBe(500 * 1024);
    expect(PROFILES.ID_CARD.qualityFloor).toBe(0.6);

    // Thumbnail: max 400px, target under 40 KB
    expect(THUMBNAIL_PROFILE.maxDimension).toBe(400);
    expect(THUMBNAIL_PROFILE.targetSizeBytes).toBe(40 * 1024);
  });

  it("accurately detects magic bytes for valid images", () => {
    // Valid JPEG header
    const jpegBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegRes = validateImageMagicBytes(jpegBuffer);
    expect(jpegRes.valid).toBe(true);
    expect(jpegRes.mimeType).toBe("image/jpeg");

    // Valid PNG header
    const pngBuffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const pngRes = validateImageMagicBytes(pngBuffer);
    expect(pngRes.valid).toBe(true);
    expect(pngRes.mimeType).toBe("image/png");

    // Valid WebP header
    const webpBuffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x24, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50, // WEBP
    ]);
    const webpRes = validateImageMagicBytes(webpBuffer);
    expect(webpRes.valid).toBe(true);
    expect(webpRes.mimeType).toBe("image/webp");
  });

  it("rejects malicious or mismatched executable payloads disguised with image extensions", () => {
    // Windows PE / MZ header
    const fakeExe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
    const res = validateImageMagicBytes(fakeExe);
    expect(res.valid).toBe(false);
    expect(res.mimeType).toBe(null);
  });

  it("formats byte values cleanly for microcopy display", () => {
    expect(formatByteSize(450)).toBe("450 B");
    expect(formatByteSize(120 * 1024)).toBe("120 KB");
    expect(formatByteSize(3.5 * 1024 * 1024)).toBe("3.5 MB");
  });
});
