import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InboxList } from "./InboxList";

export default async function MessagesInboxPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-6">
      <div className="space-y-1">
        <p className="font-hand text-2xl text-coral font-semibold">campus chat</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Messages
        </h1>
        <p className="text-sm text-ink-soft">
          Coordinate handovers and verify item inquiries safely
        </p>
      </div>

      <InboxList currentUserId={session.user.id} />
    </div>
  );
}
