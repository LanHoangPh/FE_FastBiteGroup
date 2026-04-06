// src/types/group.ts

import { UserPresenceStatus } from "@/types/customer/models";

/**
 * @description Defines the privacy level of a group.
 * @note Corresponds to the C# enum `EnumGroupPrivacy`.
 */
export enum EnumGroupPrivacy {
  Public = "Public", // Anyone can find and join
  Private = "Private", // Only able to join by invitation
}

/**
 * @description Alias for backward compatibility.
 */
export const GroupPrivacy = EnumGroupPrivacy;

/**
 * @description Defines the type of a group returned in the public list.
 * @note Corresponds to the C# enum `GroupTypeApiDto`. Must be string values.
 */
export enum GroupType {
  Private = "Private",
  Public = "Public",
  Community = "Community",
  Chat = "Chat",
}
/**
 * @description Defines the available filters for fetching groups.
 * @note Corresponds to the C# enum `MyGroupFilterType`.
 */
export enum GroupFilterType {
  All = "All",
  Chat = "Chat",
  Community = "Community",
}

/**
 * @description Defines the possible roles a user can have in a group.
 * @note Corresponds to the C# enum `GroupRole`.
 */
export enum GroupRole {
  Member = "Member",
  Moderator = "Moderator",
  Admin = "Admin",
}

/**
 * @description Represents a single public group in the discovery list.
 * @response_from GET /api/v1/groups/public
 */
export interface PublicGroupDto {
  groupId: string; // Guid
  groupName: string;
  description?: string | null;
  groupAvatarUrl: string;
  memberCount: number;
  groupType: GroupType; // Uses the string-based enum
}

/**
 * @description The successful response payload when joining a public group.
 * @response_from POST /api/v1/groups/{groupId}/join
 * @response_from POST /api/v1/link/{invitationCode}/accept
 */
export interface JoinGroupResponseDto {
  groupId: string; // Guid
  groupName?: string | null;
  defaultConversationId: number;
}

/**
 * @description Represents detailed information about a group for the group details page.
 * @response_from GET /api/v1/groups/{groupId}
 * @note This interface has been updated with new fields.
 */
export interface GroupDetailsDto {
  groupId: string; // Guid
  groupName: string;
  description?: string | null;
  groupAvatarUrl: string;
  memberCount: number;
  groupType: GroupType;

  // --- NEWLY ADDED FIELDS ---
  privacy: EnumGroupPrivacy;
  isArchived: boolean;
  canEdit: boolean;
  canArchive: boolean;
  canDelete: boolean;
  canInviteMembers: boolean;
  // -------------------------

  // These fields are still recommended for a complete implementation
  isCurrentUserMember?: boolean;
  currentUserRole?: GroupRole | null;
}

export interface GroupDetailsPreviewDto {
  groupId: string; // Guid
  groupName: string;
  description?: string | null;
  groupAvatarUrl: string;
  memberCount: number;
  groupType: GroupType;
  privacy: EnumGroupPrivacy;
}

/**
 * @description The request payload for adding a new member to a group.
 * @used_in POST /api/v1/groups/{groupId}/members
 */
export interface AddMemberRequestDto {
  userIdToAdd: string; // Guid of the user to be added
}

/**
 * @description The request payload for transferring group ownership and leaving.
 * @used_in POST /api/v1/groups/{groupId}/transfer-and-leave
 */
export interface TransferAndLeaveRequestDto {
  newAdminUserId: string; // Guid of the member to become the new admin
}

/**
 * @description Defines the available actions for managing a member's role.
 */
export enum ManageMemberAction {
  PromoteToModerator = "PromoteToModerator",
  DemoteToMember = "DemoteToMember",
}

/**
 * @description The request payload for changing a member's role.
 * @used_in PUT /api/v1/groups/{groupId}/members/{memberId}/role
 */
export interface ManageMemberRequestDto {
  action: ManageMemberAction;
}

/**
 * @description Represents a single member in the group member list.
 * @response_from GET /api/v1/groups/{groupId}/members
 * @note This interface has been updated with new permission flags.
 */
export interface GroupMemberListDto {
  userId: string; // Guid
  fullName: string;
  avatarUrl?: string | null;
  role: GroupRole; // e.g., "Admin", "Moderator", "Member"
  presenceStatus: UserPresenceStatus;
  joinedAt: string; // ISO Date String

  // --- NEWLY ADDED PERMISSION FLAGS ---
  canManageRole: boolean;
  canKick: boolean;
  // ------------------------------------
}

/**
 * @description Defines query parameters for fetching the member list.
 * @used_in GET /api/v1/groups/{groupId}/members
 */
export interface GetGroupMembersRequestParams {
  pageParam?: number;
  pageSize?: number;
  searchTerm?: string;
}

/**
 * @description The successful response payload after creating a new group.
 * @response_from POST /api/v1/groups/chat
 */
export interface CreateGroupResponseDto {
  groupId: string; // Guid
  groupName: string;
  defaultConversationId: number;
}

/**
 * @description The request payload for updating a group's text-based information.
 * @used_in PUT /api/v1/groups/{groupId}
 */
export interface UpdateGroupInfoDto {
  groupName: string;
  description?: string | null;
  privacy: EnumGroupPrivacy;
}

/**
 * @description The successful response payload after updating a group's avatar.
 * @response_from PUT /api/v1/groups/{groupId}/avatar
 */
export interface UpdateGroupAvatarResponseDto {
  newAvatarUrl: string;
}

/**
 * @description The request payload for sending invitations to a group.
 * @used_in POST /api/v1/groups/{groupId}/invitations
 */
export interface SendInvitationsRequestDto {
  invitedUserIds: string[]; // Array of user GUIDs
}

/**
 * @description The request payload for creating a new group invite link.
 * @used_in POST /api/v1/groups/{groupId}/invite-links
 */
export interface CreateInviteLinkDto {
  expiresInHours?: number | null;
  maxUses?: number | null;
}

/**
 * @description The successful response payload after creating an invite link.
 * @response_from POST /api/v1/groups/{groupId}/invite-links
 */
export interface InviteLinkDto {
  invitationCode: string;
}

/**
 * @description The public preview information for a group, fetched via an invite code.
 * @response_from GET /api/v1/link/{invitationCode}
 */
export interface GroupPreviewDto {
  groupId: string;
  groupName: string;
  groupAvatarUrl: string;
  memberCount: number;
}

/**
 * @description Represents a single group that is shared between the current user and another user.
 * @response_from GET /api/v1/users/{userId}/mutual-groups
 */
export interface MutualGroupDto {
  groupId: string; // Guid
  groupName: string;
  groupAvatarUrl?: string | null;
  /**
   * @description True if the current user has permission to kick the other user from this group.
   */
  canKickPartner: boolean;
}
