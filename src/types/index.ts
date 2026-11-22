import {
  Role,
  AccountStatus,
  PostType,
  PostCategory,
  CampusLocation,
  PostStatus,
  ClaimStatus,
  ImageKind,
  ReportTargetType,
  ReportReason,
  ReportStatus,
  NotificationType,
} from "@prisma/client";

export {
  Role,
  AccountStatus,
  PostType,
  PostCategory,
  CampusLocation,
  PostStatus,
  ClaimStatus,
  ImageKind,
  ReportTargetType,
  ReportReason,
  ReportStatus,
  NotificationType,
};

export interface SafeUser {
  id: string;
  name: string;
  department: string;
  year?: number;
}

export interface PostFeedItem {
  id: string;
  type: PostType;
  title: string;
  category: PostCategory;
  location: CampusLocation;
  locationDetail: string;
  dateLostOrFound: string | Date;
  status: PostStatus;
  createdAt: string | Date;
  images: {
    imageId: string;
    sortOrder: number;
  }[];
  user: {
    name: string;
    department: string;
  };
}

export interface CompressionResult {
  fullBlob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
}
