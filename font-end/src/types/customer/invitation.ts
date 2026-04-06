/**
 * @description Represents a single pending group invitation in a user's list.
 * @response_from GET /api/v1/invitations/me
 */
export interface GroupInvitationDto {
  invitationId: number;
  groupName: string;
  groupAvatarUrl: string;
  invitedByName: string;
}

/**
 * @description The request payload for responding to an invitation.
 * @used_in POST /api/v1/invitations/{invitationId}/respond
 */
export interface RespondToInvitationDto {
  accept: boolean; // true to accept, false to decline
}

/**
 * @description Defines the possible statuses for a group invitation.
 * @note Corresponds to the C# enum `EnumInvitationStatus`.
 */
export enum InvitationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Declined = "Declined",
}

/**
 * @description Represents a single sent invitation record for a group.
 * @response_from GET /api/v1/groups/{groupId}/invitations/sent
 */
export interface SentGroupInvitationDto {
  invitationId: number;
  status: InvitationStatus;
  invitedAt: string; // ISO Date String

  // Invited User Info
  invitedUserId: string; // Guid
  invitedUserFullName: string;
  invitedUserAvatarUrl?: string | null;

  // Inviter Info
  invitedByUserId: string; // Guid
  invitedByFullName: string;
}

/**
 * @description Defines query parameters for fetching the sent invitations list.
 */
export interface GetSentInvitationsRequestParams {
  pageParam?: number;
  pageSize?: number;
  status?: InvitationStatus | null;
  searchTerm?: string;
}
