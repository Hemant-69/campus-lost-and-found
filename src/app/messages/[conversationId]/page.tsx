import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ArrowLeft } from "lucide-react";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUserId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
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
        select: { id: true, name: true, department: true, status: true },
      },
      userTwo: {
        select: { id: true, name: true, department: true, status: true },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const isUserOne = conversation.userOneId === currentUserId;
  const isUserTwo = conversation.userTwoId === currentUserId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isUserOne && !isUserTwo && !isAdmin) {
    notFound();
  }

  const otherUser = isUserOne ? conversation.userTwo : conversation.userOne;

  const isReadOnly =
    conversation.post.status === "CLOSED" ||
    conversation.post.status === "RETURNED" ||
    conversation.userOne.status === "DISABLED" ||
    conversation.userTwo.status === "DISABLED";

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-6 sm:py-8 space-y-4">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-ink hover:text-coral transition-colors"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Messages</span>
      </Link>

      <ChatContainer
        conversationId={conversation.id}
        currentUserId={currentUserId}
        otherUser={otherUser}
        post={{
          id: conversation.post.id,
          title: conversation.post.title,
          type: conversation.post.type,
          status: conversation.post.status,
          imageId: conversation.post.images[0]?.imageId,
        }}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
