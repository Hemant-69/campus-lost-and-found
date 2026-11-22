"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { postCreateSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit";
import { PostType, PostCategory, CampusLocation, PostStatus } from "@prisma/client";

export async function createPost(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Authentication required to publish a post." };
    }

    const { id: userId, role, status } = session.user;

    if (role !== "ADMIN" && status !== "VERIFIED") {
      return {
        success: false,
        error: "Your account is awaiting ID verification. Only verified students can create posts.",
      };
    }

    const rl = await rateLimit(`post_create:user:${userId}`, 10, 86400);
    if (!rl.success) {
      return {
        success: false,
        error: "Daily post creation limit reached (maximum 10 posts per day).",
      };
    }

    const parsed = postCreateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid post data provided.",
      };
    }

    const {
      type,
      title,
      description,
      category,
      dateLostOrFound,
      location,
      locationDetail,
      verificationDetail,
      imageIds,
    } = parsed.data;

    // Verify all images exist and belong to the user
    const userImages = await prisma.image.findMany({
      where: {
        id: { in: imageIds },
        ownerId: userId,
        kind: "POST",
      },
      select: { id: true },
    });

    if (userImages.length !== imageIds.length) {
      return {
        success: false,
        error: "One or more uploaded images could not be verified as yours.",
      };
    }

    const newPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          type,
          title,
          description,
          category,
          dateLostOrFound,
          location,
          locationDetail,
          verificationDetail: type === "FOUND" ? verificationDetail || null : null,
          userId,
          status: "OPEN",
        },
      });

      // Link images with sortOrder
      await tx.postImage.createMany({
        data: imageIds.map((imgId, idx) => ({
          postId: post.id,
          imageId: imgId,
          sortOrder: idx,
        })),
      });

      return post;
    });

    revalidateTag("posts");

    await createAuditLog({
      actorId: userId,
      action: "POST_CREATED",
      targetType: "POST",
      targetId: newPost.id,
      details: { type, title, category },
    });

    return {
      success: true,
      data: { postId: newPost.id },
    };
  } catch (error: any) {
    console.error("Create post error:", error);
    return { success: false, error: "Failed to create post. Please try again." };
  }
}

export async function updatePost(
  postId: string,
  input: {
    title: string;
    description: string;
    category: PostCategory;
    location: CampusLocation;
    locationDetail: string;
    verificationDetail?: string;
  }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, type: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const isOwner = post.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "You can only edit your own posts." };
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        location: input.location,
        locationDetail: input.locationDetail.trim(),
        verificationDetail:
          post.type === "FOUND" ? input.verificationDetail?.trim() || null : null,
      },
    });

    revalidateTag("posts");
    return { success: true };
  } catch (error: any) {
    console.error("Update post error:", error);
    return { success: false, error: "Failed to update post." };
  }
}

export async function closePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized." };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const isOwner = post.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Forbidden." };
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: "CLOSED" },
    });

    revalidateTag("posts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to close post." };
  }
}

export async function getPostsFeed(params: {
  cursor?: string;
  limit?: number;
  type?: PostType;
  category?: PostCategory;
  location?: CampusLocation;
  status?: PostStatus;
  search?: string;
}) {
  try {
    const limit = params.limit || 12;
    const where: any = {
      isAutoHidden: false,
    };

    if (params.type) where.type = params.type;
    if (params.category) where.category = params.category;
    if (params.location) where.location = params.location;
    if (params.status) where.status = params.status;

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { locationDetail: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.post.findMany({
      where,
      take: limit + 1,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      skip: params.cursor ? 1 : 0,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        type: true,
        title: true,
        category: true,
        location: true,
        locationDetail: true,
        dateLostOrFound: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        images: {
          select: {
            imageId: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id || null;
    }

    return {
      posts: items,
      nextCursor,
    };
  } catch (error: any) {
    console.error("Feed query error:", error);
    return { posts: [], nextCursor: null };
  }
}
