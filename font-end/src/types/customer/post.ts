// src/types/customer/post.ts
import { PagedResult } from "@/types/api.types";

/**
 * @description Represents the author information of a post
 */
export interface PostAuthorDto {
  userId: string; // Guid
  fullName: string;
  avatarUrl?: string | null;
}

/**
 * @description Represents a file attachment in a post
 */
export interface PostAttachmentDto {
  fileId: number;
  fileName: string;
  storageUrl: string;
  fileType?: string | null;
  fileSize: number; // long
}

/**
 * @description Represents a single post summary in a group's post list.
 * @response_from GET /api/v1/groups/{groupId}/posts
 */
export interface PostSummaryDto {
  postId: number;
  title?: string | null;
  content?: string | null;
  author: PostAuthorDto;
  likeCount: number;
  commentCount: number;
  createdAt: string; // ISO Date String
  isPinned: boolean;
  isLikedByCurrentUser: boolean;
  attachments: PostAttachmentDto[];

  // Permission Flags
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
}

/**
 * @description Query parameters for fetching group posts
 */
export interface GetGroupPostsParams {
  pageParam?: number;
  pageSize?: number;
  searchTerm?: string;
  authorId?: string;
  sortBy?: PostSortBy;
  myPostsOnly?: boolean;
}

/**
 * @description Available sorting options for posts
 */
export enum PostSortBy {
  Latest = "Latest",
  Oldest = "Oldest",
  MostLiked = "MostLiked",
  MostCommented = "MostCommented",
}

/**
 * @description Post action types for mutations
 */
export enum PostAction {
  Like = "Like",
  Unlike = "Unlike",
  Pin = "Pin",
  Unpin = "Unpin",
  Delete = "Delete",
}

export interface PostDetailDto {
  postId: number;
  title?: string | null;
  contentJson?: string | null;
  contentHtml?: string | null;
  author: {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPinned: boolean;
  isLikedByCurrentUser: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  attachments: PostAttachmentDto[];
  commentsPage: PagedResult<CommentDto>;
}

export interface CommentDto {
  commentId: number;
  content: string;
  author: {
    userId: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  replyCount: number;
  canEdit: boolean;
  canDelete: boolean;
}
