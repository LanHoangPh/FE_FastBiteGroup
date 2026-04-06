// src/lib/api/customer/groups.ts

import apiClient from "../apiClient";
import { PagedResult, ApiResponse } from "@/types/api.types";
import {
  PublicGroupDto,
  GroupFilterType,
  JoinGroupResponseDto,
  GroupDetailsDto,
  GroupDetailsPreviewDto,
  CreateGroupResponseDto,
  AddMemberRequestDto,
  GroupMemberListDto,
  GetGroupMembersRequestParams,
  TransferAndLeaveRequestDto,
  UpdateGroupInfoDto,
  UpdateGroupAvatarResponseDto,
  SendInvitationsRequestDto,
  CreateInviteLinkDto,
  InviteLinkDto,
  ManageMemberAction,
  ManageMemberRequestDto,
} from "@/types/customer/group";
import {
  PostSummaryDto,
  GetGroupPostsParams,
  PostSortBy,
} from "@/types/customer/post";
import { CreateCommunityGroupFormData } from "@/lib/schemas/customer/community.schema";
import { CreateCommunityGroupResponseDto } from "@/types/group";
import { UserSearchResultDto } from "@/types/customer/user.types";
import {
  CreateChatGroupFormData,
  UpdateGroupInfoFormData,
} from "@/lib/schemas/customer/group.schema";
import {
  SentGroupInvitationDto,
  GetSentInvitationsRequestParams,
} from "@/types/customer/invitation";
import {
  GroupReportedContentDto,
  GetPendingReportsRequestParams,
  ModerationActionDto,
  CreateContentReportDto,
} from "@/types/customer/moderation";

/**
 * Query parameters for fetching public groups
 */
export interface GetPublicGroupsParams {
  pageParam: number;
  searchTerm?: string;
  filterType?: GroupFilterType;
}

/**
 * Fetches a paginated list of public groups with optional search and filtering
 * @param params - Query parameters including page, search term, and filter type
 * @returns Promise<PagedResult<PublicGroupDto>>
 */
export async function getPublicGroups(
  params: GetPublicGroupsParams
): Promise<PagedResult<PublicGroupDto>> {
  const { pageParam, searchTerm, filterType } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: "12", // Fixed page size for discovery
  });

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  if (filterType && filterType !== GroupFilterType.All) {
    searchParams.append("filterType", filterType);
  }

  const response = await apiClient.get(
    `/groups/public?${searchParams.toString()}`
  );
  const apiResponse = response.data as ApiResponse<PagedResult<PublicGroupDto>>;
  return apiResponse.data;
}

/**
 * Fetches detailed information about a specific group
 * @param groupId - The unique identifier of the group
 * @returns Promise<GroupDetailsDto>
 */
export async function getGroupDetails(
  groupId: string
): Promise<GroupDetailsDto> {
  const response = await apiClient.get(`/groups/${groupId}`);
  const apiResponse = response.data as ApiResponse<GroupDetailsDto>;
  return apiResponse.data;
}

/**
 * Fetches detailed information about a specific group preview
 * @param groupId - The unique identifier of the group preview
 * @returns Promise<GroupDetailsDto>
 */
export async function getGroupDetailsPreview(
  groupId: string
): Promise<GroupDetailsPreviewDto> {
  const response = await apiClient.get(`/groups/${groupId}/preview`);
  const apiResponse = response.data as ApiResponse<GroupDetailsPreviewDto>;
  return apiResponse.data;
}

/**
 * Joins a public group
 * @param groupId - The unique identifier of the group to join
 * @returns Promise<JoinGroupResponseDto>
 */
export async function joinPublicGroup(
  groupId: string
): Promise<JoinGroupResponseDto> {
  const response = await apiClient.post(`/groups/${groupId}/join`);
  const apiResponse = response.data as ApiResponse<JoinGroupResponseDto>;
  return apiResponse.data;
}

/**
 * Creates a new chat group
 * @param formData - The group creation form data
 * @returns Promise<CreateGroupResponseDto>
 */
