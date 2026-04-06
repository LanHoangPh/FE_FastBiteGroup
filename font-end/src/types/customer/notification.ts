/**
 * Notification system types and enums for FastBite Group TeamChat
 * Corresponds to backend DTOs for notification management
 */

// Corresponds to EnumNotificationObjectType
export enum NotificationObjectType {
  Message = "Message",
  Post = "Post",
  UserMention = "UserMention",
  PostLike = "PostLike",
  Poll = "Poll",
  Group = "Group",
  ExternalLink = "ExternalLink",
}

// Corresponds to EnumNotificationType
export enum NotificationType {
  NewMessage = "NewMessage",
  UserAddedToGroup = "UserAddedToGroup",
  UserMention = "UserMention",
  NewPostInGroup = "NewPostInGroup",
  NewPostComment = "NewPostComment",
  PostLike = "PostLike",
  NewPoll = "NewPoll",
  VideoCallInvitation = "VideoCallInvitation",
  Deleted = "Deleted",
  AdminPromotion = "AdminPromotion",
  UserKickedFromGroup = "UserKickedFromGroup",
  PostRejected = "PostRejected",
  GroupInvitation = "GroupInvitation",
  AccountDeactivated = "AccountDeactivated",
  SystemAnnouncement = "SystemAnnouncement",
}

/**
 * @description Represents the related object a notification points to.
 */
export interface RelatedObjectInfo {
  objectType: NotificationObjectType;
  objectId?: string | null;
  navigateUrl: string;
}

/**
 * @description Represents a single notification item.
 * @response_from GET /api/v1/notifications/me
 */
export interface NotificationDto {
  id: string; // MongoDB ID
  userId: string; // Guid
  type: NotificationType;
  contentPreview: string;
  isRead: boolean;
  createdAt: string; // ISO Date String
  relatedObject?: RelatedObjectInfo | null;
}

/**
 * @description Request parameters for fetching notifications
 * @used_in GET /api/v1/notifications/me
 */
export interface GetNotificationsParams {
  pageParam?: number;
  pageSize?: number;
}

/**
 * @description Request parameters for marking notification as read
 * @used_in POST /api/v1/notifications/{id}/mark-as-read
 */
export interface MarkNotificationAsReadParams {
  id: string;
}
