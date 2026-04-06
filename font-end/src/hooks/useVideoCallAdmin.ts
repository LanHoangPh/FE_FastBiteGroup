import { useState, useCallback } from "react";
import {
  muteParticipantMic,
  stopParticipantVideo,
  removeParticipant,
  endCallForAll,
} from "@/lib/api/customer/calls";
import { useAuthStore } from "@/store/authStore";

interface UseVideoCallAdminProps {
  sessionId?: string | null;
  conversationId?: number;
  enabled?: boolean;
}

// Simplified participant interface for basic functionality
interface SimpleParticipant {
  userId: string;
  name: string;
  isAdmin?: boolean;
}

// Simplified session details interface
interface SimpleSessionDetails {
  sessionId: string;
  conversationId: number;
  participants: SimpleParticipant[];
  isActive: boolean;
  initiatorUserId?: string; // Added for compatibility
}

interface UseVideoCallAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  sessionDetails: SimpleSessionDetails | null;
  participants: SimpleParticipant[];
  currentUser: SimpleParticipant | null;
  refreshAdminStatus: () => Promise<void>;
  refreshSessionDetails: () => Promise<void>;
  // Admin actions
  muteParticipant: (userId: string) => Promise<void>;
  stopParticipantVideo: (userId: string) => Promise<void>;
  removeParticipant: (userId: string) => Promise<void>;
  endCallForAll: () => Promise<void>;
}

/**
 * Simplified video call admin hook
 * Provides basic admin functionality for video calls
 */
export function useVideoCallAdmin({
  sessionId,
  conversationId,
  enabled = true,
}: UseVideoCallAdminProps): UseVideoCallAdminReturn {
  const [isAdmin, setIsAdmin] = useState(false); // Start with false, will be determined properly
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] =
    useState<SimpleSessionDetails | null>(null);

  const { user } = useAuthStore();

  // Simplified refresh functions (placeholders for now)
  const refreshAdminStatus = useCallback(async () => {
    // Only set admin if user is the initiator or has admin role
    if (sessionId && user?.id) {
      // For now, we'll determine admin status based on session details
      // This should be enhanced to check actual admin status from API
      setIsAdmin(false); // Default to false, will be overridden by parent component
    }
  }, [sessionId, user?.id]);

  const refreshSessionDetails = useCallback(async () => {
    if (!sessionId || !conversationId) return;

    // Simplified: create basic session details
    // Note: initiatorUserId should be determined by the parent component
    // For now, we'll leave it empty and let the parent component handle it
    setSessionDetails({
      sessionId,
      conversationId,
      participants: [],
      isActive: true,
      initiatorUserId: undefined, // Will be set by parent component
    });
  }, [sessionId, conversationId]);

  // Admin action wrappers
  const muteParticipant = useCallback(
    async (userId: string) => {
      if (!sessionId) return;
      await muteParticipantMic(sessionId, userId);
    },
    [sessionId]
  );

  const stopVideo = useCallback(
    async (userId: string) => {
      if (!sessionId) return;
      await stopParticipantVideo(sessionId, userId);
    },
    [sessionId]
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (!sessionId) return;
      await removeParticipant(sessionId, userId);
    },
    [sessionId]
  );

  const endCall = useCallback(async () => {
    if (!sessionId) return;
    await endCallForAll(sessionId);
  }, [sessionId]);

  return {
    isAdmin,
    isLoading,
    error,
    sessionDetails,
    participants: sessionDetails?.participants || [],
    currentUser: null, // Simplified
    refreshAdminStatus,
    refreshSessionDetails,
    muteParticipant,
    stopParticipantVideo: stopVideo,
    removeParticipant: removeUser,
    endCallForAll: endCall,
  };
}
