"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reportSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit";

export async function fileReport(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please sign in to submit a report." };
    }

    const currentUserId = session.user.id;

    const rl = await rateLimit(`report:user:${currentUserId}`, 10, 3600);
    if (!rl.success) {
      return { success: false, error: "Report submission limit reached. Please try again later." };
    }

    const parsed = reportSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid report submission.",
      };
    }

    const { targetType, targetId, reason, note } = parsed.data;

    let postId: string | null = null;
    let commentId: string | null = null;
    let reportedUserId: string | null = null;

    if (targetType === "POST") {
      postId = targetId;
      const post = await prisma.post.findUnique({ where: { id: targetId } });
      if (!post) return { success: false, error: "Target post does not exist." };
    } else if (targetType === "COMMENT") {
      commentId = targetId;
      const comment = await prisma.comment.findUnique({ where: { id: targetId } });
      if (!comment) return { success: false, error: "Target comment does not exist." };
    } else if (targetType === "USER") {
      reportedUserId = targetId;
      const user = await prisma.user.findUnique({ where: { id: targetId } });
      if (!user) return { success: false, error: "Target user does not exist." };
      if (reportedUserId === currentUserId) {
        return { success: false, error: "You cannot report your own profile." };
      }
    }

    // Check if user already reported this target
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: currentUserId,
        targetType,
        postId,
        commentId,
        reportedUserId,
      },
    });

    if (existing) {
      return { success: false, error: "You have already filed a report for this item." };
    }

    const report = await prisma.report.create({
      data: {
        reporterId: currentUserId,
        targetType,
        postId,
        commentId,
        reportedUserId,
        reason,
        note: note ? note.trim() : null,
        status: "OPEN",
      },
    });

    // Auto-hide post if it gets 3+ reports from distinct users
    if (targetType === "POST" && postId) {
      const distinctCount = await prisma.report.count({
        where: {
          postId,
          status: "OPEN",
        },
      });

      if (distinctCount >= 3) {
        await prisma.post.update({
          where: { id: postId },
          data: { isAutoHidden: true },
        });
        revalidateTag("posts");

        await createAuditLog({
          action: "POST_AUTO_HIDDEN",
          targetType: "POST",
          targetId: postId,
          details: { reason: "Received 3 or more user reports" },
        });
      }
    }

    await createAuditLog({
      actorId: currentUserId,
      action: "REPORT_FILED",
      targetType,
      targetId,
      details: { reason, targetType },
    });

    return { success: true, reportId: report.id };
  } catch (error: any) {
    console.error("File report error:", error);
    return { success: false, error: "Failed to submit report." };
  }
}
