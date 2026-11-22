"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";

export async function startPostConversation(postId: string, initialMessage?: string, photoImageId?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please sign in to message the poster." };
    }

    const currentUserId = session.user.id;

    if (session.user.status !== "VERIFIED" && session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Your account is awaiting ID verification. Only verified students can initiate messages.",
      };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, title: true, status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (post.userId === currentUserId) {
      return { success: false, error: "You cannot start a conversation with yourself." };
    }

    if (post.status === "CLOSED" || post.status === "RETURNED") {
      return { success: false, error: "This post is closed and no longer accepts messages." };
    }

    const u1 = currentUserId < post.userId ? currentUserId : post.userId;
    const u2 = currentUserId < post.userId ? post.userId : currentUserId;

    const conversation = await prisma.conversation.upsert({
      where: {
        postId_userOneId_userTwoId: {
          postId,
          userOneId: u1,
          userTwoId: u2,
        },
      },
      create: {
        postId,
        userOneId: u1,
        userTwoId: u2,
      },
      update: {
        lastMessageAt: new Date(),
      },
    });

    if (initialMessage && initialMessage.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: currentUserId,
          content: initialMessage.trim(),
          attachmentImageId: photoImageId || null,
        },
      });

      await createNotification({
        userId: post.userId,
        type: "NEW_MESSAGE",
        title: "New Message Received",
        message: `${session.user.name} sent you a message about "${post.title}".`,
        link: `/messages/${conversation.id}`,
      });
    }

    return { success: true, conversationId: conversation.id };
  } catch (error: any) {
    console.error("Start conversation error:", error);
    return { success: false, error: "Failed to open conversation." };
  }
}

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  attachmentImageId?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const currentUserId = session.user.id;

    const rl = await rateLimit(`msg_send:user:${currentUserId}`, 60, 60);
    if (!rl.success) {
      return { success: false, error: "Message rate limit reached. Please slow down." };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        post: {
          select: { status: true, title: true },
        },
        userOne: { select: { status: true } },
        userTwo: { select: { status: true } },
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found." };
    }

    const isParticipant =
      conversation.userOneId === currentUserId || conversation.userTwoId === currentUserId;
    if (!isParticipant) {
      return { success: false, error: "You are not a participant in this conversation." };
    }

    if (
      conversation.post.status === "CLOSED" ||
      conversation.post.status === "RETURNED" ||
      conversation.userOne.status === "DISABLED" ||
      conversation.userTwo.status === "DISABLED"
    ) {
      return {
        success: false,
        error: "This conversation is read-only because the post or user account is closed.",
      };
    }

    if (!params.content.trim() && !params.attachmentImageId) {
      return { success: false, error: "Cannot send an empty message." };
    }

    // Verify attachment if present
    if (params.attachmentImageId) {
      const img = await prisma.image.findUnique({
        where: { id: params.attachmentImageId },
        select: { id: true, ownerId: true, kind: true },
      });
      if (!img || img.ownerId !== currentUserId || img.kind !== "CHAT") {
        return { success: false, error: "Invalid image attachment." };
      }
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: currentUserId,
        content: params.content.trim(),
        attachmentImageId: params.attachmentImageId || null,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    const recipientId =
      conversation.userOneId === currentUserId
        ? conversation.userTwoId
        : conversation.userOneId;

    await createNotification({
      userId: recipientId,
      type: "NEW_MESSAGE",
      title: "New Message",
      message: `${session.user.name}: ${params.content.slice(0, 50)}...`,
      link: `/messages/${conversation.id}`,
    });

    return { success: true, messageId: msg.id };
  } catch (error: any) {
    console.error("Send message error:", error);
    return { success: false, error: "Failed to send message." };
  }
}
