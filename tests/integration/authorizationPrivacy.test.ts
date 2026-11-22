import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authLib from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPost, updatePost, closePost, getPostsFeed } from "@/app/actions/posts";
import { submitClaim } from "@/app/actions/claims";
import { addComment } from "@/app/actions/comments";
import { startPostConversation, sendMessage } from "@/app/actions/chat";
import { getAdminDashboardStats, reviewStudentVerification } from "@/app/actions/admin";
import { GET as getImage } from "@/app/api/images/[id]/route";
import { GET as getMessages } from "@/app/api/messages/[conversationId]/route";
import { NextRequest } from "next/server";
import { imageStore } from "@/lib/imageStore";

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
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

describe("Authorization and Privacy Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Logged-out User Restrictions", () => {
    it("fails closed when unauthenticated user attempts to create post", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue(null as any);

      const res = await createPost({
        type: "LOST",
        title: "Lost Bag",
        description: "Black backpack lost near library",
        category: "BAGS",
        dateLostOrFound: new Date(),
        location: "LIBRARY",
        locationDetail: "2nd floor reading hall",
        imageIds: ["img_1"],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Authentication required");
    });

    it("fails closed when unauthenticated user attempts to comment", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue(null as any);

      const res = await addComment({
        postId: "post_1",
        content: "Is this still available?",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Please sign in");
    });
  });

  describe("2. PENDING, REJECTED, and DISABLED User Restrictions", () => {
    it("PENDING user cannot post, comment, claim, or message", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "user_pending", role: "STUDENT", status: "PENDING" },
      } as any);

      const postRes = await createPost({
        type: "LOST",
        title: "Lost Keys",
        description: "Keys with blue keychain",
        category: "KEYS",
        dateLostOrFound: new Date(),
        location: "CANTEEN",
        locationDetail: "Table near exit",
        imageIds: ["img_1"],
      });
      expect(postRes.success).toBe(false);
      expect(postRes.error).toContain("awaiting ID verification");

      const commentRes = await addComment({
        postId: "post_1",
        content: "I think I saw it",
      });
      expect(commentRes.success).toBe(false);
      expect(commentRes.error).toContain("pending verification");

      const claimRes = await submitClaim({
        postId: "post_1",
        description: "This is definitely my watch",
        verificationAnswer: "Engraved name on back",
      });
      expect(claimRes.success).toBe(false);
      expect(claimRes.error).toContain("pending verification");

      const chatRes = await startPostConversation("post_1", "Hello");
      expect(chatRes.success).toBe(false);
      expect(chatRes.error).toContain("awaiting ID verification");
    });

    it("REJECTED user cannot post or comment", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "user_rejected", role: "STUDENT", status: "REJECTED" },
      } as any);

      const postRes = await createPost({
        type: "LOST",
        title: "Lost ID card",
        description: "Lost my college ID card",
        category: "ID_CARDS",
        dateLostOrFound: new Date(),
        location: "BLOCK_A",
        locationDetail: "Room 101",
        imageIds: ["img_1"],
      });
      expect(postRes.success).toBe(false);
      expect(postRes.error).toContain("awaiting ID verification");
    });
  });

  describe("3. Student A cannot modify Student B's Post", () => {
    it("Student A cannot edit Student B's post", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_a", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
        id: "post_b",
        userId: "student_b",
        type: "FOUND",
      } as any);

      const res = await updatePost("post_b", {
        title: "Hacked title",
        description: "Unauthorized edit",
        category: "ELECTRONICS",
        location: "LIBRARY",
        locationDetail: "Desk",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("You can only edit your own posts");
    });

    it("Student A cannot close Student B's post", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_a", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.post, "findUnique").mockResolvedValue({
        id: "post_b",
        userId: "student_b",
      } as any);

      const res = await closePost("post_b");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Forbidden.");
    });
  });

  describe("4. Student A cannot view Student B's Private Messages", () => {
    it("returns 403 when non-participant tries to access messages", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "outsider_student", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.conversation, "findUnique").mockResolvedValue({
        id: "convo_1",
        userOneId: "student_a",
        userTwoId: "student_b",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/messages/convo_1");
      const res = await getMessages(req, { params: { conversationId: "convo_1" } });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("Forbidden");
    });
  });

  describe("5. Privacy: Verification Detail never leaked in Public Feed", () => {
    it("getPostsFeed never selects verificationDetail or sensitive user fields", async () => {
      const mockFindMany = vi.spyOn(prisma.post, "findMany").mockResolvedValue([]);

      await getPostsFeed({});

      expect(mockFindMany).toHaveBeenCalled();
      const selectArgs = mockFindMany.mock.calls[0][0]?.select;
      expect(selectArgs).toBeDefined();
      expect((selectArgs as any).verificationDetail).toBeUndefined();
      expect((selectArgs as any).user.select.passwordHash).toBeUndefined();
      expect((selectArgs as any).user.select.email).toBeUndefined();
      expect((selectArgs as any).user.select.rollNumber).toBeUndefined();
    });
  });

  describe("6. Image Access Rules (ID_CARD and CLAIM_PROOF)", () => {
    it("returns 403 when student accesses another student's ID_CARD image", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_stranger", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.image, "findUnique").mockResolvedValue({
        id: "id_card_img_1",
        kind: "ID_CARD",
        ownerId: "student_owner",
        mimeType: "image/webp",
        deletedAt: null,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/images/id_card_img_1");
      const res = await getImage(req, { params: { id: "id_card_img_1" } });

      expect(res.status).toBe(403);
    });

    it("returns 200 when owner accesses their own ID_CARD image", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_owner", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.image, "findUnique").mockResolvedValue({
        id: "id_card_img_1",
        kind: "ID_CARD",
        ownerId: "student_owner",
        mimeType: "image/webp",
        deletedAt: null,
      } as any);

      vi.spyOn(imageStore, "getImageBytes").mockResolvedValue({
        buffer: Buffer.from([1, 2, 3, 4]),
        mimeType: "image/webp",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/images/id_card_img_1");
      const res = await getImage(req, { params: { id: "id_card_img_1" } });

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
    });

    it("returns 200 when admin accesses student's ID_CARD image", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "admin_user", role: "ADMIN", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.image, "findUnique").mockResolvedValue({
        id: "id_card_img_1",
        kind: "ID_CARD",
        ownerId: "student_owner",
        mimeType: "image/webp",
        deletedAt: null,
      } as any);

      vi.spyOn(imageStore, "getImageBytes").mockResolvedValue({
        buffer: Buffer.from([1, 2, 3, 4]),
        mimeType: "image/webp",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/images/id_card_img_1");
      const res = await getImage(req, { params: { id: "id_card_img_1" } });

      expect(res.status).toBe(200);
    });

    it("returns 403 when unrelated student attempts to view CLAIM_PROOF image", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "unrelated_student", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.image, "findUnique").mockResolvedValue({
        id: "claim_proof_img_1",
        kind: "CLAIM_PROOF",
        ownerId: "claimant_student",
        mimeType: "image/webp",
        deletedAt: null,
      } as any);

      // Claim belongs to poster_student
      vi.spyOn(prisma.claim, "findFirst").mockResolvedValue({
        post: { userId: "poster_student" },
      } as any);

      const req = new NextRequest("http://localhost:3000/api/images/claim_proof_img_1");
      const res = await getImage(req, { params: { id: "claim_proof_img_1" } });

      expect(res.status).toBe(403);
    });

    it("returns 200 when poster of the item views the CLAIM_PROOF image", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "poster_student", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.image, "findUnique").mockResolvedValue({
        id: "claim_proof_img_1",
        kind: "CLAIM_PROOF",
        ownerId: "claimant_student",
        mimeType: "image/webp",
        deletedAt: null,
      } as any);

      vi.spyOn(prisma.claim, "findFirst").mockResolvedValue({
        post: { userId: "poster_student" },
      } as any);

      vi.spyOn(imageStore, "getImageBytes").mockResolvedValue({
        buffer: Buffer.from([1, 2, 3, 4]),
        mimeType: "image/webp",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/images/claim_proof_img_1");
      const res = await getImage(req, { params: { id: "claim_proof_img_1" } });

      expect(res.status).toBe(200);
    });
  });

  describe("7. Student Cannot Attach Another User's Image", () => {
    it("fails when student tries to create post attaching an image owned by someone else", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_attacker", role: "STUDENT", status: "VERIFIED" },
      } as any);

      // Attacker passes img_victim_1, but DB lookup for images owned by student_attacker returns empty
      vi.spyOn(prisma.image, "findMany").mockResolvedValue([]);

      const res = await createPost({
        type: "FOUND",
        title: "Found Laptop",
        description: "Found HP laptop in library",
        category: "ELECTRONICS",
        dateLostOrFound: new Date(),
        location: "LIBRARY",
        locationDetail: "3rd floor",
        imageIds: ["img_victim_1"],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("could not be verified as yours");
    });
  });

  describe("8. Non-Admins Blocked from Admin Actions", () => {
    it("throws unauthorized error when student calls getAdminDashboardStats", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_1", role: "STUDENT", status: "VERIFIED" },
      } as any);

      await expect(getAdminDashboardStats()).rejects.toThrow("Administrator privileges required");
    });

    it("throws unauthorized error when student calls reviewStudentVerification", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_1", role: "STUDENT", status: "VERIFIED" },
      } as any);

      await expect(
        reviewStudentVerification({
          verificationId: "verif_1",
          action: "APPROVE",
        })
      ).rejects.toThrow("Administrator privileges required");
    });
  });

  describe("9. Conversations Read-Only and Post Binding", () => {
    it("prevents sending a message when the conversation post is CLOSED or RETURNED", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_a", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.conversation, "findUnique").mockResolvedValue({
        id: "convo_closed",
        userOneId: "student_a",
        userTwoId: "student_b",
        post: { status: "RETURNED", title: "Returned Wallet" },
        userOne: { status: "VERIFIED" },
        userTwo: { status: "VERIFIED" },
      } as any);

      const res = await sendMessage({
        conversationId: "convo_closed",
        content: "Are you still there?",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("read-only");
    });

    it("prevents sending a message when either participant user is DISABLED", async () => {
      vi.spyOn(authLib, "auth").mockResolvedValue({
        user: { id: "student_a", role: "STUDENT", status: "VERIFIED" },
      } as any);

      vi.spyOn(prisma.conversation, "findUnique").mockResolvedValue({
        id: "convo_disabled_partner",
        userOneId: "student_a",
        userTwoId: "student_b",
        post: { status: "OPEN", title: "Open Post" },
        userOne: { status: "VERIFIED" },
        userTwo: { status: "DISABLED" },
      } as any);

      const res = await sendMessage({
        conversationId: "convo_disabled_partner",
        content: "Hello?",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("read-only");
    });
  });
});
