"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Access denied. Administrator privileges required.");
  }
  return session.user;
}

export async function getAdminDashboardStats() {
  await assertAdmin();

  const [
    totalStudents,
    pendingVerifications,
    openPosts,
    returnedItems,
    openReports,
    storageAggregate,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.idVerification.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { status: "OPEN" } }),
    prisma.post.count({ where: { status: "RETURNED" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.image.aggregate({
      _sum: { sizeBytes: true },
      _count: { id: true },
    }),
  ]);

  const totalImageSizeBytes = storageAggregate._sum.sizeBytes || 0;
  const totalImageCount = storageAggregate._count.id || 0;

  // Simple aggregation of posts created over past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPosts = await prisma.post.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, type: true },
  });

  const dailyCounts: Record<string, { lost: number; found: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyCounts[key] = { lost: 0, found: 0 };
  }

  recentPosts.forEach((p) => {
    const key = p.createdAt.toISOString().split("T")[0];
    if (dailyCounts[key]) {
      if (p.type === "LOST") dailyCounts[key].lost++;
      else dailyCounts[key].found++;
    }
  });

  return {
    totalStudents,
    pendingVerifications,
    openPosts,
    returnedItems,
    openReports,
    totalImageSizeBytes,
    totalImageCount,
    chartData: Object.entries(dailyCounts).map(([date, counts]) => ({
      date,
      lost: counts.lost,
      found: counts.found,
    })),
  };
}

export async function reviewStudentVerification(params: {
  verificationId: string;
  action: "APPROVE" | "REJECT";
  rejectionReason?: string;
}) {
  const admin = await assertAdmin();

  const verification = await prisma.idVerification.findUnique({
    where: { id: params.verificationId },
    select: { id: true, userId: true },
  });

  if (!verification) {
    return { success: false, error: "Verification request not found." };
  }

  if (params.action === "APPROVE") {
    await prisma.$transaction(async (tx) => {
      await tx.idVerification.update({
        where: { id: verification.id },
        data: {
          status: "VERIFIED",
          reviewerId: admin.id,
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: verification.userId },
        data: { status: "VERIFIED" },
      });
    });

    await createNotification({
      userId: verification.userId,
      type: "VERIFICATION_APPROVED",
      title: "Student Verification Approved",
      message: "Your campus ID card has been verified. You now have full access to post, comment, claim, and message.",
      link: "/profile",
    });

    await createAuditLog({
      actorId: admin.id,
      action: "VERIFICATION_APPROVED",
      targetType: "USER",
      targetId: verification.userId,
    });
  } else {
    if (!params.rejectionReason?.trim()) {
      return { success: false, error: "A rejection reason is required for student feedback." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.idVerification.update({
        where: { id: verification.id },
        data: {
          status: "REJECTED",
          reviewerId: admin.id,
          rejectionReason: params.rejectionReason!.trim(),
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: verification.userId },
        data: { status: "REJECTED" },
      });
    });

    await createNotification({
      userId: verification.userId,
      type: "VERIFICATION_REJECTED",
      title: "Verification Needs Attention",
      message: `Your ID verification was rejected: ${params.rejectionReason}. Please re-upload a clear photograph of your ID card.`,
      link: "/verify-pending",
    });

    await createAuditLog({
      actorId: admin.id,
      action: "VERIFICATION_REJECTED",
      targetType: "USER",
      targetId: verification.userId,
      details: { reason: params.rejectionReason },
    });
  }

  return { success: true };
}

export async function toggleUserDisabled(userId: string, disabled: boolean, reason?: string) {
  const admin = await assertAdmin();

  if (userId === admin.id) {
    return { success: false, error: "Administrators cannot disable their own account." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: disabled ? "DISABLED" : "VERIFIED",
      disabledAt: disabled ? new Date() : null,
    },
  });

  await createAuditLog({
    actorId: admin.id,
    action: disabled ? "USER_DISABLED" : "USER_ENABLED",
    targetType: "USER",
    targetId: userId,
    details: { reason: reason || "Administrative action" },
  });

  return { success: true };
}

export async function moderatePost(params: {
  postId: string;
  action: "TAKEDOWN" | "RESTORE" | "DELETE";
  reason?: string;
}) {
  const admin = await assertAdmin();

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { id: true, userId: true, title: true },
  });

  if (!post) {
    return { success: false, error: "Post not found." };
  }

  if (params.action === "TAKEDOWN") {
    await prisma.post.update({
      where: { id: post.id },
      data: { isAutoHidden: true, status: "CLOSED" },
    });

    await createNotification({
      userId: post.userId,
      type: "POST_TAKEDOWN",
      title: "Post Moderated",
      message: `Your post "${post.title}" was removed by an administrator. Reason: ${params.reason || "Policy violation"}.`,
      link: "/my-posts",
    });

    await createAuditLog({
      actorId: admin.id,
      action: "POST_TAKEDOWN",
      targetType: "POST",
      targetId: post.id,
      details: { reason: params.reason },
    });
  } else if (params.action === "RESTORE") {
    await prisma.post.update({
      where: { id: post.id },
      data: { isAutoHidden: false, status: "OPEN" },
    });

    await createAuditLog({
      actorId: admin.id,
      action: "POST_RESTORED",
      targetType: "POST",
      targetId: post.id,
    });
  } else if (params.action === "DELETE") {
    await prisma.post.delete({
      where: { id: post.id },
    });

    await createAuditLog({
      actorId: admin.id,
      action: "POST_DELETED",
      targetType: "POST",
      targetId: post.id,
    });
  }

  revalidateTag("posts");
  return { success: true };
}

export async function resolveReport(params: {
  reportId: string;
  actionTaken: string;
  status: "REVIEWED" | "ACTIONED";
}) {
  const admin = await assertAdmin();

  await prisma.report.update({
    where: { id: params.reportId },
    data: {
      status: params.status,
      actionTaken: params.actionTaken.trim(),
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await createAuditLog({
    actorId: admin.id,
    action: "REPORT_RESOLVED",
    targetType: "REPORT",
    targetId: params.reportId,
    details: { actionTaken: params.actionTaken, status: params.status },
  });

  return { success: true };
}
