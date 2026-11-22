import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePostForm } from "./CreatePostForm";

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.status !== "VERIFIED" && session.user.role !== "ADMIN") {
    redirect("/verify-pending");
  }

  return (
    <div className="max-w-2xl mx-auto px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-6">
      <div className="space-y-1">
        <p className="font-hand text-2xl text-coral font-semibold">pin a new note</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Post an Item
        </h1>
        <p className="text-sm text-ink-soft">
          Post what you lost or what you picked up for the campus community
        </p>
      </div>

      <div className="bg-surface rounded-card border-2.5 border-ink p-6 sm:p-8 shadow-hard-card">
        <CreatePostForm />
      </div>
    </div>
  );
}
