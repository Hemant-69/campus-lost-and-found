import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      description: true,
      category: true,
      location: true,
      locationDetail: true,
      verificationDetail: true,
      status: true,
    },
  });

  if (!post) {
    notFound();
  }

  const isOwner = session.user.id === post.userId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="w-full px-4 sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <p className="font-hand text-2xl text-coral font-semibold">update pinned note</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Edit Post Details
        </h1>
        <p className="text-sm text-ink-soft">
          Update the description, category, or location information
        </p>
      </div>

      <div className="bg-surface rounded-card border-2.5 border-ink p-6 sm:p-8 lg:p-10 shadow-hard-card">
        <EditPostForm post={post as any} />
      </div>
    </div>
  );
}
