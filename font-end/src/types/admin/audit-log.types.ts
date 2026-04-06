// =================================================================
// ADMIN AUDIT LOGS SPECIFIC TYPES
// These interfaces describe the data models for admin audit logs.
// =================================================================

/**
 * Enum for the different types of admin actions
 */
export enum AdminActionType {
  // User Actions
  UserDeactivated = "UserDeactivated",
  UserReactivated = "UserReactivated",
  UserPasswordForcedReset = "UserPasswordForcedReset",

  // Group Actions
  GroupCreated = "GroupCreated",
  GroupArchived = "GroupArchived",
  GroupUnarchived = "GroupUnarchived",
  GroupSoftDeleted = "GroupSoftDeleted",
  GroupOwnerChanged = "GroupOwnerChanged",
  GroupSettingsChanged = "GroupSettingsChanged",
  GroupMemberRoleChanged = "GroupMemberRoleChanged",
  GroupMemberRemoved = "GroupMemberRemoved",
  GroupUpdated = "GroupUpdated",
  GroupMemberAddedBySystem = "GroupMemberAddedBySystem",
  GroupRestored = "GroupRestored",
  GroupAvatarUpdated = "GroupAvatarUpdated",

  // Content Actions
  PostSoftDeleted = "PostSoftDeleted",
  PostRestored = "PostRestored",
  CommentDeletedByAdmin = "CommentDeletedByAdmin",

  // User Management Actions
  UserSoftDeleted = "UserSoftDeleted",
  UserRestored = "UserRestored",
  UserCreatedByAdmin = "UserCreatedByAdmin",
  UserUpdated = "UserUpdated",
  UserBioRemoved = "UserBioRemoved",
  UserAvatarRemoved = "UserAvatarRemoved",
  UserPasswordResetForced = "UserPasswordResetForced",
  UserRoleAssigned = "UserRoleAssigned",
  UserRoleRemoved = "UserRoleRemoved",

  // Role admin
  RoleCreated = "RoleCreated",
  RoleUpdated = "RoleUpdated",
  RoleDeleted = "RoleDeleted",

  // System Actions
  SettingsUpdated = "SettingsUpdated",
}

/**
 * Defines all possible entity types that can be the target of an admin action.
 */
export enum TargetEntityType {
  User = "User",
  Group = "Group",
  GroupMember = "GroupMember",
  Post = "Post",
  Role = "Role",
  Comment = "Comment",
  Setting = "Setting",
}

/**
 * The main DTO for a single audit log entry
 */
export interface AdminAuditLogDto {
  id: number;
  adminUserId: string; // Guid
  adminFullName: string;
  actionType: AdminActionType;
  targetEntityType: TargetEntityType; // Changed to enum
  targetEntityId: string;
  details?: string; // Can be a JSON string with more info
  timestamp: string; // ISO 8601 UTC string
  batchId?: string; // Added batch ID for grouping related actions
}

/**
 * Query parameters for getting audit logs
 */
export interface GetAdminAuditLogsParams {
  pageNumber?: number;
  pageSize?: number;
  adminId?: string; // Guid
  actionType?: AdminActionType;
  targetEntityType?: TargetEntityType; // Changed to enum
  targetEntityId?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  batchId?: string; // Added batch ID filter
}
