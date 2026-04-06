/**
 * @description Represents a single item in the call history list for a conversation.
 * @response_from GET /api/v1/conversations/{conversationId}/call-history
 */
export interface CallHistoryItemDto {
  videoCallSessionId: string; // Guid
  initiatorUserId: string; // Guid
  initiatorName: string;
  startedAt: string; // ISO Date String
  endedAt?: string | null; // ISO Date String
  durationInMinutes: number;
  participantCount: number;
}

/**
 * @description Query parameters for fetching call history
 */
export interface GetCallHistoryRequestParams {
  conversationId: number;
  pageParam?: number;
  pageSize?: number;
}

/**
 * @description The successful response payload after starting a new video call.
 * @response_from POST /api/v1/conversations/{conversationId}/calls
 */
export interface StartCallResponseDto {
  videoCallSessionId: string; // Guid
  livekitToken: string;
  livekitServerUrl: string;
}

/**
 * @description The successful response payload after joining an existing video call.
 * @response_from POST /api/v1/video-calls/{sessionId}/join
 */
export interface JoinCallResponseDto {
  livekitToken: string;
  livekitServerUrl: string;
}
