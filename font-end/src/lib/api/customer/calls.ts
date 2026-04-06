import apiClient from "@/lib/api/apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  CallHistoryItemDto,
  GetCallHistoryRequestParams,
  StartCallResponseDto,
  JoinCallResponseDto,
} from "@/types/customer/call";
import { handleApiError } from "@/lib/utils/errorUtils";

/**
 * Get call history for a specific conversation
 * @param params - Query parameters including conversationId, pagination
 * @returns Promise<PagedResult<CallHistoryItemDto>>
 */
export async function getCallHistory({
  conversationId,
  pageParam = 1,
  pageSize = 20,
}: GetCallHistoryRequestParams): Promise<PagedResult<CallHistoryItemDto>> {
  const params = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await apiClient.get<
    ApiResponse<PagedResult<CallHistoryItemDto>>
  >(`/conversations/${conversationId}/call-history?${params.toString()}`);

  return response.data.data;
}

// ===== VIDEO CALL MANAGEMENT APIs =====

/**
 * Start a new video call session in a conversation group and direct
 * @param conversationId - The conversation ID to start the call in
 * @returns Promise<StartCallResponseDto>
 */
export async function startVideoCall(
  conversationId: number
): Promise<StartCallResponseDto> {
  try {
    const response = await apiClient.post<ApiResponse<StartCallResponseDto>>(
      `/conversations/${conversationId}/calls`,
      {}
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to start video call");
    }

    return response.data.data;
  } catch (error: any) {
    handleApiError(error, "Không thể bắt đầu cuộc gọi video");
    throw error;
  }
}

/**
 * Join an existing video call session
 * @param sessionId - The video call session ID to join
 * @returns Promise<JoinCallResponseDto>
 */
export async function joinVideoCall(
  sessionId: string
): Promise<JoinCallResponseDto> {
  try {
    const response = await apiClient.post<ApiResponse<JoinCallResponseDto>>(
      `/video-calls/${sessionId}/join`,
      {}
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to join video call");
    }

    return response.data.data;
  } catch (error: any) {
    handleApiError(error, "Không thể tham gia cuộc gọi video");
    throw error;
  }
}

/**
 * Leave a video call session
 * @param sessionId - The video call session ID to leave
 * @returns Promise<void>
 */
export async function leaveVideoCall(sessionId: string): Promise<void> {
  try {
    await apiClient.post(`/video-calls/${sessionId}/leave`);
  } catch (error: any) {
    handleApiError(error, "Không thể rời khỏi cuộc gọi video");
    throw error;
  }
}

/**
 * Mute participant microphone (Admin/Host only)
 * @param sessionId - The video call session ID
 * @param targetUserId - The user ID to mute
 * @returns Promise<void>
 */
export async function muteParticipantMic(
  sessionId: string,
  targetUserId: string
): Promise<void> {
  try {
    await apiClient.post(
      `/video-calls/${sessionId}/participants/${targetUserId}/mute-mic`
    );
  } catch (error: any) {
    handleApiError(error, "Không thể tắt tiếng người tham gia");
    throw error;
  }
}

/**
 * Stop participant video (Admin/Host only)
 * @param sessionId - The video call session ID
 * @param targetUserId - The user ID to stop video for
 * @returns Promise<void>
 */
export async function stopParticipantVideo(
  sessionId: string,
  targetUserId: string
): Promise<void> {
  try {
    await apiClient.post(
      `/video-calls/${sessionId}/participants/${targetUserId}/stop-video`
    );
  } catch (error: any) {
    handleApiError(error, "Không thể tắt video của người tham gia");
    throw error;
  }
}

/**
 * Remove participant from call (Admin/Host only)
 * @param sessionId - The video call session ID
 * @param targetUserId - The user ID to remove
 * @returns Promise<void>
 */
export async function removeParticipant(
  sessionId: string,
  targetUserId: string
): Promise<void> {
  try {
    console.log(
      `[API] Attempting to remove participant ${targetUserId} from session ${sessionId}`
    );

    const response = await apiClient.delete(
      `/video-calls/${sessionId}/participants/${targetUserId}`
    );

    // API trả về 204 No Content khi thành công
    // Không cần xử lý response data
    console.log(
      `[API] Successfully removed participant ${targetUserId} from session ${sessionId}`
    );
    console.log(`[API] Response status:`, response.status);
  } catch (error: any) {
    console.error(`[API] Failed to remove participant ${targetUserId}:`, error);
    console.error(`[API] Error response:`, error.response?.data);
    console.error(`[API] Error status:`, error.response?.status);

    // Xử lý các lỗi cụ thể
    if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền xóa người tham gia này");
    } else if (error.response?.status === 404) {
      throw new Error("Không tìm thấy người tham gia hoặc cuộc gọi");
    } else if (error.response?.status === 400) {
      throw new Error("Yêu cầu không hợp lệ");
    }

    handleApiError(error, "Không thể loại bỏ người tham gia");
    throw error;
  }
}

/**
 * End call for all participants (Admin/Host only)
 * @param sessionId - The video call session ID
 * @returns Promise<void>
 */
export async function endCallForAll(sessionId: string): Promise<void> {
  try {
    await apiClient.post(`/video-calls/${sessionId}/end`);
  } catch (error: any) {
    handleApiError(error, "Không thể kết thúc cuộc gọi");
    throw error;
  }
}
