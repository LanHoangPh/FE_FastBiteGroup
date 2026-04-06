// =================================================================
// ADMIN NOTIFICATIONS SPECIFIC TYPES
// These interfaces describe the data models related to admin notifications.
// =================================================================

/**
 * The official enumeration for notification types.
 */
export type AdminNotificationType =
  | "NewUserRegistered"
  | "ContentReported"
  | "NewGroupCreated"
  | "BackgroundJobFailed"
  | "GeneralAnnouncement";

/**
 * The main Data Transfer Object for a single notification.
 */
export interface AdminNotificationDto {
  id: number;
  notificationType: AdminNotificationType;
  message: string;
  linkTo?: string; // URL to navigate to when the notification is clicked
  isRead: boolean;
  timestamp: string; // ISO 8601 Date string
  triggeredByUserId?: string; // UUID
  triggeredByUserName?: string;
}

/**
 * The payload structure for real-time SignalR notifications.
 */
export interface RealtimeNotificationPayload {
  id: number;
  message: string;
  linkTo?: string;
  timestamp: string; // ISO 8601 Date string
}
