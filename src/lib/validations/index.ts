import { z } from "zod";
import { PostCategory, CampusLocation, ReportReason } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid college email address"),
  rollNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Roll number must be at least 3 characters")
    .max(20),
  department: z.string().trim().min(2, "Department is required").max(60),
  year: z.coerce.number().int().min(1).max(5),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  idCardImageId: z.string().min(1, "A photograph of your student ID card is mandatory"),
});

export const postCreateSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  category: z.nativeEnum(PostCategory),
  dateLostOrFound: z.coerce.date(),
  location: z.nativeEnum(CampusLocation),
  locationDetail: z.string().trim().min(2, "Specific location detail is required").max(150),
  verificationDetail: z.string().trim().max(500).optional(),
  imageIds: z.array(z.string()).min(1, "At least one photograph is required").max(4, "Maximum 4 photographs allowed"),
});

export const claimSubmitSchema = z.object({
  postId: z.string().min(1),
  description: z.string().trim().min(10, "Please describe the item in your own words").max(1500),
  verificationAnswer: z.string().trim().min(2, "Please answer the owner verification question").max(500),
  proofImageId: z.string().optional().nullable(),
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().trim().min(1, "Comment content cannot be empty").max(1000),
  parentId: z.string().optional().nullable(),
});

export const reportSchema = z.object({
  targetType: z.enum(["POST", "COMMENT", "USER"]),
  targetId: z.string().min(1),
  reason: z.nativeEnum(ReportReason),
  note: z.string().trim().max(500).optional(),
});
