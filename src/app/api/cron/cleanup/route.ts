import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized cron invocation", { status: 401 });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // 1. Delete unreferenced images older than 24 hours
    // An image is unreferenced if it has no postImage, no idVerification, no claimProof, and no messageAttachment
    const unreferencedImages = await prisma.image.findMany({
      where: {
        createdAt: { lt: twentyFourHoursAgo },
        postImages: { none: {} },
        idVerification: null,
        claimProofs: { none: {} },
        chatMessages: { none: {} },
      },
      select: { id: true },
      take: 200,
    });

    let deletedUnreferencedCount = 0;
    if (unreferencedImages.length > 0) {
      const ids = unreferencedImages.map((i) => i.id);
      const res = await prisma.image.deleteMany({
        where: { id: { in: ids } },
      });
      deletedUnreferencedCount = res.count;
    }

    // 2. Delete images of posts RETURNED or CLOSED more than 90 days ago
    const oldResolvedPosts = await prisma.post.findMany({
      where: {
        status: { in: ["RETURNED", "CLOSED"] },
        updatedAt: { lt: ninetyDaysAgo },
      },
      select: {
        images: {
          select: { imageId: true },
        },
      },
      take: 50,
    });

    const oldImageIds = oldResolvedPosts.flatMap((p) => p.images.map((img) => img.imageId));
    let deletedOldPostImagesCount = 0;
    if (oldImageIds.length > 0) {
      const res = await prisma.image.deleteMany({
        where: { id: { in: oldImageIds } },
      });
      deletedOldPostImagesCount = res.count;
    }

    // 3. Delete expired RateLimit rows
    const deletedRateLimits = await prisma.rateLimit.deleteMany({
      where: {
        windowStart: { lt: twentyFourHoursAgo },
      },
    });

    // 4. Delete read notifications older than 60 days
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: sixtyDaysAgo },
      },
    });

    return NextResponse.json({
      status: "success",
      deletedUnreferencedImages: deletedUnreferencedCount,
      deletedOldPostImages: deletedOldPostImagesCount,
      deletedRateLimitRows: deletedRateLimits.count,
      deletedOldNotifications: deletedNotifications.count,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to execute database cleanup job" },
      { status: 500 }
    );
  }
}
