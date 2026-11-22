import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <p className="font-hand text-2xl text-coral font-semibold">stay updated</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Notifications
        </h1>
        <p className="text-sm text-ink-soft">
          Updates on claims, questions, messages, and student verification
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When someone comments on your post, submits an ownership claim, or verifies your ID, you will receive updates here."
          action={{
            label: "Explore Notice Board",
            href: "/posts",
          }}
        />
      ) : (
        <div className="divide-y-2.5 divide-ink bg-surface rounded-card border-2.5 border-ink shadow-hard-card overflow-hidden">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link}
              className={`block p-5 sm:p-6 hover:bg-paper/60 transition ${
                !n.isRead ? "bg-note-yellow" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif font-bold text-base text-ink">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block shrink-0 border border-ink" />
                    )}
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">{n.message}</p>
                </div>
                <span className="text-xs font-semibold text-ink-soft shrink-0">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
