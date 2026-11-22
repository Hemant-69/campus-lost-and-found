import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { SafeImage } from "@/components/image/SafeImage";
import { StudentModerationActions } from "./StudentModerationActions";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      idVerification: true,
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          createdAt: true,
        },
      },
      claims: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          post: { select: { title: true } },
        },
      },
      reportsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          reporter: { select: { name: true } },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-ink hover:text-coral transition-colors"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Student Directory</span>
      </Link>

      <div className="bg-surface rounded-card border-2.5 border-ink p-6 sm:p-8 shadow-hard-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">{student.name}</h1>
            <p className="text-sm text-ink-soft">
              {student.department} &bull; Year {student.year} &bull; Roll: {student.rollNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusLabel status={student.status} />
            <StudentModerationActions userId={student.id} status={student.status} />
          </div>
        </div>

        {/* ID Photo Record */}
        {student.idVerification?.imageId && (
          <div className="p-4 bg-paper rounded-input border-2 border-ink flex items-center gap-4">
            <div className="w-24 h-16 rounded-input overflow-hidden bg-surface border border-ink shrink-0">
              <SafeImage imageId={student.idVerification.imageId} variant="thumb" alt="ID photo" />
            </div>
            <div className="text-xs sm:text-sm space-y-0.5">
              <span className="font-bold text-ink block">Student ID Card on File</span>
              <span className="text-ink-soft block">
                Verification Status: {student.idVerification.status}
              </span>
              {student.idVerification.rejectionReason && (
                <span className="text-coral block font-medium">
                  Note: {student.idVerification.rejectionReason}
                </span>
              )}
            </div>
          </div>
        )}

        {/* History Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-2 border-paper">
          {/* Posts */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-ink">Recent Posts ({student.posts.length})</h3>
            {student.posts.length === 0 ? (
              <p className="text-xs text-ink-soft">No posts reported.</p>
            ) : (
              <div className="space-y-2">
                {student.posts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/posts/${p.id}`}
                    className="block p-3 rounded-input bg-paper border-2 border-ink text-xs font-semibold text-ink hover:text-coral transition"
                  >
                    <span className="truncate block">{p.title}</span>
                    <span className="text-[10px] text-ink-soft block mt-0.5">{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Claims */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-ink">Claims Filed ({student.claims.length})</h3>
            {student.claims.length === 0 ? (
              <p className="text-xs text-ink-soft">No claims submitted.</p>
            ) : (
              <div className="space-y-2">
                {student.claims.map((c) => (
                  <div key={c.id} className="p-3 rounded-input bg-paper border-2 border-ink text-xs">
                    <span className="font-bold text-ink block truncate">{c.post.title}</span>
                    <span className="text-[10px] text-ink-soft block mt-0.5">{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports Received */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-coral">Reports Received ({student.reportsReceived.length})</h3>
            {student.reportsReceived.length === 0 ? (
              <p className="text-xs text-ink-soft">Clean record. Zero flags.</p>
            ) : (
              <div className="space-y-2">
                {student.reportsReceived.map((r) => (
                  <div key={r.id} className="p-3 rounded-input bg-blush border-2 border-ink text-xs">
                    <span className="font-bold text-coral block">{r.reason}</span>
                    <span className="text-[10px] text-ink block mt-0.5">by {r.reporter.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
