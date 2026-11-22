import { prisma } from "./prisma";
import { ImageKind } from "@prisma/client";

export interface StoredImageMetadata {
  id: string;
  kind: ImageKind;
  ownerId: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: Date;
}

export interface ImageStoreProvider {
  saveImage(params: {
    ownerId: string;
    kind: ImageKind;
    mimeType: string;
    width: number;
    height: number;
    fullBuffer: Buffer;
    thumbBuffer: Buffer;
  }): Promise<{ id: string; sizeBytes: number }>;

  getImageBytes(
    id: string,
    variant: "full" | "thumb"
  ): Promise<{
    buffer: Buffer;
    mimeType: string;
    ownerId: string;
    kind: ImageKind;
  } | null>;

  deleteImage(id: string): Promise<boolean>;
}

/**
 * PostgreSQL bytea storage implementation.
 * Stores binary chunks directly in the database.
 * To migrate to external object storage (S3, Supabase Storage, or Vercel Blob),
 * replace or wrap this provider implementation without changing callers.
 */
class PostgresImageStore implements ImageStoreProvider {
  async saveImage(params: {
    ownerId: string;
    kind: ImageKind;
    mimeType: string;
    width: number;
    height: number;
    fullBuffer: Buffer;
    thumbBuffer: Buffer;
  }): Promise<{ id: string; sizeBytes: number }> {
    const record = await prisma.image.create({
      data: {
        ownerId: params.ownerId,
        kind: params.kind,
        mimeType: params.mimeType,
        width: params.width,
        height: params.height,
        sizeBytes: params.fullBuffer.length,
        data: params.fullBuffer,
        thumb: params.thumbBuffer,
      },
      select: {
        id: true,
        sizeBytes: true,
      },
    });

    return {
      id: record.id,
      sizeBytes: record.sizeBytes,
    };
  }

  async getImageBytes(
    id: string,
    variant: "full" | "thumb"
  ): Promise<{
    buffer: Buffer;
    mimeType: string;
    ownerId: string;
    kind: ImageKind;
  } | null> {
    if (variant === "thumb") {
      const record = await prisma.image.findUnique({
        where: { id },
        select: {
          thumb: true,
          mimeType: true,
          ownerId: true,
          kind: true,
          deletedAt: true,
        },
      });

      if (!record || record.deletedAt) return null;

      return {
        buffer: Buffer.from(record.thumb),
        mimeType: record.mimeType,
        ownerId: record.ownerId,
        kind: record.kind,
      };
    }

    const record = await prisma.image.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        ownerId: true,
        kind: true,
        deletedAt: true,
      },
    });

    if (!record || record.deletedAt) return null;

    return {
      buffer: Buffer.from(record.data),
      mimeType: record.mimeType,
      ownerId: record.ownerId,
      kind: record.kind,
    };
  }

  async deleteImage(id: string): Promise<boolean> {
    try {
      await prisma.image.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const imageStore = new PostgresImageStore();
