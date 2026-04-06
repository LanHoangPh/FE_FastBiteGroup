// hooks/useUserPresence.ts

// =================================================================
// USER PRESENCE HOOKS
// Custom hooks for managing user presence functionality.
// =================================================================

import { usePresenceStore } from "@/store/presenceStore";
import { usePresence } from "@/providers/PresenceProvider";
import { UserPresenceStatus } from "@/types/customer/models";

/**
 * Hook that provides both presence state and actions for a specific user.
 * @param userId - The ID of the user to get presence information for
 * @returns Object containing the user's status and change status function
 */
export const useUserPresence = (userId: string) => {
  const userStatus = usePresenceStore((state) => state.statuses[userId]);
  const { changeMyStatus } = usePresence();

  return {
    status: userStatus ?? UserPresenceStatus.Offline,
    changeMyStatus,
  };
};

/**
 * Hook that provides the current user's presence status and change function.
 * This is a convenience hook for when you only need the current user's presence.
 * @returns Object containing the current user's status and change status function
 */
export const useMyPresence = () => {
  const { changeMyStatus } = usePresence();

  return {
    changeMyStatus,
  };
};
