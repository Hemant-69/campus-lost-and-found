"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { claimSubmitSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { createAuditLog } from "@/lib/audit";

export async function submitClaim(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please sign in to submit a claim." };
    }

    const { id: userId, role, status } = session.user;

    if (role !== "ADMIN" && status !== "VERIFIED") {
      return {
        success: false,
        error: "Your account is pending verification. Only verified students can claim items.",
      };
    }

    const rl = await rateLimit(`claim_submit:user:${userId}`, 10, 86400);
    if (!rl.success) {
      return { success: false, error: "Daily claim limit reached." };
    }

    const parsed = claimSubmitSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid claim submission.",
      };
    }

    const { postId, description, verificationAnswer, proofImageId } = parsed.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, status: true, type: true, title: true },
    });

    if (!post) {
      return { success: false, error: "Post does not exist." };
    }

    if (post.type !== "FOUND") {
      return { success: false, error: "Claims can only be filed on FOUND items." };
    }

    if (post.userId === userId) {
      return { success: false, error: "You cannot claim an item that you posted." };
    }

    if (post.status !== "OPEN") {
      return { success: false, error: "This item is no longer open for claims." };
    }

    // Verify proofImage belongs to user if provided
    if (proofImageId) {
      const img = await prisma.image.findUnique({
        where: { id: proofImageId },
        select: { id: true, ownerId: true, kind: true },
      });
      if (!img || img.ownerId !== userId || img.kind !== "CLAIM_PROOF") {
        return { success: false, error: "Proof image could not be verified." };
      }
    }

    // Check existing claim
    const existing = await prisma.claim.findUnique({
      where: {
        postId_claimantId: {
          postId,
          claimantId: userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "You have already submitted an ownership claim for this item." };
    }

    const claim = await prisma.claim.create({
      data: {
        postId,
        claimantId: userId,
        description,
        verificationAnswer,
        proofImageId: proofImageId || null,
        status: "PENDING",
      },
    });

    // Notify post author
    await createNotification({
      userId: post.userId,
      type: "CLAIM_RECEIVED",
      title: "New Ownership Claim",
      message: `Someone submitted a claim for "${post.title}". Check your claims tab.`,
      link: `/posts/${postId}?tab=claims`,
    });

    await createAuditLog({
      actorId: userId,
      action: "CLAIM_SUBMITTED",
      targetType: "CLAIM",
      targetId: claim.id,
      details: { postId },
    });

    revalidateTag("posts");
    return { success: true, data: { claimId: claim.id } };
  } catch (error: any) {
    console.error("Submit claim error:", error);
    return { success: false, error: "Failed to submit claim. Please try again." };
  }
}

