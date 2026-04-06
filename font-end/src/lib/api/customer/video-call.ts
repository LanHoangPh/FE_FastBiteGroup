// Base error handling utility
const handleApiError = (error: any, defaultMessage: string): never => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.response?.status === 500) {
    throw new Error(`Server error: ${defaultMessage}`);
  } else if (error.response?.status === 404) {
    throw new Error(`Resource not found: ${defaultMessage}`);
  } else if (error.response?.status === 401 || error.response?.status === 403) {
    throw new Error(`Unauthorized: ${defaultMessage}`);
  } else {
    throw new Error(error.message || defaultMessage);
  }
};

// Response validation utility
const validateApiResponse = <T>(
  response: { data: { success: boolean; data: T; message?: string } },
  errorMessage: string
): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || errorMessage);
  }
  return response.data.data;
};

import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  StartVideoCallRequest,
  StartVideoCallResponse,
  VideoCallSessionData,
  VideoCallParticipant,
  StartCallResponseDto,
  JoinCallResponseDto,
} from "@/types/video/video-call-api.types";

// ===== INTERFACES =====

export interface JoinCallResponse {
  livekitToken: string;
  livekitServerUrl: string;
}

export interface LiveKitConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantToken: string;
  participantName: string;
}

// ===== CALL HISTORY TYPES =====
export interface VideoCallSession {
  videoCallSessionId: string;
  initiatorUserId: string;
  initiatorName: string;
  startedAt: string;
  endedAt?: string;
  durationInMinutes: number;
  participantCount: number;
}

export interface CallHistoryResponse {
  success: boolean;
  message: string;
  data: VideoCallSession[];
  errors?: Array<{
    errorCode: string;
    message: string;
  }>;
  statusCode: number;
}

export interface VideoCallSessionDetails {
  sessionId: string;
  conversationId: number;
  initiatorUserId: string;
  initiatorName: string;
  isActive: boolean;
  participants: VideoCallAdminParticipant[];
  createdAt: string;
}

export interface VideoCallAdminParticipant {
  userId: string;
  userName: string;
  isAdmin: boolean;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

// ===== CORE VIDEO CALL APIs =====

/**
 * Start a new video call session in a conversation
 * POST /api/v1/conversations/{conversationId}/calls
 */
export const startVideoCall = async (
  conversationId: number
): Promise<VideoCallSessionData> => {
  const response = await apiClient.post<StartVideoCallResponse>(
    `/conversations/${conversationId}/calls`
  );

  const backendData = validateApiResponse(
    response,
    "Failed to start video call"
  );

  return {
    videoCallSessionId: backendData.videoCallSessionId,
    livekitToken: backendData.livekitToken,
    livekitServerUrl: backendData.livekitServerUrl,
  };
};

/**
 * Join an existing video call session
 * POST /api/v1/video-calls/{sessionId}/join
 */
export const joinVideoCall = async (
  sessionId: string,
  conversationId: number,
  userId?: string
): Promise<VideoCallSessionData> => {
  try {
    const requestBody: Record<string, any> = { conversationId };

    if (userId) {
      requestBody.userId = userId;
    }

    const response = await apiClient.post<ApiResponse<JoinCallResponseDto>>(
      `/video-calls/${sessionId}/join`,
      requestBody
    );

    const backendData = validateApiResponse(
      response,
      "Failed to join video call"
    );

    const result = {
      videoCallSessionId: sessionId,
      livekitToken: backendData.livekitToken,
      livekitServerUrl: backendData.livekitServerUrl,
    };
    return result;
  } catch (error) {
    console.error("[VideoCallAPI] Failed to join video call:", error);
    return handleApiError(error, "Failed to join video call");
  }
};

/**
 * Leave a video call session
 * POST /api/v1/video-calls/{sessionId}/leave
 */
export const leaveVideoCall = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/video-calls/${sessionId}/leave`);
};

/**
 * End video call for all participants (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/end
 */
export const endVideoCallForAll = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/video-calls/${sessionId}/end`);
};

// ===== ADMIN CONTROL APIs =====

/**
 * Mute participant microphone (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/mute-mic
 */
export const muteParticipantMic = async (
  sessionId: string,
  targetUserId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/${sessionId}/participants/${targetUserId}/mute-mic`
  );
};

/**
 * Stop participant video (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/stop-video
 */
export const stopParticipantVideo = async (
  sessionId: string,
  targetUserId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/${sessionId}/participants/${targetUserId}/stop-video`
  );
};

/**
 * Remove participant from call (Admin/Host only)
 * DELETE /api/v1/video-calls/{sessionId}/participants/{targetUserId}
 */
export const removeParticipant = async (
  sessionId: string,
  targetUserId: string
): Promise<void> => {
  await apiClient.delete(
    `/video-calls/${sessionId}/participants/${targetUserId}`
  );
};

