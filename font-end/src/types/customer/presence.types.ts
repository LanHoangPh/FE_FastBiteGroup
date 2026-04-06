// types/presence.types.ts

// =================================================================
// PRESENCE API TYPES
// These interfaces describe the data structures for presence API communication.
// =================================================================

import { UserPresenceStatus } from "@/types/customer/models";

/**
 * Request payload for fetching multiple user statuses.
 */
export interface GetUserStatusesRequest {
  userIds: string[];
}

/**
 * DTO for a single user's presence status from the API.
 */
export interface UserStatusDto {
  userId: string;
  presenceStatus: UserPresenceStatus;
  lastSeen?: string; // Optional timestamp when user was last seen
}
