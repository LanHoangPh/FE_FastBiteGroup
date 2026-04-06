import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  GetGroupsAdminParams,
  GroupForListAdminDto,
  AdminGroupDetailDTO,
  UpdateGroupRequestDTO,
  UpdateGroupSettingsDTO,
  ChangeGroupOwnerDTO,
  GroupAdminMemberDTO,
  GetGroupMembersParams,
  PostForListDTO,
  GetGroupPostsParams,
  UpdateMemberRoleDTO,
  AddMemberAdminRequest,
  UserSearchQuery,
  UserSearchResultDTO,
  BulkGroupActionRequest,
  CreateGroupAsAdminRequest,
  GroupDto,
  SearchGroupMembersParams,
  GroupMemberSearchResultDto,
} from "@/types/admin/group.types";

// ===============================
// ADMIN GROUP MANAGEMENT API FUNCTIONS
// ===============================

// Get Groups for Admin Management
export const getAdminGroups = async (params: GetGroupsAdminParams) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.searchTerm) {
    queryParams.append("searchTerm", params.searchTerm);
  }
  if (params.groupType) {
    queryParams.append("groupType", params.groupType);
  }
  if (params.status) {
    queryParams.append("status", params.status);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<GroupForListAdminDto>>
  >(`/admin/groups?${queryParams.toString()}`);
  return response.data;
};

// Create New Group as Admin
export const createAdminGroup = async (data: CreateGroupAsAdminRequest) => {
  const response = await apiClient.post<ApiResponse<GroupDto>>(
    "/admin/groups",
    data
  );
  return response.data;
};

// ===============================
// ADMIN GROUP DETAIL API FUNCTIONS
// ===============================

// Get Group Details
export const getAdminGroupDetail = async (groupId: string) => {
  const response = await apiClient.get<ApiResponse<AdminGroupDetailDTO>>(
    `/admin/groups/${groupId}`
  );
  return response.data;
};

// Update Group Information
export const updateAdminGroup = async (
  groupId: string,
  data: UpdateGroupRequestDTO
) => {
  const response = await apiClient.put<ApiResponse<AdminGroupDetailDTO>>(
    `/admin/groups/${groupId}`,
    data
  );
  return response.data;
};

// Update Group Avatar
export const updateAdminGroupAvatar = async (groupId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
    `/admin/groups/${groupId}/avatar`,
    formData
  );
  return response.data;
};

// Archive Group
export const archiveAdminGroup = async (groupId: string) => {
  const response = await apiClient.patch<ApiResponse<object>>(
    `/admin/groups/${groupId}/archive`
  );
  return response.data;
};

// Unarchive Group
export const unarchiveAdminGroup = async (groupId: string) => {
  const response = await apiClient.patch<ApiResponse<object>>(
    `/admin/groups/${groupId}/unarchive`
  );
  return response.data;
};

// Restore Group
export const restoreAdminGroup = async (groupId: string) => {
  const response = await apiClient.patch<ApiResponse<object>>(
    `/admin/groups/${groupId}/restore`
  );
  return response.data;
};

// Delete Group
export const deleteAdminGroup = async (groupId: string) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/groups/${groupId}`
  );
  return response.data;
};

// Bulk Group Actions
export const bulkGroupAction = async (data: BulkGroupActionRequest) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/groups/bulk-action`,
    data
  );
  return response.data;
};

// Update Group Settings
export const updateAdminGroupSettings = async (
  groupId: string,
  data: UpdateGroupSettingsDTO
) => {
  const response = await apiClient.put<ApiResponse<object>>(
    `/admin/groups/${groupId}/settings`,
    data
  );
  return response.data;
};

// Change Group Owner
export const changeAdminGroupOwner = async (
  groupId: string,
  data: ChangeGroupOwnerDTO
) => {
  const response = await apiClient.put<ApiResponse<object>>(
    `/admin/groups/${groupId}/owner`,
    data
  );
  return response.data;
};

// Get Group Members
export const getAdminGroupMembers = async (
  groupId: string,
  params: GetGroupMembersParams
) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.searchTerm) {
    queryParams.append("searchTerm", params.searchTerm);
  }
  if (params.role) {
    queryParams.append("role", params.role);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<GroupAdminMemberDTO>>
  >(`/admin/groups/${groupId}/members?${queryParams.toString()}`);
  return response.data;
};

// Search Group Members
export const searchGroupMembers = async (
  groupId: string,
  params: SearchGroupMembersParams
) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.searchTerm) {
    queryParams.append("searchTerm", params.searchTerm);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<GroupMemberSearchResultDto>>
  >(`/admin/groups/${groupId}/members/search?${queryParams.toString()}`);
  return response.data;
};

// Update Member Role
export const updateAdminGroupMemberRole = async (
  groupId: string,
  userId: string,
  data: UpdateMemberRoleDTO
) => {
  const response = await apiClient.put<ApiResponse<object>>(
    `/admin/groups/${groupId}/members/${userId}/role`,
    data
  );
  return response.data;
};

// Remove Member from Group
export const removeAdminGroupMember = async (
  groupId: string,
  userId: string
) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/groups/${groupId}/members/${userId}`
  );
  return response.data;
};

// Get Group Posts
export const getAdminGroupPosts = async (
  groupId: string,
  params: GetGroupPostsParams
) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.searchTerm) {
    queryParams.append("searchTerm", params.searchTerm);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<PostForListDTO>>
  >(`/admin/groups/${groupId}/posts?${queryParams.toString()}`);
  return response.data;
};

// Delete Group Post
export const deleteAdminGroupPost = async (groupId: string, postId: number) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/groups/${groupId}/posts/${postId}`
  );
  return response.data;
};

// Restore Post
export const restorePost = async (groupId: string, postId: number) => {
  const response = await apiClient.patch<ApiResponse<boolean>>(
    `/admin/groups/${groupId}/posts/${postId}/restore`
  );
  return response.data;
};

// Add Member to Group
export const addAdminGroupMember = async (
  groupId: string,
  data: AddMemberAdminRequest
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/groups/${groupId}/members`,
    data
  );
  return response.data;
};

// Search Users
export const searchUsers = async (params: UserSearchQuery) => {
  const queryParams = new URLSearchParams();

  if (params.query) {
    queryParams.append("query", params.query);
  }
  if (params.excludeGroupId) {
    queryParams.append("excludeGroupId", params.excludeGroupId);
  }
  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<UserSearchResultDTO>>
  >(`/admin/users/search-available?${queryParams.toString()}`);
  return response.data;
};

// ===============================
// EXPORT JOB API FUNCTIONS
// ===============================

// Export Groups to Excel
export const exportGroupsToExcel = async (
  params: GetGroupsAdminParams & { timezoneOffsetMinutes?: number }
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/groups/export-jobs",
    params
  );
  return response.data;
};
