// types/user.ts

// =================================================================
// USER PROFILE & ACCOUNT MANAGEMENT TYPES
// These interfaces describe data models for the current user's profile
// and account management features under /api/v1/me endpoints.
// =================================================================

import { UserPresenceStatus } from "@/types/customer/models";

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
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string; // ISO Date String
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
  userName: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string; // ISO Date String
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string; // ISO Date String
  lastLoginAt?: string; // ISO Date String
}

/**
 * Login history entry for the current user
 */
export interface LoginHistoryDto {
  loginId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string; // ISO Date String
  isSuccessful: boolean;
  failureReason?: string;
  location?: string;
}

/**
 * Privacy settings for the current user
 */
export interface PrivacySettingsDto {
  messagingPrivacy: number; // 0 = Everyone, 1 = Friends only, 2 = No one
  profileVisibility: number; // 0 = Public, 1 = Friends only, 2 = Private
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowFriendRequests: boolean;
}

/**
 * Notification settings for the current user
 */
export interface NotificationSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  friendRequests: boolean;
  messages: boolean;
  groupUpdates: boolean;
}

/**
 * Account deactivation request information
 */
export interface DeactivationRequestDto {
  requestId: string;
  reasonCategory: string;
  reasonDetails?: string;
  requestedAt: string; // ISO Date String
  status: "pending" | "approved" | "rejected";
  processedAt?: string; // ISO Date String
  processedBy?: string;
}

/**
 * Account deletion request information
 */
export interface DeletionRequestDto {
  requestId: string;
  requestedAt: string; // ISO Date String
  status: "pending" | "approved" | "rejected";
  processedAt?: string; // ISO Date String
  processedBy?: string;
  deletionScheduledFor?: string; // ISO Date String
}

/**
 * Two-factor authentication setup information
 */
export interface TwoFactorSetupDto {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

/**
 * Security audit log entry
 */
export interface SecurityAuditDto {
  auditId: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string; // ISO Date String
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * User activity summary
 */
export interface ActivitySummaryDto {
  totalMessages: number;
  totalGroups: number;
  totalContacts: number;
  lastActivity: string; // ISO Date String
  accountAge: number; // in days
  loginStreak: number; // consecutive days
}
