import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { createNotification } from "@/lib/notifications";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized cron invocation", { status: 401 });
    }

    const now = new Date();

    // Find all expired claims in handover
    const expiredClaims = await prisma.claim.findMany({
      where: {
        status: "APPROVED",
        handoverCompletedAt: null,
        handoverDeadline: { lt: now },
      },
      include: {
        post: {
          select: { id: true, title: true, userId: true },
        },
      },
      take: 100, // Process in safe batch
    });

    let processedCount = 0;

    for (const claim of expiredClaims) {
      await prisma.$transaction(async (tx) => {
        // Reset post back to OPEN
        await tx.post.update({
          where: { id: claim.postId },
          data: { status: "OPEN" },
        });

        // Mark claim as NOT_SELECTED due to expiration
        await tx.claim.update({
          where: { id: claim.id },
          data: {
            status: "NOT_SELECTED",
            rejectionReason: "Handover period expired after 7 days.",
          },
        });
      });

      // Notify claimant
      await createNotification({
        userId: claim.claimantId,
        type: "HANDOVER_EXPIRED",
        title: "Handover Window Expired",
        message: `The 7-day handover deadline for "${claim.post.title}" expired. The post has been reopened for the community.`,
        link: `/posts/${claim.postId}`,
      });

      // Notify poster
      await createNotification({
        userId: claim.post.userId,
        type: "HANDOVER_EXPIRED",
        title: "Handover Expired - Item Reopened",
        message: `Handover for "${claim.post.title}" was not completed in time. Your post is now OPEN again for claims.`,
        link: `/posts/${claim.postId}`,
      });

      await createAuditLog({
        action: "HANDOVER_EXPIRED_CRON",
        targetType: "POST",
        targetId: claim.postId,
        details: { claimId: claim.id, claimantId: claim.claimantId },
      });

      processedCount++;
    }

    return NextResponse.json({
      status: "success",
      expiredHandoversProcessed: processedCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cron expire-handovers error:", error);
    return NextResponse.json(
      { error: "Failed to execute handover expiration job" },
      { status: 500 }
    );
  }
}
