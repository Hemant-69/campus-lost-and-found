import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imageStore } from "@/lib/imageStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const imageMeta = await prisma.image.findUnique({
      where: { id },
      select: {
        id: true,
        kind: true,
        ownerId: true,
        mimeType: true,
        deletedAt: true,
      },
    });

    if (!imageMeta || imageMeta.deletedAt) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { kind, ownerId, mimeType } = imageMeta;
    const currentUserId = session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // Access control evaluation
    let isAllowed = false;

    if (isAdmin || ownerId === currentUserId) {
      isAllowed = true;
    } else if (kind === "ID_CARD") {
      isAllowed = false; // Strictly restricted to admin and owner
    } else if (kind === "CLAIM_PROOF") {
      // Allowed if viewer is the poster of the associated claim's post
      const claim = await prisma.claim.findFirst({
        where: { proofImageId: id },
        select: {
          post: {
            select: { userId: true },
          },
        },
      });
      if (claim && claim.post.userId === currentUserId) {
        isAllowed = true;
      }
    } else if (kind === "CHAT") {
      // Allowed if viewer is participant in the conversation
      const msg = await prisma.message.findFirst({
        where: { attachmentImageId: id },
        select: {
          conversation: {
            select: { userOneId: true, userTwoId: true },
          },
        },
      });
      if (msg && (msg.conversation.userOneId === currentUserId || msg.conversation.userTwoId === currentUserId)) {
        isAllowed = true;
      }
    } else if (kind === "POST") {
      // Allowed for any active logged-in student
      isAllowed = session.user.status !== "DISABLED";
    }

    if (!isAllowed) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const imageData = await imageStore.getImageBytes(id, "full");
    if (!imageData) {
      return new NextResponse("Image data not found", { status: 404 });
    }

    const cacheControl =
      kind === "ID_CARD" || kind === "CLAIM_PROOF"
        ? "private, no-store"
        : "private, max-age=31536000, immutable";

    return new NextResponse(new Uint8Array(imageData.buffer), {
      status: 200,
      headers: {
        "Content-Type": imageData.mimeType || mimeType || "image/webp",
        "Content-Length": imageData.buffer.length.toString(),
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
