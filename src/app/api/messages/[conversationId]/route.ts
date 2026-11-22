import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;
    const currentUserId = session.user.id;
    const sinceParam = req.nextUrl.searchParams.get("since");

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userOneId: true, userTwoId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (
      conversation.userOneId !== currentUserId &&
      conversation.userTwoId !== currentUserId &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whereClause: any = { conversationId };
    if (sinceParam) {
      const parsedDate = new Date(sinceParam);
      if (!isNaN(parsedDate.getTime())) {
        whereClause.createdAt = { gt: parsedDate };
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        content: true,
        attachmentImageId: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    // Mark unread messages sent by other participant as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Messages endpoint error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
