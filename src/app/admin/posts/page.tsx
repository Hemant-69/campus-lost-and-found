import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { AdminPostActionButtons } from "./AdminPostActionButtons";

export const dynamic = "force-dynamic";

export default async function AdminPostsModerationPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      category: true,
      location: true,
      status: true,
      isAutoHidden: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, rollNumber: true },
      },
      _count: {
        select: { reports: true, claims: true },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Post Moderation ({posts.length})
        </h1>
        <p className="text-sm text-ink-soft">
          Review community posts, take down violating items, or restore hidden posts
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card">
        <table className="w-full text-left text-xs sm:text-sm text-ink divide-y-2 border-ink">
          <thead className="bg-paper font-serif font-bold text-ink border-b-2.5 border-ink">
            <tr>
              <th className="p-4">Item Post</th>
              <th className="p-4">Type &amp; Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Poster</th>
              <th className="p-4">Reports</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-paper">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-paper/40 transition">
                <td className="p-4 font-bold text-ink max-w-xs">
                  <Link href={`/posts/${p.id}`} className="hover:text-coral transition-colors underline truncate block">
                    {p.title}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="font-bold text-ink">{p.type}</span>
                  <span className="text-xs text-ink-soft block">{p.category}</span>
                </td>
                <td className="p-4 font-medium text-xs">
                  {p.location.replace(/_/g, " ")}
                </td>
                <td className="p-4">
                  <StatusLabel status={p.isAutoHidden ? "HIDDEN" : p.status} />
                </td>
                <td className="p-4 text-xs font-semibold text-ink-soft">
                  {p.user.name} ({p.user.rollNumber})
                </td>
                <td className="p-4 text-xs font-bold">
                  {p._count.reports > 0 ? (
                    <span className="text-coral">{p._count.reports} reports</span>
                  ) : (
                    <span className="text-ink-soft">0</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <AdminPostActionButtons
                    postId={p.id}
                    isAutoHidden={p.isAutoHidden}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-surface rounded-card border-2.5 border-ink p-5 shadow-hard-card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/posts/${p.id}`} className="font-serif font-bold text-lg text-ink hover:text-coral underline">
                {p.title}
              </Link>
              <StatusLabel status={p.isAutoHidden ? "HIDDEN" : p.status} />
            </div>

            <div className="text-xs font-medium text-ink-soft flex justify-between pt-1">
              <span>{p.type} &bull; {p.category}</span>
              <span>{p.location.replace(/_/g, " ")}</span>
            </div>

            <div className="text-xs font-semibold text-ink-soft flex justify-between pt-2 border-t border-paper">
              <span>Posted by {p.user.name}</span>
              {p._count.reports > 0 && (
                <span className="text-coral font-bold">{p._count.reports} reports</span>
              )}
            </div>

            <div className="pt-2 border-t border-paper flex justify-end">
              <AdminPostActionButtons
                postId={p.id}
                isAutoHidden={p.isAutoHidden}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
