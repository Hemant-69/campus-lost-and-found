import { prisma } from "./prisma";

export async function createAuditLog(params: {
  actorId?: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    const detailsString =
      typeof params.details === "object"
        ? JSON.stringify(params.details)
        : params.details;

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: detailsString || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
