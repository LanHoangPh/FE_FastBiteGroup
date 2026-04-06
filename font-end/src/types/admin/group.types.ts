// =================================================================
// ADMIN GROUP MANAGEMENT SPECIFIC TYPES
// These interfaces describe the data models for admin group management.
// =================================================================

/**
 * Enum for the different types of groups
 */
export type GroupType = "Public" | "Private" | "Community";
export type MyGroupFilterType = "All" | "Chat" | "Community";
export type EnumGroupPrivacy = "Public" | "Private";
/**
 * Enum for group status filter
 */
export type GroupStatusFilter = "Active" | "Archived" | "Deleted" | "All";

/**
 * Query parameters for getting groups in admin view
 */
export interface GetGroupsAdminParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  groupType?: MyGroupFilterType;
  status?: GroupStatusFilter;
}

/**
 * The main DTO for a group in the admin list view
 */
export interface GroupForListAdminDto {
  groupId: string; // Guid
  groupName: string;
  creatorName: string;
  memberCount: number;
  postCount: number;
  groupType: GroupType;
  privacy: EnumGroupPrivacy;
  isDeleted: boolean; // <-- ADDED
  isArchived: boolean;
  createdAt: string; // ISO 8601 UTC string
  lastActivityAt?: string; // ISO 8601 UTC string
  pendingReportsCount: number;
}

// =================================================================
// ADMIN GROUP DETAIL SPECIFIC TYPES
// These interfaces describe the data models for admin group detail page.
// =================================================================

/**
 * The main DTO for group details in admin view
 */
export interface AdminGroupDetailDTO {
  groupId: string;
  groupName: string;
  description?: string;
  groupAvatarUrl?: string;
  creatorName?: string;
  groupType: GroupType; // Added: group type for settings management
  createdAt: string; // ISO 8601
  isArchived: boolean;
  isDeleted: boolean;
  stats: {
    memberCount: number;
    postCount: number;
    pendingReportsCount: number;
    lastActivityAt?: string; // ISO 8601
  };
}

/**
 * DTO for group members in admin view
 */
export interface GroupAdminMemberDTO {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: "Admin" | "Moderator" | "Member";
  joinedAt: string; // ISO 8601
}

/**
 * DTO for posts in group admin view
 */
export interface PostForListDTO {
  postId: number;
  title?: string;
  authorId: string; // Guid
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string; // ISO 8601
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isDeleted: boolean;
}

/**
 * DTO for updating group information
 */
export interface UpdateGroupRequestDTO {
  groupName: string;
  description?: string;
}

/**
 * DTO for updating group settings
 */
export interface UpdateGroupSettingsDTO {
  groupType: GroupType;
}

/**
 * DTO for changing group owner
 */
export interface ChangeGroupOwnerDTO {
  newOwnerUserId: string;
}

/**
 * DTO for updating member role
 */
export interface UpdateMemberRoleDTO {
  newRole: "Admin" | "Moderator" | "Member";
}

/**
 * Query parameters for getting group members
 */
export interface GetGroupMembersParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: "Admin" | "Moderator" | "Member";
}

/**
 * Query parameters for getting group posts
 */
export interface GetGroupPostsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

/**
 * Describes the request for adding a member to a group.
 */
export interface AddMemberAdminRequest {
  userId: string; // Guid
  role?: "Member" | "Moderator" | "Admin";
}

/**
 * Describes the search query for finding users.
 */
export interface UserSearchQuery {
  query: string; // The search term for display name or email
  excludeGroupId?: string; // Guid - CRITICAL: Use this to find users NOT in the current group
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Describes a user search result.
 */
export interface UserSearchResultDTO {
  userId: string; // Guid
  displayName: string;
  email: string;
  avatarUrl?: string;
}

// =================================================================
// CREATE GROUP TYPES
// =================================================================

/**
 * For the POST request body when creating a new group as admin
 */
export interface CreateGroupAsAdminRequest {
  groupName: string;
  description?: string;
  groupType: GroupType;
  initialAdminUserIds: string[]; // Array of User GUIDs
}

/**
 * For the successful response body (201 Created) when creating a group
 */
export interface GroupDto {
  groupId: string;
  groupName: string;
  description?: string;
  groupType: GroupType;
  groupAvatarUrl?: string;
  createdByUserID: string;
  createdAt: string; // ISO 8601 string
  isChatEnabled: boolean;
  isPostsEnabled: boolean;
}

/**
 * Bulk group action types
 */
export type BulkGroupActionType =
  | "Archive"
  | "Unarchive"
  | "SoftDelete"
  | "Restore";

/**
 * Request for bulk group actions
 */
export interface BulkGroupActionRequest {
  action: BulkGroupActionType;
  groupIds: string[];
}

// Re-export the CreateGroupFormData type from the schema
export type { CreateGroupFormData } from "@/lib/schemas/group.schema";

// =================================================================
// GROUP MEMBER SEARCH TYPES
// =================================================================

/**
 * For the GET request query parameters when searching group members
 */
export interface SearchGroupMembersParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

/**
 * For each item in the group member search result list
 */
export interface GroupMemberSearchResultDto {
  userId: string; // Guid
  fullName: string;
  avatarUrl?: string;
  roleInGroup: "Admin" | "Moderator" | "Member";
}
