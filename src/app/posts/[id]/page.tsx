import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ImageGallery } from "@/components/post/ImageGallery";
import { StatusLabel } from "@/components/ui/Badge";
import { CommentSection } from "@/components/post/CommentSection";
import { PostActionButtons } from "./PostActionButtons";
import { ClaimsTab } from "./ClaimsTab";
import { MapPin, Calendar, UserCheck, Shield, ArrowLeft } from "lucide-react";
import { formatISTDate } from "@/lib/date";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const { id } = params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
      images: {
        select: {
          imageId: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      comments: {
        select: {
          id: true,
          content: true,
          isDeleted: true,
          createdAt: true,
          parentId: true,
          author: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      claims: {
        select: {
          id: true,
          claimantId: true,
          description: true,
          verificationAnswer: true,
          proofImageId: true,
          status: true,
          rejectionReason: true,
          handoverCode: true,
          handoverDeadline: true,
          createdAt: true,
          claimant: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const currentUserId = session?.user?.id;
  const isPoster = currentUserId === post.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  const isVerified = session?.user?.status === "VERIFIED" || isAdmin;
  const canViewClaims = isPoster || isAdmin;

  // Active claim for handover
  const approvedClaim = post.claims.find((c) => c.status === "APPROVED");

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-10 space-y-8">
      {/* Back button & Status Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-coral transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-2">
          <StatusLabel status={post.type} />
          {post.status !== "OPEN" && <StatusLabel status={post.status} />}
        </div>
      </div>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ImageGallery images={post.images} title={post.title} />

        <div className="bg-surface border-2.5 border-ink rounded-card shadow-hard-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-coral uppercase tracking-wider block">
              {post.category.replace(/_/g, " ")}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              {post.title}
            </h1>
          </div>

          <div className="space-y-2.5 p-4 bg-paper border-2 border-ink rounded-input text-xs font-semibold text-ink-soft">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>
                <strong className="text-ink">{post.location.replace(/_/g, " ")}</strong> &bull; {post.locationDetail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>
                {post.type === "FOUND" ? "Found on: " : "Lost on: "}
                <strong className="text-ink">
                  {formatISTDate(post.dateLostOrFound, { month: "long" })}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-ink/20">
              <UserCheck className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>
                Reported by <strong className="text-ink">{post.user.name}</strong> ({post.user.department})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Description
            </h3>
            <p className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>
          </div>

          {/* Private Verification Detail: strictly visible only to poster and admin */}
          {(isPoster || isAdmin) && post.verificationDetail && (
            <div className="p-4 bg-blush border-2 border-ink rounded-input space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-coral">
                <Shield className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase tracking-wider">Private Verification Detail (Visible only to you and moderators)</span>
              </div>
              <p className="text-ink font-medium text-sm">{post.verificationDetail}</p>
            </div>
          )}

          {/* Action buttons (Claim, Reachout, Handover, Edit, Report) */}
          <PostActionButtons
            post={{
              id: post.id,
              userId: post.userId,
              type: post.type,
              status: post.status,
              title: post.title,
            }}
            currentUserId={currentUserId}
            isLoggedIn={!!session?.user}
            isVerified={isVerified}
            approvedClaimCode={approvedClaim?.handoverCode || undefined}
          />
        </div>
      </div>

      {/* Tabs / Bottom Sections: Claims (if poster/admin) & Comments */}
      <div className="pt-8 border-t-2 border-ink/20 space-y-10">
        {canViewClaims && post.type === "FOUND" && (
          <ClaimsTab
            postId={post.id}
            postTitle={post.title}
            claims={post.claims as any}
            postStatus={post.status}
          />
        )}

        <CommentSection
          postId={post.id}
          comments={post.comments as any}
          currentUserId={currentUserId}
          isLoggedIn={!!session?.user}
          isVerified={isVerified}
          isPostClosed={post.status === "CLOSED" || post.status === "RETURNED"}
        />
      </div>
    </div>
  );
}
