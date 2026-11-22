"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";

export async function addComment(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please sign in to join the discussion." };
    }

    const { id: userId, role, status, name } = session.user;

    if (role !== "ADMIN" && status !== "VERIFIED") {
      return {
        success: false,
        error: "Your account is pending verification. Only verified students can comment.",
      };
    }

    const rl = await rateLimit(`comment:user:${userId}`, 20, 3600);
    if (!rl.success) {
      return { success: false, error: "Comment rate limit reached (maximum 20 comments per hour)." };
    }

    const parsed = commentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid comment text.",
      };
    }

    const { postId, content, parentId } = parsed.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, title: true, status: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (post.status === "CLOSED" || post.status === "RETURNED") {
      return { success: false, error: "This post is closed. New comments are disabled." };
    }

    // Enforce max 1 level of replies
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true, authorId: true },
      });
      if (!parentComment) {
        return { success: false, error: "Parent comment not found." };
      }
      if (parentComment.parentId !== null) {
        return { success: false, error: "Only single-level replies are permitted." };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parentId || null,
      },
    });

    // Notifications
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parent && parent.authorId !== userId) {
        await createNotification({
          userId: parent.authorId,
          type: "COMMENT_REPLY",
          title: "Reply to Your Comment",
          message: `${name} replied to your comment on "${post.title}".`,
          link: `/posts/${postId}#comments`,
        });
      }
    } else if (post.userId !== userId) {
      await createNotification({
        userId: post.userId,
        type: "COMMENT_RECEIVED",
        title: "New Public Question",
        message: `${name} asked a question on "${post.title}".`,
        link: `/posts/${postId}#comments`,
      });
    }

    revalidateTag("posts");
    return { success: true, commentId: comment.id };
  } catch (error: any) {
    console.error("Add comment error:", error);
    return { success: false, error: "Failed to post comment." };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, postId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { success: false, error: "You can only delete your own comments." };
    }

    // Soft delete to maintain reply tree structure
    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, content: "[Comment removed by author]" },
    });

    revalidateTag("posts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete comment." };
  }
}
