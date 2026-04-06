// lib/api/presence.ts

// =================================================================
// PRESENCE API SERVICES
// API functions for managing user presence statuses.
// =================================================================

import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  UserStatusDto,
  GetUserStatusesRequest,
} from "@/types/customer/presence.types";

/**
 * Fetches the current presence status for a list of user IDs.
 * @param userIds - An array of user IDs to fetch statuses for.
 * @returns An ApiResponse containing a list of user statuses.
 */
export const getUserStatuses = async (
  userIds: string[]
): Promise<ApiResponse<UserStatusDto[]>> => {
  // Construct the request payload
  const requestData: GetUserStatusesRequest = { userIds };

  // Make the POST request using our configured apiClient
  const response = await apiClient.post<ApiResponse<UserStatusDto[]>>(
    "/presence/statuses",
    requestData
  );

  // Return the standardized API response data
  return response.data;
};
