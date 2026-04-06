// src/lib/api/customer/invitations.ts

import apiClient from "../apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  GroupInvitationDto,
  RespondToInvitationDto,
} from "@/types/customer/invitation";

/**
 * Fetches the list of pending group invitations for the current user
 * @returns Promise<GroupInvitationDto[]>
 */
export async function getMyPendingInvitations(): Promise<GroupInvitationDto[]> {
  const response = await apiClient.get("/invitations/me");
  const apiResponse = response.data as ApiResponse<GroupInvitationDto[]>;
  return apiResponse.data;
}

/**
 * Responds to a group invitation (accept or decline)
 * @param invitationId - The unique identifier of the invitation
 * @param payload - The response payload containing accept/decline decision
 * @returns Promise<void>
 */
export async function respondToGroupInvitation(
  invitationId: number,
  payload: RespondToInvitationDto
): Promise<void> {
  const response = await apiClient.post(
    `/invitations/${invitationId}/respond`,
    payload
  );
  // 204 NoContent response, no need to return data
}
