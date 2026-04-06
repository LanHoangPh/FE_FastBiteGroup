// hooks/usePresenceStatuses.ts

// =================================================================
// PRESENCE STATUS HOOKS
// Custom hooks for fetching and managing presence statuses.
// =================================================================

import { useEffect, useState } from "react";
import { usePresenceStore } from "@/store/presenceStore";
import { getUserStatuses } from "@/lib/api/presence";
import { handleApiError } from "@/lib/utils/errorUtils";

/**
 * Hook for fetching initial presence statuses for multiple users.
 * @param userIds - Array of user IDs to fetch statuses for
 * @param options - Configuration options
 * @returns Object containing loading state and refresh function
 */
export const usePresenceStatuses = (
  userIds: string[],
  options: {
    enabled?: boolean;
    onSuccess?: (count: number) => void;
    onError?: (error: any) => void;
  } = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setStatusesBatch } = usePresenceStore();
  const { enabled = true, onSuccess, onError } = options;

  const fetchStatuses = async () => {
    if (userIds.length === 0 || !enabled) return;

    setIsLoading(true);
    try {
      const response = await getUserStatuses(userIds);

      if (response.success && response.data) {
        setStatusesBatch(response.data);
        onSuccess?.(response.data.length);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch user statuses");
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [userIds.join(","), enabled]); // Re-run when userIds change

  return {
    isLoading,
    refresh: fetchStatuses,
  };
};