// ===== LEGACY SUPPORT (for backward compatibility) =====

/**
 * Get call history for a conversation (for admin functionality)
 * GET /api/v1/conversations/{conversationId}/call-history
 */
export const getCallHistory = async (
  conversationId: number
): Promise<VideoCallSession[]> => {
  const response = await apiClient.get<CallHistoryResponse>(
    `/conversations/${conversationId}/call-history`
  );

  const data = validateApiResponse(response, "Failed to fetch call history");
  return data || [];
};

/**
 * Get current video call session details with participants (for admin functionality)
 * Note: This function uses available APIs to construct session details
 */
export const getVideoCallSessionDetails = async (
  sessionId: string,
  conversationId: number
): Promise<VideoCallSessionDetails> => {
  try {
    // For now, return basic session structure since the original endpoint doesn't exist
    // The actual implementation would depend on what data is available from your backend
    return {
      sessionId: sessionId,
      conversationId: conversationId,
      initiatorUserId: "", // Would need to be determined from other context
      initiatorName: "",
      isActive: true, // Assume active if we're calling this function
      participants: [], // Would need to be fetched from another endpoint if available
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Video call session not found: ${sessionId}`);
    }
    return handleApiError(error, "Failed to fetch session details");
  }
};

/**
 * Check if current user is admin of a video call session (for admin functionality)
 * Note: This is a simplified implementation since admin status checking isn't in your API list
 */
export const checkAdminStatus = async (
  sessionId: string,
  conversationId: number,
  currentUserId?: string
): Promise<boolean> => {
  try {
    // Since there's no specific admin status API, this is a placeholder implementation
    // In a real scenario, you would need to determine admin status from other available data
    return false; // Default to false for safety
  } catch (error: any) {
    return false;
  }
};

/**
 * @deprecated Use joinVideoCall instead
 * Join an existing video call session
 */
export const joinVideoCallSession = (
  conversationId: number,
  sessionId: string,
  userId?: string
) => {
  return joinVideoCall(sessionId, conversationId, userId);
};

/**
 * @deprecated Use muteParticipantMic instead
 * Mute a participant (admin only)
 */
export const muteParticipantAsAdmin = muteParticipantMic;

/**
 * @deprecated Use removeParticipant instead
 * Remove a participant from the call (admin only)
 */
export const removeParticipantAsAdmin = removeParticipant;

// ===== SIGNALR VIDEO CALL APIs =====

/**
 * Start a new video call session via SignalR
 * POST /api/v1/conversations/start-video-call
 */
export const startVideoCallSignalR = async (
  conversationId: number
): Promise<VideoCallSessionData> => {
  try {
    const response = await apiClient.post<StartVideoCallResponse>(
      `/conversations/${conversationId}/calls`
    );

    const backendData = validateApiResponse(
      response,
      "Failed to start video call"
    );

    const result = {
      videoCallSessionId: backendData.videoCallSessionId,
      livekitToken: backendData.livekitToken,
      livekitServerUrl: backendData.livekitServerUrl,
    };

    return result;
  } catch (error) {
    console.error("[VideoCallAPI] Failed to start video call:", error);
    return handleApiError(error, "Failed to start video call");
  }
};

/**
 * Accept an incoming video call via SignalR
 * POST /api/v1/video-calls/{sessionId}/accept
 */
export const acceptVideoCallSignalR = async (
  sessionId: string
): Promise<{ livekitToken: string; livekitServerUrl: string }> => {
  try {
    const response = await apiClient.post<
      ApiResponse<{ livekitToken: string; livekitServerUrl: string }>
    >(`/video-calls/${sessionId}/accept`);

    const result = validateApiResponse(response, "Failed to accept video call");
    return result;
  } catch (error) {
    console.error("[VideoCallAPI] Failed to accept video call:", error);
    return handleApiError(error, "Failed to accept video call");
  }
};

/**
 * Decline an incoming video call via SignalR
 * POST /api/v1/video-calls/{sessionId}/decline
 */
export const declineVideoCallSignalR = async (
  sessionId: string
): Promise<void> => {
  try {
    await apiClient.post(`/video-calls/${sessionId}/decline`);
  } catch (error) {
    console.error("[VideoCallAPI] Failed to decline video call:", error);
    return handleApiError(error, "Failed to decline video call");
  }
};

/**
 * Leave a video call session via SignalR
 * POST /api/v1/video-calls/{sessionId}/leave
 */
export const leaveVideoCallSignalR = async (
  sessionId: string
): Promise<void> => {
  try {
    await apiClient.post(`/video-calls/${sessionId}/leave`);
  } catch (error) {
    return handleApiError(error, "Failed to leave video call");
  }
};
