// types/customer/user.types.ts

// =================================================================
// CUSTOMER USER PROFILE & ACCOUNT MANAGEMENT TYPES
// These interfaces describe data models for the current user's profile
// and account management features under /api/v1/me endpoints.
// =================================================================

import { UserPresenceStatus } from "@/types/customer/models";
import { GroupRole } from "@/types/customer/group";
import { PagedResult } from "@/types/api.types";

/**
 * @description The main DTO for the user's dashboard statistics.
 * @response_from GET /api/v1/me/dashboard-stats
 */
export interface UserDashboardStatsDto {
  messagesTodayCount: number; // long becomes number
  joinedGroupsCount: number;
  uniqueDirectChatPartnersCount: number;
}

/**
 * Information about a group that the current user belongs to
 */
export interface MyGroupInfoDto {
  groupId: string;
  groupName: string;
  groupAvatarUrl?: string;
}

/**
 * Information about a recent post created by the current user
 */
export interface MyPostInfoDto {
  postId: number;
  title: string;
  createdAt: string; // ISO Date String
}

/**
 * Complete profile information for the current user
 */
export interface MyProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth: string; // ISO Date String
  twoFactorEnabled: boolean;
  createdAt: string; // ISO Date String
  updateAt: string; // ISO Date String
  presenceStatus: UserPresenceStatus;
  messagingPrivacy: MessagingPrivacy;
  groups: MyGroupInfoDto[];
  recentPosts: MyPostInfoDto[];
}

/**
 * Basic user information (used in update responses)
 */
export interface UserDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string; // ISO Date String
  twoFactorEnabled: boolean;
}

/**
 * Login history entry for the current user
 */
export interface LoginHistoryDto {
  loginTimestamp: string; // ISO Date String
  ipAddress?: string;
  userAgent?: string;
  wasSuccessful: boolean;
}

/**
 * Contact information for the current user
 */
export interface ContactDto {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  presenceStatus: UserPresenceStatus;
}

/**
 * Messaging privacy settings enum
 */
export enum MessagingPrivacy {
  FromSharedGroupMembers = "FromSharedGroupMembers",
  FromAnyone = "FromAnyone",
}

/**
 * Privacy settings update DTO
 */
export interface UpdatePrivacySettingsDto {
  messagingPrivacy: MessagingPrivacy;
}

// =================================================================
// CONVERSATION TYPES
// These interfaces describe data models for conversation management
// =================================================================

/**
 * Enum representing the possible conversation types
 */
export enum ConversationType {
  Direct = "Direct",
  Group = "Group",
}

/**
 * Enum representing the possible message types
 */
export enum MessageType {
  Text = "Text",
  Image = "Image",
  File = "File",
  Video = "Video",
  Audio = "Audio",
  Poll = "Poll",
  VideoCall = "VideoCall",
  SystemNotification = "SystemNotification",
  Delete = "Delete",
}

/**
 * Conversation list item DTO for the sidebar
 */
export interface ConversationListItemDTO {
  conversationId: number;
  groupId?: string; // Nullable Guid becomes optional string
  conversationType: ConversationType;
  displayName: string;
  avatarUrl?: string;
  partnerPresenceStatus?: UserPresenceStatus;
  lastMessagePreview?: string;
  lastMessageType?: MessageType;
  lastMessageTimestamp?: string; // ISO Date String
  unreadCount: number;
}

/**
 * Information about the sender of a message
 */
export interface MessageSenderDto {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
}

/**
 * Information about a file attached to a message
 */
export interface AttachmentInfoDto {
  fileId: number;
  fileName: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
}

/**
 * @description Information about a reaction on a message.
 * @note This interface has been updated with new user detail fields.
 */
export interface ReactionDto {
  userId: string;
  reactionCode: string; // e.g., "👍"
  reactedAt: string; // ISO Date String
  // --- NEWLY ADDED FIELDS ---
  fullName: string;
  avatarUrl?: string | null;
  // -------------------------
}

/**
 * @description The request payload for adding or removing a reaction.
 * @used_in POST /api/v1/conversations/{conversationId}/messages/{messageId}/toggle-reaction
 */
export interface ToggleReactionRequestDto {
  reactionCode: string; // e.g., "👍", "❤️"
}

/**
 * @description The successful response payload after toggling a reaction.
 * @response_from POST /api/v1/conversations/{conversationId}/messages/{messageId}/toggle-reaction
 */
export interface ToggleReactionResponseDto {
  messageId: string;
  newReactions: ReactionDto[]; // The new, complete list of reactions
}

/**
 * Information about who read a message
 */
export interface ReadReceiptDto {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  readAt: string; // ISO Date String
}

/**
 * Snippet of a message being replied to
 */
export interface ParentMessageInfoDto {
  senderName: string;
  contentSnippet: string;
}

/**
 * Detailed information about a single message
 */
export interface MessageDto {
  id: string; // MongoDB ObjectId
  conversationId: number;
  sender: MessageSenderDto;
  content: string;
  messageType: MessageType;
  sentAt: string; // ISO Date String
  isDeleted: boolean;
  attachments?: AttachmentInfoDto[] | null;
  reactions?: ReactionDto[] | null;
  parentMessageId?: string | null;
  parentMessage?: ParentMessageInfoDto | null;
  readBy: ReadReceiptDto[];
  canEdit: boolean;
  canDelete: boolean;
  /**
   * @description A flag from the backend indicating if this message was sent by the current user.
   * This simplifies the UI logic significantly.
   */
  isMine: boolean;
  /**
   * @description The sender's role in the group at the time the message was sent.
   * Null if it's a direct (1-on-1) chat.
   */
  senderRoleInGroup?: GroupRole | null;
}

/**
 * Information about the other user in a 1-on-1 conversation
 */
export interface ConversationPartnerDto {
  userId: string; // Guid
  fullName: string;
  avatarUrl?: string | null;
  presenceStatus: UserPresenceStatus;
  mutualGroupsCount: number;
}

/**
 * Detailed information about a single conversation, including the first page of messages
 */
export interface ConversationDetailDto {
  conversationId: number;
  groupId?: string | null;
  conversationType: ConversationType;
  displayName: string;
  avatarUrl?: string | null;
  currentUserRole?: string | null;
  partner?: ConversationPartnerDto | null;
  messagesPage: PagedResult<MessageDto>;
}

/**
 * @description Represents a user in the search results for invitations.
 * @response_from GET /api/v1/User/search-for-invite
 */
export interface UserSearchResultDto {
  userId: string; // Guid
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}
