import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitClaim, reviewClaim, completeHandover } from "@/app/actions/claims";
import { GET as expireHandoversCron } from "@/app/api/cron/expire-handovers/route";
import * as authLib from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
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

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, resetSeconds: 3600 }),
}));

describe("Ownership Claim System Logic Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("enforces only one claim per student per post", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "student_1", role: "STUDENT", status: "VERIFIED" },
    } as any);

    // Mock post exists
    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_found_1",
      userId: "poster_student",
      status: "OPEN",
      type: "FOUND",
      title: "Found Watch",
    } as any);

    // Mock already claimed
    vi.spyOn(prisma.claim, "findUnique").mockResolvedValue({
      id: "existing_claim_1",
      postId: "post_found_1",
      claimantId: "student_1",
    } as any);

    const res = await submitClaim({
      postId: "post_found_1",
      description: "My watch with blue dial and steel strap",
      verificationAnswer: "Mountains wallpaper",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("already submitted an ownership claim");
  });

  it("prevents poster from claiming their own item", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "poster_student", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_found_1",
      userId: "poster_student",
      status: "OPEN",
      type: "FOUND",
    } as any);

    const res = await submitClaim({
      postId: "post_found_1",
      description: "My watch with blue dial and steel strap",
      verificationAnswer: "Wallpaper",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("cannot claim an item that you posted");
  });

  it("approval sets post to CLAIM_IN_PROGRESS, generates handover code, and auto-marks other pending claims as NOT_SELECTED", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "poster_student", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.claim, "findUnique").mockResolvedValue({
      id: "claim_to_approve",
      postId: "post_found_1",
      claimantId: "student_winner",
      post: {
        id: "post_found_1",
        userId: "poster_student",
        title: "Titan Watch",
        status: "OPEN",
      },
    } as any);

    let updatedClaimStatus = "";
    let updatedPostStatus = "";
    let autoRejectedOtherClaims = false;

    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const tx = {
        claim: {
          update: vi.fn().mockImplementation((args) => {
            updatedClaimStatus = args.data.status;
            return Promise.resolve(args);
          }),
          updateMany: vi.fn().mockImplementation((args) => {
            if (args.data.status === "NOT_SELECTED") {
              autoRejectedOtherClaims = true;
            }
            return Promise.resolve({ count: 2 });
          }),
        },
        post: {
          update: vi.fn().mockImplementation((args) => {
            updatedPostStatus = args.data.status;
            return Promise.resolve(args);
          }),
        },
      };
      return callback(tx);
    });

    const res = await reviewClaim({
      claimId: "claim_to_approve",
      action: "APPROVE",
    });

    expect(res.success).toBe(true);
    expect(updatedClaimStatus).toBe("APPROVED");
    expect(updatedPostStatus).toBe("CLAIM_IN_PROGRESS");
    expect(autoRejectedOtherClaims).toBe(true);
  });

  it("fails handover if an incorrect code is submitted", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "poster_student", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_found_1",
      userId: "poster_student",
      title: "Titan Watch",
      status: "CLAIM_IN_PROGRESS",
    } as any);

    vi.spyOn(prisma.claim, "findFirst").mockResolvedValue({
      id: "claim_approved",
      postId: "post_found_1",
      status: "APPROVED",
      handoverCode: "849201",
    } as any);

    // Wrong code: "111111" != "849201"
    const res = await completeHandover("post_found_1", "111111");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Incorrect 6-digit handover code");
  });

  it("succeeds handover with matching 6-digit code and marks post as RETURNED", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "poster_student", role: "STUDENT", status: "VERIFIED" },
    } as any);

    vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
      id: "post_found_1",
      userId: "poster_student",
      title: "Titan Watch",
      status: "CLAIM_IN_PROGRESS",
    } as any);

    vi.spyOn(prisma.claim, "findFirst").mockResolvedValue({
      id: "claim_approved",
      postId: "post_found_1",
      claimantId: "student_winner",
      status: "APPROVED",
      handoverCode: "849201",
    } as any);

    let finalPostStatus = "";
    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const tx = {
        claim: { update: vi.fn() },
        post: {
          update: vi.fn().mockImplementation((args) => {
            finalPostStatus = args.data.status;
            return Promise.resolve(args);
          }),
        },
      };
      return callback(tx);
    });

    const res = await completeHandover("post_found_1", "849201");
    expect(res.success).toBe(true);
    expect(finalPostStatus).toBe("RETURNED");
  });

  it("7-day expiry cron automatically returns post to OPEN and sets claim to NOT_SELECTED", async () => {
    const expiredDeadline = new Date(Date.now() - 1000);

    vi.spyOn(prisma.claim, "findMany").mockResolvedValue([
      {
        id: "expired_claim_1",
        postId: "post_found_1",
        claimantId: "claimant_1",
        status: "APPROVED",
        handoverCompletedAt: null,
        handoverDeadline: expiredDeadline,
        post: {
          id: "post_found_1",
          title: "Titan Watch",
          userId: "poster_1",
        },
      },
    ] as any);

    let revertedPostStatus = "";
    let expiredClaimStatus = "";

    vi.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const tx = {
        post: {
          update: vi.fn().mockImplementation((args) => {
            revertedPostStatus = args.data.status;
            return Promise.resolve(args);
          }),
        },
        claim: {
          update: vi.fn().mockImplementation((args) => {
            expiredClaimStatus = args.data.status;
            return Promise.resolve(args);
          }),
        },
      };
      return callback(tx);
    });

    const req = new NextRequest("http://localhost:3000/api/cron/expire-handovers", {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });

    const res = await expireHandoversCron(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.expiredHandoversProcessed).toBe(1);
    expect(revertedPostStatus).toBe("OPEN");
    expect(expiredClaimStatus).toBe("NOT_SELECTED");
  });
});
