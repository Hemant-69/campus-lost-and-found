import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/images/route";
import { NextRequest } from "next/server";
import * as authLib from "@/lib/auth";
import * as rateLimitLib from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

// Valid 1x1 WebP
const VALID_WEBP_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
  0x10, 0x07, 0x10, 0x11, 0x11, 0x88, 0x88, 0xfe, 0x07, 0x00,
]);

// Fake non-image binary (16 bytes, valid header size, invalid magic bytes)
const INVALID_BYTES = new Uint8Array([
  0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00,
]);

function createUploadRequest(options: {
  imageBytes?: Uint8Array;
  thumbBytes?: Uint8Array;
  kind?: string;
  imageSizePad?: number;
  thumbSizePad?: number;
}) {
  const formData = new FormData();

  let imgBlob: Blob;
  if (options.imageSizePad) {
    // Pad to exceed size
    const padded = new Uint8Array(options.imageSizePad);
    padded.set(options.imageBytes || VALID_WEBP_BYTES);
    imgBlob = new Blob([Buffer.from(padded)]);
  } else {
    imgBlob = new Blob([Buffer.from(options.imageBytes || VALID_WEBP_BYTES)]);
  }

  let thmBlob: Blob;
  if (options.thumbSizePad) {
    const padded = new Uint8Array(options.thumbSizePad);
    padded.set(options.thumbBytes || VALID_WEBP_BYTES);
    thmBlob = new Blob([Buffer.from(padded)]);
  } else {
    thmBlob = new Blob([Buffer.from(options.thumbBytes || VALID_WEBP_BYTES)]);
  }

  formData.append("image", imgBlob, "image.webp");
  formData.append("thumb", thmBlob, "thumb.webp");
  formData.append("kind", options.kind || "POST");

  return new NextRequest("http://localhost:3000/api/images", {
    method: "POST",
    body: formData,
  });
}

describe("Image Upload Route Security & Validation Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(rateLimitLib, "rateLimit").mockResolvedValue({
      success: true,
      limit: 40,
      remaining: 39,
      resetSeconds: 86400,
    });
  });

  it("rejects unauthenticated requests for POST images", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce(null as any);

    const req = createUploadRequest({ kind: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("allows unauthenticated upload for ID_CARD during student registration", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce(null as any);
    vi.spyOn(rateLimitLib, "rateLimit").mockResolvedValueOnce({
      success: true,
      limit: 5,
      remaining: 4,
      resetSeconds: 3600,
    });

    vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce({ id: "system_guest" } as any);
    vi.spyOn(prisma.image, "create").mockResolvedValueOnce({
      id: "img_new_id_card",
      sizeBytes: 100,
    } as any);

    const req = createUploadRequest({ kind: "ID_CARD" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("img_new_id_card");
  });

  it("rejects PENDING status students from uploading POST photos", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce({
      user: { id: "user_pending", role: "STUDENT", status: "PENDING" },
    } as any);

    const req = createUploadRequest({ kind: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("pending verification");
  });

  it("rejects oversized full images exceeding 600 KB server cap", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce({
      user: { id: "user_verified", role: "STUDENT", status: "VERIFIED" },
    } as any);

    // 650 KB > 600 KB
    const req = createUploadRequest({
      kind: "POST",
      imageSizePad: 650 * 1024,
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toContain("exceeds maximum allowed server limit of 600 KB");
  });

  it("rejects oversized thumbnails exceeding 60 KB server cap", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce({
      user: { id: "user_verified", role: "STUDENT", status: "VERIFIED" },
    } as any);

    // 70 KB > 60 KB
    const req = createUploadRequest({
      kind: "POST",
      thumbSizePad: 70 * 1024,
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toContain("Thumbnail exceeds maximum allowed server limit of 60 KB");
  });

  it("rejects files with invalid magic bytes (e.g. disguised executables)", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce({
      user: { id: "user_verified", role: "STUDENT", status: "VERIFIED" },
    } as any);

    const req = createUploadRequest({
      kind: "POST",
      imageBytes: INVALID_BYTES,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid image format");
  });

  it("enforces daily upload limit cap (40 per day per user)", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValueOnce({
      user: { id: "user_verified", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(rateLimitLib, "rateLimit").mockResolvedValueOnce({
      success: false, // Rate limit tripped
      limit: 40,
      remaining: 0,
      resetSeconds: 86400,
    });

    const req = createUploadRequest({ kind: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Daily image upload limit reached");
  });
});
