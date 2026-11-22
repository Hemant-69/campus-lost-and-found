import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { SafeImage } from "@/components/image/SafeImage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { KeyRound, ShieldCheck, Clock, ExternalLink } from "lucide-react";

export default async function MyClaimsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const claims = await prisma.claim.findMany({
    where: { claimantId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          location: true,
          locationDetail: true,
          user: {
            select: { name: true, department: true },
          },
          images: {
            select: { imageId: true },
            take: 1,
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <p className="font-hand text-2xl text-coral font-semibold">your verification status</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          My Ownership Claims
        </h1>
        <p className="text-sm text-ink-soft">
          Track the status of your claims and view handover codes for approved items
        </p>
      </div>

      {claims.length === 0 ? (
        <EmptyState
          title="No active claims filed"
          description="When you spot an item that belongs to you on the notice board, tap 'This is mine' to submit a claim."
          action={{
            label: "Browse Notice Board",
            href: "/posts",
          }}
        />
      ) : (
        <div className="space-y-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className={`p-6 rounded-card border-2.5 border-ink bg-surface shadow-hard-card space-y-5 ${
                claim.status === "APPROVED" ? "ring-4 ring-sage" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-input overflow-hidden shrink-0 border-2.5 border-ink bg-paper shadow-hard-btn">
                    <SafeImage
                      imageId={claim.post.images[0]?.imageId}
                      variant="thumb"
                      alt={claim.post.title}
                    />
                  </div>
                  <div>
                    <Link
                      href={`/posts/${claim.post.id}`}
                      className="font-serif text-xl font-bold text-ink hover:text-coral transition-colors"
                    >
                      {claim.post.title}
                    </Link>
                    <p className="text-xs text-ink-soft mt-0.5">
                      Found by {claim.post.user.name} ({claim.post.user.department})
                    </p>
                  </div>
                </div>

                <StatusLabel status={claim.status} />
              </div>

              {/* Handover Code Ticket if APPROVED */}
              {claim.status === "APPROVED" && (
                <div className="relative p-6 bg-yellow border-2.5 border-ink rounded-card shadow-hard-btn space-y-4">
                  {/* Ticket Notch Decorations */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface border-r-2.5 border-ink" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface border-l-2.5 border-ink" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink font-bold text-xs uppercase tracking-wider">
                      <KeyRound className="w-4 h-4 stroke-[2.5]" />
                      <span>6-Digit Handover Verification Code</span>
                    </div>
                    {claim.handoverDeadline && (
                      <span className="text-xs font-semibold text-ink flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        Expires {new Date(claim.handoverDeadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="text-center py-2">
                    <span className="font-serif text-4xl sm:text-5xl font-bold tracking-[0.2em] text-ink bg-surface px-8 py-3 rounded-input border-2.5 border-ink inline-block shadow-hard-btn">
                      {claim.handoverCode}
                    </span>
                  </div>

                  <div className="text-xs text-ink flex items-start gap-2 pt-2 border-t-2 border-ink/20">
                    <ShieldCheck className="w-4 h-4 text-ink shrink-0 mt-0.5 stroke-[2.5]" />
                    <p>
                      <strong>Safe Handover Protocol:</strong> Meet the finder at the Campus Security Office or Central Library Front Desk. Give them this 6-digit code so they can verify and close the post.
                    </p>
                  </div>
                </div>
              )}

              {claim.status === "REJECTED" && claim.rejectionReason && (
                <div className="p-4 bg-blush border-2 border-ink rounded-input text-xs sm:text-sm text-ink space-y-1">
                  <strong className="block font-bold text-coral uppercase tracking-wider">Declined:</strong>
                  <span>{claim.rejectionReason}</span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-paper flex items-center justify-between text-xs text-ink-soft">
                <span>Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
                <Link href={`/posts/${claim.post.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-ink hover:text-coral">
                    View Post Details
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5 stroke-[2.5]" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
