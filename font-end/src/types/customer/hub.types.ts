/**
 * @fileoverview Chat Hub Contract Documentation
 *
 * This file documents the SignalR hub contract between the frontend and backend.
 * It describes the events that the frontend can listen to and the methods it can call.
 */

import { MessageDto } from "./user.types";

/**
 * @description Information about a user who is currently typing
 */
export interface TypingUserDto {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
}

/**
 * @description Payload for marking messages as read
 */
export interface MarkAsReadDto {
  conversationId: number;
  messageIds: string[];
}

/**
 * @description Defines query parameters for searching messages within a conversation.
 * @used_in GET /api/v1/conversations/{conversationId}/messages/search
 */
export interface SearchMessagesRequestParams {
  query: string; // The search term
  pageNumber?: number;
  pageSize?: number;
}

/**
 * @description The request payload for fetching the context around a specific message.
 * @used_in GET /api/v1/conversations/{conversationId}/messages/context
 */
export interface GetMessageContextRequest {
  messageId: string;
  pageSize?: number;
}

/**
 * @description The successful response payload containing a "slice" of a conversation.
 * @response_from GET /api/v1/conversations/{conversationId}/messages/context
 */
export interface MessageContextResponseDto {
  messages: MessageDto[];
  targetMessageId: string;
  hasOlderMessages: boolean;
  hasNewerMessages: boolean;
}

/**
 * @description Link preview metadata extracted from URLs
 * @used_in Link preview functionality for rich message content
 */
export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  type?: 'website' | 'video' | 'image' | 'article';
}

/**
 * @description Request parameters for fetching link preview data
 * @used_in GET /api/v1/link-preview
 */
export interface LinkPreviewRequestParams {
  url: string;
}

/**
 * CHAT HUB CONTRACT
 *
 * Server-to-Client Events (to listen with .on):
 *
 * 1. ReceiveMessage: Fires when a new message is sent to a conversation the user is in.
 *    Payload: newMessage: MessageDto
 *
 * 2. MessageDeleted: Fires when a message is deleted in a conversation the user is in.
 *    Payload: conversationId: number, messageId: string
 *
 * 3. MessageReactionsUpdated: Fires when a message's reaction list has changed.
 *    Payload: messageId: string, newReactions: ReactionDto[]
 *    Note: The ReactionDto now includes fullName and avatarUrl for each user who reacted.
 *
 * 4. UserIsTyping: Fires when a user starts typing in a conversation.
 *    Payload: conversationId: number, typingUser: TypingUserDto
 *
 * 5. UserStoppedTyping: Fires when a user stops typing in a conversation.
 *    Payload: conversationId: number, userId: string
 *
 * 6. MessagesReadBy: Fires when messages are read by a user.
 *    Payload: messageIds: string[], reader: ReadReceiptDto
 *
 * Client-to-Server Methods (to call with .invoke):
 *
 * 1. JoinConversation(conversationId: number): Joins a conversation group for real-time updates.
 *
 * 2. LeaveConversation(conversationId: number): Leaves a conversation group.
 *
 * 3. StartTyping(conversationId: number, typingUser: TypingUserDto): Notifies that the user is typing.
 *
 * 4. StopTyping(conversationId: number): Notifies that the user stopped typing.
 *
 * 5. MarkMessagesAsRead(payload: MarkAsReadDto): Marks messages as read.
 */
