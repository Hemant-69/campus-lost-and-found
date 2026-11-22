import { describe, it, expect } from "vitest";
import {
  registerSchema,
  postCreateSchema,
  claimSubmitSchema,
  commentSchema,
  reportSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const valid = {
        name: "Aarav Sharma",
        email: "aarav.s@college.edu",
        rollNumber: "21CS042",
        department: "Computer Science",
        year: 3,
        password: "securePassword123",
        idCardImageId: "img_valid_id_card",
      };
      const res = registerSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        name: "Aarav Sharma",
        email: "not-an-email",
        rollNumber: "21CS042",
        department: "Computer Science",
        year: 3,
        password: "securePassword123",
        idCardImageId: "img_valid_id_card",
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain("valid college email");
      }
    });

    it("rejects missing mandatory ID card photo", () => {
      const invalid = {
        name: "Aarav Sharma",
        email: "aarav.s@college.edu",
        rollNumber: "21CS042",
        department: "Computer Science",
        year: 3,
        password: "securePassword123",
        idCardImageId: "",
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain("mandatory");
      }
    });

    it("rejects short passwords under 6 characters", () => {
      const invalid = {
        name: "Aarav Sharma",
        email: "aarav.s@college.edu",
        rollNumber: "21CS042",
        department: "Computer Science",
        year: 3,
        password: "123",
        idCardImageId: "img_id",
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("rejects invalid academic years", () => {
      const invalid = {
        name: "Aarav Sharma",
        email: "aarav.s@college.edu",
        rollNumber: "21CS042",
        department: "Computer Science",
        year: 9, // Invalid year
        password: "securePassword123",
        idCardImageId: "img_id",
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("postCreateSchema", () => {
    it("accepts valid FOUND post data with verification detail", () => {
      const valid = {
        type: "FOUND",
        title: "Titan Analog Watch near Canteen",
        description: "Blue dial with brown leather strap found on staircase.",
        category: "OTHER",
        dateLostOrFound: "2026-11-20",
        location: "CANTEEN",
        locationDetail: "Main entrance stairs",
        verificationDetail: "Initials AS engraved on back casing",
        imageIds: ["img_post_1", "img_post_2"],
      };
      const res = postCreateSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects posts with zero images", () => {
      const invalid = {
        type: "LOST",
        title: "HP Laptop Charger",
        description: "Black 65W charger left in lab.",
        category: "ELECTRONICS",
        dateLostOrFound: "2026-11-20",
        location: "BLOCK_A",
        locationDetail: "Lab 203",
        imageIds: [], // Empty
      };
      const res = postCreateSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("rejects posts with more than 4 images", () => {
      const invalid = {
        type: "LOST",
        title: "Backpack",
        description: "Blue backpack with books.",
        category: "BAGS",
        dateLostOrFound: "2026-11-20",
        location: "LIBRARY",
        locationDetail: "Desk 4",
        imageIds: ["img1", "img2", "img3", "img4", "img5"],
      };
      const res = postCreateSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("rejects invalid campus locations", () => {
      const invalid = {
        type: "FOUND",
        title: "Keys",
        description: "Set of three brass keys.",
        category: "KEYS",
        dateLostOrFound: "2026-11-20",
        location: "INVALID_CAMPUS_LOCATION",
        locationDetail: "Somewhere",
        imageIds: ["img1"],
      };
      const res = postCreateSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("claimSubmitSchema", () => {
    it("accepts valid claim data", () => {
      const valid = {
        postId: "post_123",
        description: "This is my watch, it has a brown strap and blue dial.",
        verificationAnswer: "The wallpaper is a mountain photo",
        proofImageId: "img_proof_1",
      };
      const res = claimSubmitSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("accepts claim without optional proof image", () => {
      const valid = {
        postId: "post_123",
        description: "This is my watch, it has a brown strap and blue dial.",
        verificationAnswer: "The wallpaper is a mountain photo",
      };
      const res = claimSubmitSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects claims with empty verification answer", () => {
      const invalid = {
        postId: "post_123",
        description: "Description of item",
        verificationAnswer: " ", // Empty
      };
      const res = claimSubmitSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("commentSchema", () => {
    it("accepts valid comment", () => {
      const valid = {
        postId: "post_123",
        content: "Was this found near the reception desk?",
      };
      const res = commentSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("accepts valid reply with parentId", () => {
      const valid = {
        postId: "post_123",
        content: "Yes, right beside the entrance counter.",
        parentId: "comment_root_1",
      };
      const res = commentSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects empty comment content", () => {
      const invalid = {
        postId: "post_123",
        content: "   ",
      };
      const res = commentSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("reportSchema", () => {
    it("accepts valid report", () => {
      const valid = {
        targetType: "POST",
        targetId: "post_123",
        reason: "SPAM",
        note: "This user is advertising external products",
      };
      const res = reportSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects invalid report reason", () => {
      const invalid = {
        targetType: "USER",
        targetId: "user_123",
        reason: "INVALID_REASON",
      };
      const res = reportSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });
});
