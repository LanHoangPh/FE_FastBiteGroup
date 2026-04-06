import apiClient from "@/lib/api/apiClient";
import { PagedResult, ApiResponse } from "@/types/api.types";
import { UserSearchResultDto } from "@/types/customer/conversation";
import { MutualGroupDto } from "@/types/customer/group";

export interface SearchUsersParams {
  query?: string;
  pageParam: number;
  pageSize: number;
}

/**
 * Search for users by name or email
 * @param params - Search parameters including query, pagination
 * @returns Promise<PagedResult<UserSearchResultDto>> - Paginated list of matching users
 */
export async function searchUsers({
  query,
  pageParam,
  pageSize,
}: SearchUsersParams): Promise<PagedResult<UserSearchResultDto>> {
  const params = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (query) {
    params.append("query", query);
  }

  try {
    const response = await apiClient.get(`/User/search?${params.toString()}`);
    const apiResponse = response.data as ApiResponse<
      PagedResult<UserSearchResultDto>
    >;
    return apiResponse.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 * Get mutual groups between current user and specified user
 * @param userId - The ID of the user to find mutual groups with
 * @returns Promise<MutualGroupDto[]> - List of mutual groups
 */
export async function getMutualGroups(
  userId: string
): Promise<MutualGroupDto[]> {
  try {
    const response = await apiClient.get(`/User/${userId}/mutual-groups`);
    const apiResponse = response.data as ApiResponse<MutualGroupDto[]>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching mutual groups:", error);
    throw error;
  }
}
