import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateImageMagicBytes } from "@/lib/imageMagicBytes";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { imageStore } from "@/lib/imageStore";
import { ImageKind } from "@prisma/client";

const MAX_FULL_SIZE_BYTES = 600 * 1024; // 600 KB
const MAX_THUMB_SIZE_BYTES = 60 * 1024; // 60 KB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const clientIp = getClientIp();

    const formData = await req.formData();
    const fullFile = formData.get("image") as Blob | null;
    const thumbFile = formData.get("thumb") as Blob | null;
    const kind = formData.get("kind") as ImageKind | null;
    const widthParam = formData.get("width") as string | null;
    const heightParam = formData.get("height") as string | null;

    if (!fullFile || !thumbFile) {
      return NextResponse.json(
        { error: "Both full image and thumbnail are required." },
        { status: 400 }
      );
    }

    if (!kind || !["POST", "ID_CARD", "CLAIM_PROOF", "CHAT"].includes(kind)) {
      return NextResponse.json(
        { error: "Invalid image category specified." },
        { status: 400 }
      );
    }

    // Rate limiting & Authorization checks
    let ownerId: string;

    if (session?.user) {
      ownerId = session.user.id;

      // Rate limit logged in image uploads (40 per day per user)
      const rl = await rateLimit(`img_upload:user:${ownerId}`, 40, 86400);
      if (!rl.success) {
        return NextResponse.json(
          { error: "Daily image upload limit reached. You can upload up to 40 images per day." },
          { status: 429 }
        );
      }

      // Check account status permissions
      if (session.user.status === "DISABLED") {
        return NextResponse.json(
          { error: "Your account is disabled." },
          { status: 403 }
        );
      }

      // Only VERIFIED students or ADMINs can upload POST, CLAIM_PROOF, or CHAT images
      if (kind !== "ID_CARD" && session.user.role !== "ADMIN" && session.user.status !== "VERIFIED") {
        return NextResponse.json(
          { error: "Your account is pending verification. Only verified students can upload item or claim photos." },
          { status: 403 }
        );
      }
    } else {
      // Unauthenticated upload is strictly allowed ONLY for ID_CARD during registration
      if (kind !== "ID_CARD") {
        return NextResponse.json(
          { error: "Authentication required to upload this image type." },
          { status: 401 }
        );
      }

      // Strict IP rate limit for registration ID card uploads (5 per hour)
      const rl = await rateLimit(`reg_id_upload:ip:${clientIp}`, 5, 3600);
      if (!rl.success) {
        return NextResponse.json(
          { error: "Too many ID card upload attempts from this network. Please try again later." },
          { status: 429 }
        );
      }

      // Temporary placeholder ownerId for registration flow, rebound upon user creation
      ownerId = "registration_guest";
    }

    // Server-side strict size caps
    if (fullFile.size > MAX_FULL_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Full image exceeds maximum allowed server limit of 600 KB (received ${(
            fullFile.size / 1024
          ).toFixed(1)} KB). Please compress further.`,
        },
        { status: 413 }
      );
    }

    if (thumbFile.size > MAX_THUMB_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Thumbnail exceeds maximum allowed server limit of 60 KB (received ${(
            thumbFile.size / 1024
          ).toFixed(1)} KB).`,
        },
        { status: 413 }
      );
    }

    const fullBuffer = Buffer.from(await fullFile.arrayBuffer());
    const thumbBuffer = Buffer.from(await thumbFile.arrayBuffer());

    // Magic bytes verification on both full and thumb
    const fullValidation = validateImageMagicBytes(new Uint8Array(fullBuffer));
    if (!fullValidation.valid || !fullValidation.mimeType) {
      return NextResponse.json(
        { error: fullValidation.error || "Full image failed magic byte verification." },
        { status: 400 }
      );
    }

    const thumbValidation = validateImageMagicBytes(new Uint8Array(thumbBuffer));
    if (!thumbValidation.valid || !thumbValidation.mimeType) {
      return NextResponse.json(
        { error: thumbValidation.error || "Thumbnail failed magic byte verification." },
        { status: 400 }
      );
    }

    const width = widthParam ? parseInt(widthParam, 10) : 800;
    const height = heightParam ? parseInt(heightParam, 10) : 600;

    // Persist in Image table via abstraction
    // If ownerId is "registration_guest", we create a placeholder user if needed or assign to system
    let effectiveOwnerId = ownerId;
    if (ownerId === "registration_guest") {
      // Ensure system guest user exists
      let guestUser = await prisma.user.findUnique({
        where: { email: "guest-registration@campus.internal" },
        select: { id: true },
      });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: "Guest Registration System",
            email: "guest-registration@campus.internal",
            passwordHash: "system-internal-locked",
            rollNumber: "SYSTEM_GUEST_REG",
            department: "System",
            year: 1,
            role: "STUDENT",
            status: "DISABLED",
          },
          select: { id: true },
        });
      }
      effectiveOwnerId = guestUser.id;
    }

    const saved = await imageStore.saveImage({
      ownerId: effectiveOwnerId,
      kind,
      mimeType: fullValidation.mimeType,
      width,
      height,
      fullBuffer,
      thumbBuffer,
    });

    return NextResponse.json({
      id: saved.id,
      sizeBytes: saved.sizeBytes,
      width,
      height,
    });
  } catch (error: any) {
    console.error("Image upload handler error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing the image upload." },
      { status: 500 }
    );
  }
}
