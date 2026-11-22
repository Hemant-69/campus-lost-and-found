import { prisma } from "@/lib/prisma";
import { VerificationQueueList } from "./VerificationQueueList";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const pendingQueue = await prisma.idVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          department: true,
          year: true,
        },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Student ID Card Verification Queue ({pendingQueue.length})
        </h1>
        <p className="text-sm text-ink-soft">
          Review student ID uploads to grant posting and messaging privileges
        </p>
      </div>

      <VerificationQueueList initialQueue={pendingQueue as any} />
    </div>
  );
}
