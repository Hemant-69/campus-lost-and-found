import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userOneId: currentUserId }, { userTwoId: currentUserId }],
      },
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        userOneId: true,
        userTwoId: true,
        lastMessageAt: true,
        post: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            images: {
              select: { imageId: true },
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
        userOne: {
          select: { id: true, name: true, department: true },
        },
        userTwo: {
          select: { id: true, name: true, department: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: currentUserId },
                isRead: false,
              },
            },
          },
        },
      },
    });

    const formatted = conversations.map((c) => {
      const otherUser = c.userOneId === currentUserId ? c.userTwo : c.userOne;
      const lastMsg = c.messages[0] || null;
      return {
        id: c.id,
        postId: c.post.id,
        postTitle: c.post.title,
        postType: c.post.type,
        postStatus: c.post.status,
        postThumbnailImageId: c.post.images[0]?.imageId || null,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          department: otherUser.department,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              isFromMe: lastMsg.senderId === currentUserId,
            }
          : null,
        unreadCount: c._count.messages,
        lastMessageAt: c.lastMessageAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Conversations route error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
