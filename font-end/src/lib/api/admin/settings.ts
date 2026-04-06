import apiClient from "../apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  AdminSettingsDto,
  UpdateSettingsRequest,
} from "@/types/admin/settings.types";

// ===============================
// ADMIN SETTINGS API FUNCTIONS
// ===============================

// Get All Admin Settings
export const getAdminSettings = async () => {
  const response = await apiClient.get<ApiResponse<AdminSettingsDto>>(
    "/admin/settings"
  );
  return response.data;
};

// Update Admin Settings
export const updateAdminSettings = async (request: UpdateSettingsRequest) => {
  const response = await apiClient.put<ApiResponse<boolean>>(
    "/admin/settings",
    request
  );
  return response.data;
};
