import apiClient from "../apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/admin/role.types";

// ===============================
// ADMIN ROLE MANAGEMENT API FUNCTIONS
// ===============================

// Get All Roles
export const getAllRoles = async () => {
  const response = await apiClient.get<ApiResponse<RoleDto[]>>("/admin/roles");
  return response.data;
};

// Create Role
export const createRole = async (data: CreateRoleRequest) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/roles",
    data
  );
  return response.data;
};

// Update Role
export const updateRole = async (roleId: string, data: UpdateRoleRequest) => {
  const response = await apiClient.put<ApiResponse<object>>(
    `/admin/roles/${roleId}`,
    data
  );
  return response.data;
};

// Delete Role
export const deleteRole = async (roleId: string) => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/admin/roles/${roleId}`
  );
  return response.data;
};
