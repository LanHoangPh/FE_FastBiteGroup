// src/types/conversation.ts
import { PagedResult } from "@/types/api.types";
import {
  ConversationPartnerDto,
  MessageDto,
} from "@/types/customer/user.types";

/**
 * @description The request payload for finding or creating a direct conversation.
 * @used_in POST /api/v1/conversations/direct
 */
export interface CreateDirectConversationRequestDto {
  partnerUserId: string; // Guid of the other user
}

/**
 * @description The successful response payload from the find/create direct conversation API.
 * @response_from POST /api/v1/conversations/direct
 */
export interface ConversationResponseDto {
  conversationId: number;
  partner: ConversationPartnerDto;
  wasCreated: boolean; // Indicates if the conversation was newly created (201) or found (200)
}

/**
 * @description User search result for starting new conversations
 */
export interface UserSearchResultDto {
  userId: string;
  displayName?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
}

/**
 * @description The request payload for fetching older messages using a cursor.
 * @used_in GET /api/v1/conversations/{conversationId}/messages
 */
export interface GetMessagesQuery {
  beforeMessageId?: string | null; // The cursor
  limit?: number;
}

/**
 * @description The successful response payload for a batch of messages from the history API.
 * @response_from GET /api/v1/conversations/{conversationId}/messages
 */
export interface MessageHistoryResponseDto {
  messages: MessageDto[];
  hasMore: boolean;
  nextCursor?: string | null;
}

/**
 * @description The request payload for sending a new message.
 * @used_in POST /api/v1/conversations/{conversationId}/messages
 */
export interface SendMessageDto {
  content?: string | null;
  parentMessageId?: string | null;
  attachmentFileIds?: number[] | null;
}
