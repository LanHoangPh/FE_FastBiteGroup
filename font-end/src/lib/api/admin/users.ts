import { cache } from "react";
import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  GetUsersAdminParams,
  AdminUserListItemDTO,
  AdminUserDetailDto,
  GetUserActivityParams,
  UserActivityDTO,
  CreateUserByAdminRequest,
  UpdateUserBasicInfoRequest,
  DeactivateUserRequestDto,
  RoleAssignmentDto,
  BulkUserActionRequest,
  MyAdminProfileDto,
  UpdateUserDto,
  ChangePasswordDto,
  ActivateUserRequestDto,
  DeleteUserRequestDto,
  RestoreUserRequestDto,
  ForcePasswordResetRequestDto,
  RemoveRoleRequestDto,
} from "@/types/admin/user.types";

// ===============================
// ADMIN USER MANAGEMENT API FUNCTIONS
// ===============================

// Get Admin Users List
export const getAdminUsers = async (params: GetUsersAdminParams) => {
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
  if (params.isActive !== undefined) {
    queryParams.append("isActive", params.isActive.toString());
  }
  if (params.isDeleted !== undefined) {
    queryParams.append("isDeleted", params.isDeleted.toString());
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<AdminUserListItemDTO>>
  >(`/admin/users?${queryParams.toString()}`);
  return response.data;
};

// Get Admin User Details
export const getAdminUserDetails = async (userId: string) => {
  const response = await apiClient.get<ApiResponse<AdminUserDetailDto>>(
    `/admin/users/${userId}/details`
  );
  return response.data;
};

// Get User Activity
export const getUserActivity = async (
  userId: string,
  params: GetUserActivityParams
) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.activityType) {
    queryParams.append("activityType", params.activityType);
  }
  if (params.groupId) {
    queryParams.append("groupId", params.groupId);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<UserActivityDTO>>
  >(`/admin/users/${userId}/activity?${queryParams.toString()}`);
  return response.data;
};

// Create User by Admin
export const createUserByAdmin = async (data: CreateUserByAdminRequest) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/users",
    data
  );
  return response.data;
};

// Update User Basic Info
export const updateUserBasicInfo = async (
  userId: string,
  data: UpdateUserBasicInfoRequest
) => {
  const response = await apiClient.put<ApiResponse<object>>(
    `/admin/users/${userId}`,
    data
  );
  return response.data;
};

// Deactivate User
export const deactivateUser = async (
  userId: string,
  data: DeactivateUserRequestDto
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/users/${userId}/deactivate`,
    data
  );
  return response.data;
};

// Activate User
export const activateUser = async (
  userId: string,
  data: ActivateUserRequestDto
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/users/${userId}/reactivate`,
    data
  );
  return response.data;
};

// Delete User
export const deleteUser = async (
  userId: string,
  data: DeleteUserRequestDto
) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/users/${userId}?rowVersion=${encodeURIComponent(data.rowVersion)}`
  );
  return response.data;
};

// Restore User
export const restoreUser = async (
  userId: string,
  data: RestoreUserRequestDto
) => {
  const response = await apiClient.patch<ApiResponse<object>>(
    `/admin/users/${userId}/restore`,
    data
  );
  return response.data;
};

// Force Password Reset
export const forcePasswordReset = async (userId: string) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/users/${userId}/force-password-reset`
  );
  return response.data;
};

// Assign Role to User
export const assignRoleToUser = async (
  userId: string,
  data: RoleAssignmentDto
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/users/${userId}/roles`,
    data
  );
  return response.data;
};

// Remove Role from User
export const removeRoleFromUser = async (
  userId: string,
  data: RemoveRoleRequestDto
) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/users/${userId}/roles/${
      data.roleName
    }?rowVersion=${encodeURIComponent(data.rowVersion)}`
  );
  return response.data;
};

// Remove User Avatar
export const removeUserAvatar = async (userId: string) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/users/${userId}/avatar`
  );
  return response.data;
};

// Remove User Bio
export const removeUserBio = async (userId: string) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/users/${userId}/bio`
  );
  return response.data;
};

// Bulk User Actions
export const bulkUserAction = async (data: BulkUserActionRequest) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/users/bulk-action",
    data
  );
  return response.data;
};

// ===============================
// ADMIN PROFILE API FUNCTIONS
// ===============================

// Get Admin Profile
export const getMyAdminProfile = async () => {
  const response = await apiClient.get<ApiResponse<MyAdminProfileDto>>(
    "/admin/users/me"
  );
  return response.data;
};

// Update Admin Profile
export const updateAdminProfile = async (data: UpdateUserDto) => {
  const response = await apiClient.put<ApiResponse<boolean>>(
    "/me/profile",
    data
  );
  return response.data;
};

// Update Admin Avatar
export const updateAdminAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // The key "file" must match the backend's parameter name

  // The apiClient will automatically set the correct 'multipart/form-data' header
  const response = await apiClient.put<ApiResponse<{ avatarUrl: string }>>(
    "/me/avatar",
    formData
  );
  return response.data;
};

// Change Admin Password
export const changeAdminPassword = async (data: ChangePasswordDto) => {
  const response = await apiClient.put<ApiResponse<object>>(
    "/me/password",
    data
  );
  return response.data;
};

// ===============================
// EXPORT JOB API FUNCTIONS
// ===============================

// Export Users to Excel
export const exportUsersToExcel = async (
  params: GetUsersAdminParams & { timezoneOffsetMinutes?: number }
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/users/export-jobs",
    params
  );
  return response.data;
};
