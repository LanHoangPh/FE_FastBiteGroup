import { GroupType, EnumGroupPrivacy as GroupPrivacy } from "@/types/customer/group";

/**
 * @description Defines the available filters for fetching the user's groups.
 */
export enum MyGroupFilterType {
  All = "All",
  Chat = "Chat",
  Community = "Community",
}

/**
 * @description Represents a single group in the list of groups the user has joined.
 * @response_from GET /api/v1/me/groups
 * @note This interface has been updated with new fields.
 */
export interface UserGroupDto {
  groupId: string;
  groupName: string;
  description?: string | null;
  avatarUrl?: string | null;
  groupType: GroupType;
  privacy: GroupPrivacy;
  conversationId: number; // Important for linking to the group's chat
  createdAt: string;
  
  // --- NEWLY ADDED FIELDS ---
  memberCount: number;
  isOwner: boolean;
  isAdmin: boolean;
  // -------------------------
}

/**
 * @description Defines query parameters for fetching the user's groups.
 */
export interface GetUserGroupsRequestParams {
  pageParam?: number;
  pageSize?: number;
  searchTerm?: string;
  filterType?: MyGroupFilterType;
}

/**
 * @description Detailed information about a specific group
 * @response_from GET /api/v1/groups/{groupId}
 */
export interface GroupDetailsDto {
  groupId: string;
  groupName: string;
  description?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  groupType: GroupType;
  privacy: GroupPrivacy;
  conversationId: number;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  canPost: boolean;
  canInvite: boolean;
  rules?: string | null;
  tags?: string[];
}

/**
 * @description Request parameters for fetching group posts
 */
export interface GetGroupPostsRequestParams {
  groupId: string;
  pageParam?: number;
  pageSize?: number;
  sortBy?: "newest" | "oldest" | "popular";
}

/**
 * @description Summary information for a post in a group
 * @response_from GET /api/v1/groups/{groupId}/posts
 */
export interface PostSummaryDto {
  postId: string;
  title: string;
  content: string;
  contentPreview: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  groupId: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isPinned: boolean;
  tags?: string[];
  attachments?: PostAttachmentDto[];
}

/**
 * @description Attachment information for posts
 */
export interface PostAttachmentDto {
  attachmentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string | null;
}

/**
 * @description The successful response payload after creating a new community group.
 * @response_from POST /api/v1/groups/community
 */
export interface CreateCommunityGroupResponseDto {
  groupId: string;
  groupName: string;
  defaultConversationId: number; // Will be 0 for communities
}
