// src/lib/api/customer/invites.ts

import apiClient from "../apiClient";
import { ApiResponse } from "@/types/api.types";
import { GroupPreviewDto, JoinGroupResponseDto } from "@/types/customer/group";

/**
 * Get invitation link information (public API - no authentication required)
 * @param invitationCode - The invitation code from the URL
 * @returns Promise<GroupPreviewDto>
 */
export async function getInvitationLinkInfo(
  invitationCode: string
): Promise<GroupPreviewDto> {
  const response = await apiClient.get(`/invitations/link/${invitationCode}`);
  const apiResponse = response.data as ApiResponse<GroupPreviewDto>;
  return apiResponse.data;
}

/**
 * Accept an invite link (requires authentication)
 * @param invitationCode - The invitation code from the URL
 * @returns Promise<JoinGroupResponseDto>
 */
export async function acceptInviteLink(
  invitationCode: string
): Promise<JoinGroupResponseDto> {
  const response = await apiClient.post(
    `/invitations/link/${invitationCode}/accept`
  );
  const apiResponse = response.data as ApiResponse<JoinGroupResponseDto>;
  return apiResponse.data;
}
