// types/realtime.ts

// =================================================================
// REALTIME COMMUNICATION TYPES
// These interfaces describe the data structures for SignalR communication.
// =================================================================

import { UserPresenceStatus } from "@/types/customer/models";

/**
 * DTO for the "UserStatusChanged" event from PresenceHub.
 */
export interface UserStatusChangedDto {
  userId: string;
  presenceStatus: UserPresenceStatus;
}
