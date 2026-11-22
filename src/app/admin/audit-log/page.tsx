import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      actor: {
        select: { id: true, name: true, role: true, rollNumber: true },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Administrative &amp; System Audit Log ({logs.length})
        </h1>
        <p className="text-sm text-ink-soft">
          Immutable event log of security decisions, verifications, claims, and moderation actions
        </p>
      </div>

      <div className="bg-surface rounded-card border-2.5 border-ink overflow-x-auto shadow-hard-card">
        <table className="w-full text-left text-xs sm:text-sm text-ink divide-y-2 border-ink">
          <thead className="bg-paper font-serif font-bold text-ink border-b-2.5 border-ink">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action Event</th>
              <th className="p-4">Target Type &amp; ID</th>
              <th className="p-4">Audit Details</th>
              <th className="p-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-paper">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-paper/40 transition">
                <td className="p-4 font-mono text-xs text-ink-soft whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4 font-bold text-ink">
                  {log.actor ? (
                    <div>
                      <span>{log.actor.name}</span>
                      <span className="text-[10px] text-coral font-bold block uppercase tracking-wider">
                        {log.actor.role}
                      </span>
                    </div>
                  ) : (
                    <span className="text-ink-soft italic">System / Cron</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-paper border border-ink text-ink inline-block">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-ink-soft">
                  <span className="font-bold text-ink block">{log.targetType}</span>
                  <span className="text-[10px] block truncate max-w-[120px]">{log.targetId}</span>
                </td>
                <td className="p-4 text-xs font-medium max-w-sm truncate text-ink">
                  {log.details ? JSON.stringify(log.details) : "-"}
                </td>
                <td className="p-4 font-mono text-xs text-ink-soft">
                  {log.ipAddress || "Internal"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
