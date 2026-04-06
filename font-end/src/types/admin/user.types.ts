// =================================================================
// ADMIN USER MANAGEMENT SPECIFIC TYPES
// These interfaces describe the data models for admin user management.
// =================================================================

/**
 * Parameters for getting admin users list
 */
export interface GetUsersAdminParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

/**
 * DTO for admin user list item
 */
export interface AdminUserListItemDTO {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
  createdAt: string; // ISO 8601
  dateOfBirth?: string; // ISO 8601
  isActive: boolean;
  isDeleted: boolean;
  isCurrentUser: boolean;
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for admin user details
 */
export interface AdminUserDetailDto {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string; // ISO 8601
  isActive: boolean;
  isDeleted: boolean;
  roles: string[];
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
  stats: {
    groupMembershipCount: number;
    totalPostsCount: number;
  };
  groupMemberships: {
    groupId: string;
    groupName: string;
    userRoleInGroup: string;
  }[];
  recentPosts: {
    postId: number;
    title?: string;
    createdAt: string; // ISO 8601
    groupName: string;
    isDeleted: boolean;
  }[];
}

/**
 * User activity types
 */
export type UserActivityType = "Post" | "Comment" | "PostLike";

/**
 * Parameters for getting user activity
 */
export interface GetUserActivityParams {
  pageNumber?: number;
  pageSize?: number;
  activityType?: UserActivityType;
  groupId?: string;
}

/**
 * DTO for user activity
 */
export interface UserActivityDTO {
  activityType: UserActivityType;
  contentPreview: string;
  groupName: string;
  groupId: string;
  postId: number;
  createdAt: string; // ISO 8601
  url: string;
}

/**
 * DTO for creating user by admin
 */
export interface CreateUserByAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  roleName: string;
}

/**
 * DTO for updating user basic info
 */
export interface UpdateUserBasicInfoRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string; // ISO 8601
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for deactivating user
 */
export interface DeactivateUserRequestDto {
  reasonCategory: string;
  reasonDetails?: string;
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * Bulk user action types
 */
export type BulkUserActionType =
  | "Activate"
  | "Deactivate"
  | "SoftDelete"
  | "Restore"
  | "AssignRole";

/**
 * DTO for a user with version information for optimistic concurrency control
 */
export interface UserWithVersion {
  userId: string;
  rowVersion: string; // Base64 encoded string
}

/**
 * Request for bulk user actions
 */
export interface BulkUserActionRequest {
  action: BulkUserActionType;
  users: UserWithVersion[]; // Changed from userIds: string[] to support concurrency control
  roleName?: string; // Required when action is "AssignRole"
  reasonCategory?: string; // Required when action is "Deactivate"
  reasonDetails?: string; // Optional for "Deactivate"
}

/**
 * DTO for role assignment
 */
export interface RoleAssignmentDto {
  roleName: string;
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for activating user
 */
export interface ActivateUserRequestDto {
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for deleting user
 */
export interface DeleteUserRequestDto {
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for restoring user
 */
export interface RestoreUserRequestDto {
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for force password reset
 */
export interface ForcePasswordResetRequestDto {
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

/**
 * DTO for removing role from user
 */
export interface RemoveRoleRequestDto {
  roleName: string;
  rowVersion: string; // Base64 encoded string for optimistic concurrency control
}

// =================================================================
// ADMIN PROFILE TYPES
// These interfaces describe the data models for admin profile management.
// =================================================================

/**
 * Describes a single login history entry.
 */
export interface LoginHistoryDto {
  loginTimestamp: string;
  ipAddress?: string;
  userAgent?: string;
  wasSuccessful: boolean;
}

/**
 * Describes a single admin action log entry.
 */
export interface AdminActionLogDto {
  actionType: string;
  targetEntityType: string;
  targetEntityId: string;
  timestamp: string;
}

/**
 * The main DTO for the admin profile data returned from GET /api/v1/admin/users/me.
 */
export interface MyAdminProfileDto {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string; // ISO 8601 UTC string
  updateAt: string; // ISO 8601 UTC string

  // --- NEWLY ADDED FIELDS ---
  dateOfBirth: string; // ISO 8601 UTC string
  twoFactorEnabled: boolean;
  // --------------------------

  // Security Information
  lastLogin?: LoginHistoryDto;
  loginHistory: LoginHistoryDto[];
  recentActions: AdminActionLogDto[];
}

/**
 * The DTO for updating user profile information.
 */
export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 string
  bio?: string;
  twoFactorEnabled: boolean;
}

/**
 * The DTO for changing password.
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
