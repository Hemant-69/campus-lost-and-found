import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { AccountStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: AccountStatus; department?: string };
}) {
  const where: any = { role: "STUDENT" };

  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.department) where.department = searchParams.department;
  if (searchParams.search?.trim()) {
    const q = searchParams.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { rollNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      department: true,
      year: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          claims: true,
          reportsReceived: true,
        },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Student Directory ({students.length})
        </h1>
        <p className="text-sm text-ink-soft">
          Browse registered students, check moderation records, and manage access privileges
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card">
        <table className="w-full text-left text-xs sm:text-sm text-ink divide-y-2 border-ink">
          <thead className="bg-paper font-serif font-bold text-ink border-b-2.5 border-ink">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Roll Number</th>
              <th className="p-4">Department &amp; Year</th>
              <th className="p-4">Status</th>
              <th className="p-4">Activity</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-paper">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-paper/40 transition">
                <td className="p-4 font-bold text-ink">
                  <div>{s.name}</div>
                  <div className="font-mono text-xs text-ink-soft font-normal">{s.email}</div>
                </td>
                <td className="p-4 font-mono font-bold text-ink">{s.rollNumber}</td>
                <td className="p-4 font-medium">
                  {s.department} (Yr {s.year})
                </td>
                <td className="p-4">
                  <StatusLabel status={s.status} />
                </td>
                <td className="p-4 text-xs font-semibold text-ink-soft">
                  {s._count.posts} posts &bull; {s._count.claims} claims
                  {s._count.reportsReceived > 0 && (
                    <span className="text-coral font-bold block">
                      {s._count.reportsReceived} reports
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs font-medium text-ink-soft">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="font-bold text-xs text-ink hover:text-coral underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-4">
        {students.map((s) => (
          <div key={s.id} className="bg-surface rounded-card border-2.5 border-ink p-5 shadow-hard-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">{s.name}</h3>
                <span className="font-mono text-xs text-ink-soft block">{s.email}</span>
                <span className="font-mono text-xs font-bold text-ink block mt-0.5">Roll: {s.rollNumber}</span>
              </div>
              <StatusLabel status={s.status} />
            </div>

            <div className="text-xs font-medium text-ink-soft flex justify-between pt-2 border-t border-paper">
              <span>{s.department} (Yr {s.year})</span>
              <span>{s._count.posts} posts &bull; {s._count.claims} claims</span>
            </div>

            <div className="pt-2 border-t border-paper flex justify-end">
              <Link
                href={`/admin/students/${s.id}`}
                className="font-bold text-xs text-ink hover:text-coral underline"
              >
                Manage Student &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
