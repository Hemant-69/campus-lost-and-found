import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as cleanupCron } from "@/app/api/cron/cleanup/route";
import { GET as expireHandoversCron } from "@/app/api/cron/expire-handovers/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue({ id: "mock_notif_1" }),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: "mock_audit_1" }),
}));

describe("Cron Routes Authorization & Idempotency Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Cleanup Cron Route", () => {
    it("rejects unauthorized invocations lacking valid CRON_SECRET Bearer header", async () => {
      const unauthReq = new NextRequest("http://localhost:3000/api/cron/cleanup", {
        headers: { authorization: "Bearer invalid_secret" },
      });

      const res = await cleanupCron(unauthReq);
      expect(res.status).toBe(401);
      const text = await res.text();
      expect(text).toContain("Unauthorized cron invocation");
    });

    it("rejects requests missing the authorization header completely", async () => {
      const noAuthReq = new NextRequest("http://localhost:3000/api/cron/cleanup");
      const res = await cleanupCron(noAuthReq);
      expect(res.status).toBe(401);
    });

    it("executes successfully and is idempotent when run twice", async () => {
      const validReq = new NextRequest("http://localhost:3000/api/cron/cleanup", {
        headers: { authorization: `Bearer ${env.CRON_SECRET}` },
      });

      // Mock first run returns some items to clean
      vi.spyOn(prisma.image, "findMany").mockResolvedValueOnce([{ id: "orphan_1" }] as any);
      vi.spyOn(prisma.image, "deleteMany").mockResolvedValueOnce({ count: 1 });
      vi.spyOn(prisma.post, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.rateLimit, "deleteMany").mockResolvedValueOnce({ count: 5 });
      vi.spyOn(prisma.notification, "deleteMany").mockResolvedValueOnce({ count: 3 });

      const firstRun = await cleanupCron(validReq);
      expect(firstRun.status).toBe(200);
      const firstData = await firstRun.json();
      expect(firstData.status).toBe("success");
      expect(firstData.deletedUnreferencedImages).toBe(1);
      expect(firstData.deletedRateLimitRows).toBe(5);

      // Second run immediately after finds 0 items, succeeds without error
      vi.spyOn(prisma.image, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.post, "findMany").mockResolvedValueOnce([]);
      vi.spyOn(prisma.rateLimit, "deleteMany").mockResolvedValueOnce({ count: 0 });
      vi.spyOn(prisma.notification, "deleteMany").mockResolvedValueOnce({ count: 0 });

      const secondRun = await cleanupCron(validReq);
      expect(secondRun.status).toBe(200);
      const secondData = await secondRun.json();
      expect(secondData.status).toBe("success");
      expect(secondData.deletedUnreferencedImages).toBe(0);
      expect(secondData.deletedRateLimitRows).toBe(0);
    });
  });

  describe("Expire Handovers Cron Route", () => {
    it("rejects requests without CRON_SECRET", async () => {
      const unauthReq = new NextRequest("http://localhost:3000/api/cron/expire-handovers");
      const res = await expireHandoversCron(unauthReq);
      expect(res.status).toBe(401);
    });

    it("expires overdue handovers and is idempotent on repeat execution", async () => {
      const validReq = new NextRequest("http://localhost:3000/api/cron/expire-handovers", {
        headers: { authorization: `Bearer ${env.CRON_SECRET}` },
      });

      // First run: finds 1 expired handover
      vi.spyOn(prisma.claim, "findMany").mockResolvedValueOnce([
        {
          id: "claim_overdue_1",
          postId: "post_1",
          claimantId: "claimant_1",
          status: "APPROVED",
          post: { id: "post_1", title: "Backpack", userId: "poster_1" },
        },
      ] as any);

      vi.spyOn(prisma, "$transaction").mockResolvedValueOnce([{}, {}]);

      const res1 = await expireHandoversCron(validReq);
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.status).toBe("success");
      expect(data1.expiredHandoversProcessed).toBe(1);

      // Second run: no more overdue handovers
      vi.spyOn(prisma.claim, "findMany").mockResolvedValueOnce([]);

      const res2 = await expireHandoversCron(validReq);
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.status).toBe("success");
      expect(data2.expiredHandoversProcessed).toBe(0);
    });
  });
});
