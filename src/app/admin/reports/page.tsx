import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { AdminReportActionButtons } from "./AdminReportActionButtons";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: { id: true, name: true, rollNumber: true },
      },
      post: {
        select: { id: true, title: true, userId: true },
      },
      comment: {
        select: { id: true, content: true, authorId: true, postId: true },
      },
      reportedUser: {
        select: { id: true, name: true, rollNumber: true },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          User Reports Queue ({reports.length})
        </h1>
        <p className="text-sm text-ink-soft">
          Investigate reported posts, comments, or users and enforce community safety rules
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No open reports"
          description="The community reporting queue is completely cleared. No items currently flagged."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card">
            <table className="w-full text-left text-xs sm:text-sm text-ink divide-y-2 border-ink">
              <thead className="bg-paper font-serif font-bold text-ink border-b-2.5 border-ink">
                <tr>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Report Reason &amp; Note</th>
                  <th className="p-4">Context / Content</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-paper">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/40 transition">
                    <td className="p-4 font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-paper border border-ink text-xs font-mono font-bold">
                        {r.targetType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-coral block">{r.reason}</span>
                      {r.note && <p className="text-xs text-ink-soft mt-1 font-medium">{r.note}</p>}
                    </td>
                    <td className="p-4 max-w-xs">
                      {r.post && (
                        <Link href={`/posts/${r.post.id}`} className="font-bold underline text-ink hover:text-coral truncate block">
                          Post: {r.post.title}
                        </Link>
                      )}
                      {r.comment && (
                        <p className="text-xs text-ink font-medium truncate">
                          Comment: &quot;{r.comment.content}&quot;
                        </p>
                      )}
                      {r.reportedUser && (
                        <p className="text-xs font-bold text-ink">
                          User: {r.reportedUser.name} ({r.reportedUser.rollNumber})
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-medium text-xs text-ink-soft">
                      {r.reporter.name} ({r.reporter.rollNumber})
                    </td>
                    <td className="p-4 text-xs font-medium text-ink-soft">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <AdminReportActionButtons
                        reportId={r.id}
                        targetType={r.targetType}
                        postId={r.postId || undefined}
                        commentId={r.commentId || undefined}
                        reportedUserId={r.reportedUserId || undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-surface rounded-card border-2.5 border-ink p-5 shadow-hard-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-paper border border-ink text-xs font-mono font-bold">
                    {r.targetType}
                  </span>
                  <span className="text-xs font-semibold text-ink-soft">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-coral text-sm block">{r.reason}</span>
                  {r.note && <p className="text-xs text-ink-soft mt-0.5">{r.note}</p>}
                </div>

                <div className="p-3 bg-paper rounded-input border border-ink text-xs font-medium">
                  {r.post && (
                    <Link href={`/posts/${r.post.id}`} className="font-bold underline text-ink hover:text-coral">
                      Post: {r.post.title}
                    </Link>
                  )}
                  {r.comment && (
                    <p className="text-xs text-ink">
                      Comment: &quot;{r.comment.content}&quot;
                    </p>
                  )}
                  {r.reportedUser && (
                    <p className="text-xs font-bold text-ink">
                      User: {r.reportedUser.name} ({r.reportedUser.rollNumber})
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-paper flex justify-end">
                  <AdminReportActionButtons
                    reportId={r.id}
                    targetType={r.targetType}
                    postId={r.postId || undefined}
                    commentId={r.commentId || undefined}
                    reportedUserId={r.reportedUserId || undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