export async function reviewClaim(params: {
  claimId: string;
  action: "APPROVE" | "REJECT" | "MORE_INFO";
  rejectionReason?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const claim = await prisma.claim.findUnique({
      where: { id: params.claimId },
      include: {
        post: {
          select: { id: true, userId: true, title: true, status: true },
        },
      },
    });

    if (!claim) {
      return { success: false, error: "Claim not found." };
    }

    const isPoster = claim.post.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isPoster && !isAdmin) {
      return { success: false, error: "Only the poster or an administrator can review claims." };
    }

    if (params.action === "APPROVE") {
      // Generate 6-digit random handover code
      const handoverCode = Math.floor(100000 + Math.random() * 900000).toString();
      const handoverDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await prisma.$transaction(async (tx) => {
        // Update this claim
        await tx.claim.update({
          where: { id: claim.id },
          data: {
            status: "APPROVED",
            handoverCode,
            handoverDeadline,
          },
        });

        // Set post to CLAIM_IN_PROGRESS
        await tx.post.update({
          where: { id: claim.postId },
          data: { status: "CLAIM_IN_PROGRESS" },
        });

        // Auto-mark other pending claims as NOT_SELECTED
        await tx.claim.updateMany({
          where: {
            postId: claim.postId,
            id: { not: claim.id },
            status: "PENDING",
          },
          data: {
            status: "NOT_SELECTED",
          },
        });
      });

      // Notify claimant
      await createNotification({
        userId: claim.claimantId,
        type: "CLAIM_APPROVED",
        title: "Ownership Claim Approved",
        message: `Your claim for "${claim.post.title}" was approved. Your handover code is ${handoverCode}. Arrange a safe meeting at the Security Office or Library desk.`,
        link: `/my-claims`,
      });

      await createAuditLog({
        actorId: session.user.id,
        action: "CLAIM_APPROVED",
        targetType: "CLAIM",
        targetId: claim.id,
        details: { postId: claim.postId, claimantId: claim.claimantId },
      });
    } else if (params.action === "REJECT") {
      await prisma.claim.update({
        where: { id: claim.id },
        data: {
          status: "REJECTED",
          rejectionReason: params.rejectionReason?.trim() || "Verification details did not match.",
        },
      });

      await createNotification({
        userId: claim.claimantId,
        type: "CLAIM_REJECTED",
        title: "Claim Decision Update",
        message: `Your claim for "${claim.post.title}" was not approved by the finder.`,
        link: `/posts/${claim.postId}`,
      });
    } else if (params.action === "MORE_INFO") {
      await prisma.claim.update({
        where: { id: claim.id },
        data: {
          status: "MORE_INFO_REQUESTED",
        },
      });

      // Ensure conversation exists between poster and claimant
      const u1 = session.user.id < claim.claimantId ? session.user.id : claim.claimantId;
      const u2 = session.user.id < claim.claimantId ? claim.claimantId : session.user.id;

      const conversation = await prisma.conversation.upsert({
        where: {
          postId_userOneId_userTwoId: {
            postId: claim.postId,
            userOneId: u1,
            userTwoId: u2,
          },
        },
        create: {
          postId: claim.postId,
          userOneId: u1,
          userTwoId: u2,
        },
        update: {},
      });

      // System message in chat
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: "I have reviewed your claim and would like to ask a few clarifying questions.",
        },
      });

      await createNotification({
        userId: claim.claimantId,
        type: "CLAIM_MORE_INFO",
        title: "More Info Requested",
        message: `The finder of "${claim.post.title}" has sent you a message regarding your claim.`,
        link: `/messages/${conversation.id}`,
      });

      return { success: true, conversationId: conversation.id };
    }

    revalidateTag("posts");
    return { success: true };
  } catch (error: any) {
    console.error("Review claim error:", error);
    return { success: false, error: "Failed to update claim." };
  }
}

export async function completeHandover(postId: string, enteredCode: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, title: true, status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const isPoster = post.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isPoster && !isAdmin) {
      return { success: false, error: "Only the poster can confirm handover completion." };
    }

    const activeClaim = await prisma.claim.findFirst({
      where: {
        postId,
        status: "APPROVED",
      },
    });

    if (!activeClaim || !activeClaim.handoverCode) {
      return { success: false, error: "No active approved claim with a handover code was found." };
    }

    if (activeClaim.handoverCode !== enteredCode.trim()) {
      return { success: false, error: "Incorrect 6-digit handover code. Please verify with the claimant." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.claim.update({
        where: { id: activeClaim.id },
        data: {
          handoverCompletedAt: new Date(),
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          status: "RETURNED",
        },
      });
    });

    // Notify claimant
    await createNotification({
      userId: activeClaim.claimantId,
      type: "CLAIM_APPROVED",
      title: "Item Returned Successfully",
      message: `Handover complete! "${post.title}" has been marked as returned.`,
      link: `/posts/${postId}`,
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "HANDOVER_COMPLETED",
      targetType: "POST",
      targetId: postId,
      details: { claimantId: activeClaim.claimantId },
    });

    revalidateTag("posts");
    return { success: true };
  } catch (error: any) {
    console.error("Handover error:", error);
    return { success: false, error: "Failed to complete handover." };
  }
}
