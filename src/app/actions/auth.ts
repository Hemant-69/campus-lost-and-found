"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit";

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function registerStudent(input: unknown): Promise<ActionResponse> {
  try {
    const clientIp = getClientIp();
    const rl = await rateLimit(`reg:ip:${clientIp}`, 5, 3600);
    if (!rl.success) {
      return {
        success: false,
        error: "Registration limit exceeded for this network. Please wait an hour before trying again.",
      };
    }

    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid registration submission.",
      };
    }

    const { name, email, rollNumber, department, year, password, idCardImageId } = parsed.data;

    // Check unique email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      return {
        success: false,
        error: "An account with this college email address already exists.",
      };
    }

    // Check unique roll number
    const existingRoll = await prisma.user.findUnique({
      where: { rollNumber },
      select: { id: true },
    });
    if (existingRoll) {
      return {
        success: false,
        error: "An account with this roll number already exists.",
      };
    }

    // Verify ID card image exists
    const idImage = await prisma.image.findUnique({
      where: { id: idCardImageId },
      select: { id: true, kind: true },
    });
    if (!idImage || idImage.kind !== "ID_CARD") {
      return {
        success: false,
        error: "Valid ID card image could not be verified. Please re-upload.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Atomically create user and verification record
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          rollNumber,
          department,
          year,
          passwordHash,
          role: "STUDENT",
          status: "PENDING",
        },
      });

      // Transfer ownership of image from guest to user
      await tx.image.update({
        where: { id: idCardImageId },
        data: { ownerId: user.id },
      });

      // Create ID Verification queue item
      await tx.idVerification.create({
        data: {
          userId: user.id,
          imageId: idCardImageId,
          status: "PENDING",
        },
      });

      return user;
    });

    await createAuditLog({
      actorId: newUser.id,
      action: "STUDENT_REGISTERED",
      targetType: "USER",
      targetId: newUser.id,
      details: { rollNumber, department, year },
      ipAddress: clientIp,
    });

    return {
      success: true,
      data: { userId: newUser.id },
    };
  } catch (error: any) {
    console.error("Student registration error:", error);
    return {
      success: false,
      error: "An error occurred while creating your account. Please try again.",
    };
  }
}

export async function reuploadIdVerification(newImageId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please sign in to re-submit your ID card." };
    }

    const userId = session.user.id;
    const clientIp = getClientIp();

    const rl = await rateLimit(`id_reupload:user:${userId}`, 5, 3600);
    if (!rl.success) {
      return { success: false, error: "Too many upload attempts. Please try again in an hour." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!user || user.status !== "REJECTED") {
      return { success: false, error: "Only rejected student accounts can re-upload verification documents." };
    }

    const image = await prisma.image.findUnique({
      where: { id: newImageId },
      select: { id: true, kind: true },
    });

    if (!image || image.kind !== "ID_CARD") {
      return { success: false, error: "Invalid ID card image." };
    }

    await prisma.$transaction(async (tx) => {
      // Re-bind image to this user
      await tx.image.update({
        where: { id: newImageId },
        data: { ownerId: userId },
      });

      // Reset user to PENDING
      await tx.user.update({
        where: { id: userId },
        data: { status: "PENDING" },
      });

      // Upsert IdVerification
      await tx.idVerification.upsert({
        where: { userId },
        update: {
          imageId: newImageId,
          status: "PENDING",
          reviewerId: null,
          rejectionReason: null,
          reviewedAt: null,
        },
        create: {
          userId,
          imageId: newImageId,
          status: "PENDING",
        },
      });
    });

    await createAuditLog({
      actorId: userId,
      action: "ID_CARD_REUPLOADED",
      targetType: "USER",
      targetId: userId,
      ipAddress: clientIp,
    });

    return { success: true };
  } catch (error: any) {
    console.error("ID reupload error:", error);
    return { success: false, error: "Failed to update verification status." };
  }
}
