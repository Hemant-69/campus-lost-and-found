import { describe, it, expect, vi, beforeEach } from "vitest";
import { fileReport } from "@/app/actions/reports";
import * as authLib from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: "mock_audit_1" }),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, resetSeconds: 3600 }),
}));

describe("Report Logic Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated user from submitting a report", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue(null as any);

    const res = await fileReport({
      targetType: "POST",
      targetId: "post_123",
      reason: "SPAM",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("Please sign in");
  });

  it("prevents student from reporting their own profile", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "user_123", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "user_123",
    } as any);

    const res = await fileReport({
      targetType: "USER",
      targetId: "user_123",
      reason: "ABUSIVE",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("You cannot report your own profile");
  });

  it("enforces one report per user per target", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "student_a", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_target_1",
    } as any);

    // Mock existing report found
    vi.spyOn(prisma.report, "findFirst").mockResolvedValue({
      id: "existing_rep_1",
      reporterId: "student_a",
      postId: "post_target_1",
    } as any);

    const res = await fileReport({
      targetType: "POST",
      targetId: "post_target_1",
      reason: "SPAM",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("already filed a report for this item");
  });

  it("does not auto-hide post when count of reports is under 3", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "student_b", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_target_1",
    } as any);

    vi.spyOn(prisma.report, "findFirst").mockResolvedValue(null);
    vi.spyOn(prisma.report, "create").mockResolvedValue({
      id: "report_2",
      reporterId: "student_b",
      postId: "post_target_1",
    } as any);

    // 2 reports total
    vi.spyOn(prisma.report, "count").mockResolvedValue(2);
    const postUpdateSpy = vi.spyOn(prisma.post, "update").mockResolvedValue({} as any);

    const res = await fileReport({
      targetType: "POST",
      targetId: "post_target_1",
      reason: "INAPPROPRIATE",
    });

    expect(res.success).toBe(true);
    expect(postUpdateSpy).not.toHaveBeenCalled();
  });

  it("automatically auto-hides post on the 3rd report from distinct users", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "student_c", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_target_1",
    } as any);

    vi.spyOn(prisma.report, "findFirst").mockResolvedValue(null);
    vi.spyOn(prisma.report, "create").mockResolvedValue({
      id: "report_3",
      reporterId: "student_c",
      postId: "post_target_1",
    } as any);

    // 3 reports
    vi.spyOn(prisma.report, "count").mockResolvedValue(3);
    let updatedPostData: any = null;
    vi.spyOn(prisma.post, "update").mockImplementation((async (args: any) => {
      updatedPostData = args.data;
      return args;
    }) as any);

    const res = await fileReport({
      targetType: "POST",
      targetId: "post_target_1",
      reason: "SPAM",
    });

    expect(res.success).toBe(true);
    expect(updatedPostData).not.toBeNull();
    expect(updatedPostData.isAutoHidden).toBe(true);
  });
});
