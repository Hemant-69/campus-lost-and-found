import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { SafeImage } from "@/components/image/SafeImage";
import { Button } from "@/components/ui/Button";
import { Mail, Hash, BookOpen, Calendar, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      idVerification: true,
      _count: {
        select: {
          posts: true,
          claims: true,
          sentMessages: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-hand text-2xl text-coral font-semibold">student identity</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Student Profile
          </h1>
          <p className="text-sm text-ink-soft">
            Your verified identity on the campus network
          </p>
        </div>
        <StatusLabel status={user.status} />
      </div>

      {user.status === "REJECTED" && (
        <div className="p-5 bg-blush border-2.5 border-ink rounded-card space-y-2 text-ink text-sm shadow-hard-btn">
          <div className="flex items-center gap-2 font-bold text-coral">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            <span className="uppercase tracking-wider">ID Verification Rejected</span>
          </div>
          <p className="font-medium">
            Reason: {user.idVerification?.rejectionReason || "Illegible or invalid student ID."}
          </p>
          <div className="pt-2">
            <Link href="/verify-pending">
              <Button variant="danger" size="sm">
                Re-upload ID Card Photo
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="bg-surface rounded-card border-2.5 border-ink p-6 sm:p-8 shadow-hard-card space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow border-2.5 border-ink text-ink flex items-center justify-center font-serif font-bold text-2xl shadow-hard-btn">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">{user.name}</h2>
            <p className="text-sm text-ink-soft font-semibold">{user.department} &bull; Year {user.year}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-paper text-sm">
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Mail className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span className="font-mono text-ink font-semibold">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Hash className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span className="font-mono font-bold text-ink">Roll: {user.rollNumber}</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <BookOpen className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span className="font-medium text-ink">{user.department}</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Calendar className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span className="font-medium text-ink">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Activity Counts */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-paper text-center">
          <div className="p-4 bg-paper border-2 border-ink rounded-input shadow-hard-btn">
            <span className="font-serif font-bold text-2xl text-ink block">{user._count.posts}</span>
            <span className="text-xs font-semibold text-ink-soft">Items Posted</span>
          </div>
          <div className="p-4 bg-paper border-2 border-ink rounded-input shadow-hard-btn">
            <span className="font-serif font-bold text-2xl text-ink block">{user._count.claims}</span>
            <span className="text-xs font-semibold text-ink-soft">Claims Filed</span>
          </div>
          <div className="p-4 bg-paper border-2 border-ink rounded-input shadow-hard-btn">
            <span className="font-serif font-bold text-2xl text-ink block">{user._count.sentMessages}</span>
            <span className="text-xs font-semibold text-ink-soft">Messages Sent</span>
          </div>
        </div>
      </div>

      {/* ID Card Verification Status Card */}
      <div className="bg-surface rounded-card border-2.5 border-ink p-6 sm:p-8 shadow-hard-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-ink">Student ID Verification Record</h3>
          <StatusLabel status={user.status} />
        </div>

        {user.idVerification?.imageId && (
          <div className="flex items-center gap-4 p-4 bg-paper rounded-input border-2 border-ink">
            <div className="w-20 h-14 rounded-input overflow-hidden bg-surface border border-ink shrink-0">
              <SafeImage
                imageId={user.idVerification.imageId}
                variant="thumb"
                alt="Student ID card"
              />
            </div>
            <div className="text-xs sm:text-sm text-ink-soft">
              <span className="font-bold block text-ink">Physical ID Card Registered</span>
              <span className="text-xs">
                Submitted on {new Date(user.idVerification.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