export async function createChatGroup(
  formData: CreateChatGroupFormData
): Promise<CreateGroupResponseDto> {
  const payload = new FormData();

  payload.append("groupName", formData.groupName);
  payload.append("groupType", formData.groupType.toString());

  if (formData.description) {
    payload.append("description", formData.description);
  }

  if (formData.avatarFile) {
    payload.append("avatarFile", formData.avatarFile);
  }

  const response = await apiClient.post("/groups/chat", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const apiResponse = response.data as ApiResponse<CreateGroupResponseDto>;
  return apiResponse.data;
}

/**
 * Search users for invitation to a group
 * @param params - Search parameters including groupId, query, and pagination
 * @returns Promise<PagedResult<UserSearchResultDto>>
 */
export async function searchUsersForInvite(params: {
  groupId: string;
  query?: string;
  pageParam: number;
  pageSize: number;
}): Promise<PagedResult<UserSearchResultDto>> {
  const { groupId, query, pageParam, pageSize } = params;

  const searchParams = new URLSearchParams({
    groupId,
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (query && query.trim()) {
    searchParams.append("query", query.trim());
  }

  const response = await apiClient.get(
    `/User/search-for-invite?${searchParams.toString()}`
  );

  const apiResponse = response.data as ApiResponse<
    PagedResult<UserSearchResultDto>
  >;
  return apiResponse.data;
}

/**
 * Send group invitations to multiple users
 * @param groupId - The group ID to send invitations for
 * @param payload - The send invitations request data
 * @returns Promise<void>
 */
export async function sendGroupInvitations(
  groupId: string,
  payload: SendInvitationsRequestDto
): Promise<void> {
  const response = await apiClient.post(
    `/groups/${groupId}/invitations`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Invite users to a group
 * @param groupId - The group ID to invite users to
 * @param userIds - Array of user IDs to invite
 * @returns Promise<void>
 */
export async function inviteUsersToGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/invite`, {
    userIds,
  });
}

/**
 * Add a member directly to a group (for admins/moderators)
 * @param groupId - The group ID to add the member to
 * @param payload - The add member request data
 * @returns Promise<void>
 */
export async function addMemberToGroup(
  groupId: string,
  payload: AddMemberRequestDto
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/members`, payload);
}

/**
 * Fetches a paginated list of group members with optional search
 * @param groupId - The group ID to fetch members for
 * @param params - Query parameters including search term and pagination
 * @returns Promise<PagedResult<GroupMemberListDto>>
 */
export async function getGroupMembers(
  groupId: string,
  params: GetGroupMembersRequestParams
): Promise<PagedResult<GroupMemberListDto>> {
  const { pageParam = 1, pageSize = 20, searchTerm } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  const response = await apiClient.get(
    `/groups/${groupId}/members?${searchParams.toString()}`
  );

  const apiResponse = response.data as ApiResponse<
    PagedResult<GroupMemberListDto>
  >;
  return apiResponse.data;
}

/**
 * Leave a group (standard flow)
 * @param groupId - The group ID to leave
 * @returns Promise<void>
 */
export async function leaveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/leave`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Transfer group ownership and leave (admin transfer flow)
 * @param groupId - The group ID to transfer ownership and leave
 * @param payload - The transfer request data containing new admin user ID
 * @returns Promise<void>
 */
export async function transferOwnershipAndLeave(
  groupId: string,
  payload: TransferAndLeaveRequestDto
): Promise<void> {
  const response = await apiClient.post(
    `/groups/${groupId}/transfer-and-leave`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Delete a group (destructive action)
 * @param groupId - The group ID to delete
 * @returns Promise<void>
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const response = await apiClient.delete(`/groups/${groupId}`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Archive a group
 * @param groupId - The group ID to archive
 * @returns Promise<void>
 */
export async function archiveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/archive`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Unarchive a group
 * @param groupId - The group ID to unarchive
 * @returns Promise<void>
 */
export async function unarchiveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/unarchive`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Update group information (name, description, privacy)
 * @param groupId - The group ID to update
 * @param payload - The update group info form data
 * @returns Promise<void>
 */
export async function updateGroupInfo(
  groupId: string,
  payload: UpdateGroupInfoFormData
): Promise<void> {
  const response = await apiClient.put(`/groups/${groupId}`, payload);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Update group avatar
 * @param groupId - The group ID to update avatar for
 * @param file - The image file to upload
 * @returns Promise<UpdateGroupAvatarResponseDto>
 */
export async function updateGroupAvatar(
  groupId: string,
  file: File
): Promise<UpdateGroupAvatarResponseDto> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.put(`/groups/${groupId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const apiResponse =
    response.data as ApiResponse<UpdateGroupAvatarResponseDto>;
  return apiResponse.data;
}

/**
 * Create an invite link for a group
 * @param groupId - The group ID to create invite link for
 * @param payload - The create invite link request data
 * @returns Promise<InviteLinkDto>
 */
export async function createInviteLink(
  groupId: string,
  payload: CreateInviteLinkDto
): Promise<InviteLinkDto> {
  const response = await apiClient.post(
    `/groups/${groupId}/invite-links`,
    payload
  );
  const apiResponse = response.data as ApiResponse<InviteLinkDto>;
  return apiResponse.data;
}

/**
 * Manage a member's role (promote or demote)
 * @param groupId - The group ID
 * @param memberId - The member ID to manage
 * @param payload - The manage member request data
 * @returns Promise<void>
 */
export async function manageMemberRole(
  groupId: string,
  memberId: string,
  payload: ManageMemberRequestDto
): Promise<void> {
  const response = await apiClient.put(
    `/groups/${groupId}/members/${memberId}/role`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Kick a member from the group
 * @param groupId - The group ID
 * @param userIdToKick - The user ID to kick from the group
 * @returns Promise<void>
 */
export async function kickMember(
  groupId: string,
  userIdToKick: string
): Promise<void> {
  const response = await apiClient.delete(
    `/groups/${groupId}/members/${userIdToKick}`
  );
  // DELETE endpoint returns 204 NoContent, no need to parse response
}

/**
 * Fetches a paginated list of posts for a specific group
 * @param groupId - The group ID to fetch posts for
 * @param params - Query parameters including pagination, search, and filters
 * @returns Promise<PagedResult<PostSummaryDto>>
 */
export async function getGroupPosts(
  groupId: string,
  params: GetGroupPostsParams
): Promise<PagedResult<PostSummaryDto>> {
  const {
    pageParam = 1,
    pageSize = 20,
    searchTerm,
    authorId,
    sortBy = PostSortBy.Latest,
    myPostsOnly = false,
  } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
    sortBy: sortBy.toString(),
  });

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  if (authorId) {
    searchParams.append("authorId", authorId);
  }

  if (myPostsOnly) {
    searchParams.append("myPostsOnly", "true");
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<PostSummaryDto>>
  >(`/groups/${groupId}/posts?${searchParams.toString()}`);
  return response.data.data;
}

/**
 * Create a new community group
 * @param data - Form data containing community information
 * @returns Promise<CreateCommunityGroupResponseDto>
 */
export async function createCommunityGroup(
  data: CreateCommunityGroupFormData
): Promise<CreateCommunityGroupResponseDto> {
  const formData = new FormData();

  formData.append("groupName", data.groupName);

  if (data.description) {
    formData.append("description", data.description);
  }

  formData.append("privacy", data.privacy);

  if (data.avatarFile) {
    formData.append("avatarFile", data.avatarFile);
  }

  const response = await apiClient.post<
    ApiResponse<CreateCommunityGroupResponseDto>
  >("/groups/community", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

/**
 * Get sent invitations for a group (for admins/moderators)
 * @param groupId - The group ID to fetch sent invitations for
 * @param params - Query parameters including pagination, status filter, and search
 * @returns Promise<PagedResult<SentGroupInvitationDto>>
 */
export async function getSentInvitationsForGroup(
  groupId: string,
  params: GetSentInvitationsRequestParams
): Promise<PagedResult<SentGroupInvitationDto>> {
  const { pageParam = 1, pageSize = 20, status, searchTerm } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (status) {
    searchParams.append("status", status);
  }

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<SentGroupInvitationDto>>
  >(`/groups/${groupId}/invitations/sent?${searchParams.toString()}`);

  console.log("[getSentInvitationsForGroup] Raw API Response:", response.data);

  if (!response.data || !response.data.data) {
    console.error(
      "[getSentInvitationsForGroup] Invalid API response structure:",
      response.data
    );
    throw new Error("Invalid API response structure");
  }

  return response.data.data;
}

/**
 * Revoke a sent invitation for a group (for admins/moderators)
 * @param groupId - The group ID
 * @param invitationId - The invitation ID to revoke
 * @returns Promise<void>
 */
export async function revokeInvitation(
  groupId: string,
  invitationId: number
): Promise<void> {
  const response = await apiClient.delete(
    `/groups/${groupId}/invitations/${invitationId}`
  );
  // DELETE endpoint returns 204 NoContent, no need to parse response
}

/**
 * Get pending reports for a group (for admins/moderators)
 * @param groupId - The group ID to fetch pending reports for
 * @param params - Query parameters including pagination, content type filter, and search
 * @returns Promise<PagedResult<GroupReportedContentDto>>
 */
export async function getPendingReports(
  groupId: string,
  params: GetPendingReportsRequestParams
): Promise<PagedResult<GroupReportedContentDto>> {
  const {
    pageParam = 1,
    pageSize = 20,
    contentType,
    reporterId,
    authorId,
    sortBy = "newest",
  } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
    sortBy: sortBy,
  });

  if (contentType) {
    searchParams.append("contentType", contentType);
  }

  if (reporterId) {
    searchParams.append("reporterId", reporterId);
  }

  if (authorId) {
    searchParams.append("authorId", authorId);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<GroupReportedContentDto>>
  >(`/groups/${groupId}/reports?${searchParams.toString()}`);

  if (!response.data || !response.data.data) {
    throw new Error("Invalid API response structure");
  }

  return response.data.data;
}

/**
 * Take a moderation action on a reported content (for admins/moderators)
 * @param groupId - The group ID
 * @param reportId - The report ID to take action on
 * @param payload - The moderation action request data
 * @returns Promise<void>
 */
export async function takeModerationAction(
  groupId: string,
  reportId: number,
  payload: ModerationActionDto
): Promise<void> {
  const response = await apiClient.post(
    `/groups/${groupId}/reports/${reportId}/action`,
    payload
  );
  // POST endpoint returns 204 NoContent, no need to parse response
}

/**
 * Report content (post or comment)
 * @param groupId - The group ID where the content exists
 * @param payload - The content report request data
 * @returns Promise<void>
 */
export async function reportContent(
  groupId: string,
  payload: CreateContentReportDto
): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/reports`, payload);
  // POST endpoint returns 204 NoContent, no need to parse response
}
