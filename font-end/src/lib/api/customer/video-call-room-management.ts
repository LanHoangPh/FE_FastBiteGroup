/**
 * COMPREHENSIVE VIDEO CALL ROOM MANAGEMENT API
 * 
 * This file provides a complete API specification for video call room management
 * that the backend team can implement. It addresses all the current limitations
 * and provides a robust, scalable solution.
 * 
 * @author FastBite Group Frontend Team
 * @version 2.0.0
 * @created 2025-01-23
 */

import apiClient from "@/lib/api/apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";

// ===== COMPREHENSIVE TYPE DEFINITIONS =====

export interface VideoCallRoom {
  sessionId: string;
  conversationId: number;
  roomName: string;
  roomType: 'group' | 'direct' | 'broadcast';
  status: 'waiting' | 'active' | 'ended' | 'paused';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  durationInSeconds: number;
  maxParticipants: number;
  currentParticipantCount: number;
  isRecording: boolean;
  isLocked: boolean;
  settings: RoomSettings;
  initiator: ParticipantInfo;
  metadata?: Record<string, any>;
}

export interface RoomSettings {
  allowParticipantVideo: boolean;
  allowParticipantAudio: boolean;
  allowParticipantScreenShare: boolean;
  allowParticipantChat: boolean;
  requireAdminApproval: boolean;
  autoMuteNewParticipants: boolean;
  autoDisableVideoNewParticipants: boolean;
  maxSpeakingTime?: number; // seconds
  enableWaitingRoom: boolean;
  enableRecording: boolean;
  recordingSettings?: RecordingSettings;
}

export interface RecordingSettings {
  autoStart: boolean;
  includeAudio: boolean;
  includeVideo: boolean;
  includeScreenShare: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'webm' | 'mkv';
}

export interface ParticipantInfo {
  userId: string;
  userName: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  status: ParticipantStatus;
  connectionInfo: ConnectionInfo;
  joinedAt: string;
  leftAt?: string;
  lastActiveAt: string;
  totalSpeakingTime: number; // seconds
  isHandRaised: boolean;
  metadata?: Record<string, any>;
}

export type ParticipantRole = 
  | 'owner'        // Room creator, full control
  | 'admin'        // Full moderation rights
  | 'moderator'    // Limited moderation rights
  | 'presenter'    // Can share screen, elevated permissions
  | 'participant'  // Standard participant
  | 'observer';    // View-only, no interaction

export interface ParticipantPermissions {
  // Audio/Video Controls
  canUnmuteSelf: boolean;
  canMuteOthers: boolean;
  canUnmuteOthers: boolean;
  canDisableVideoSelf: boolean;
  canDisableVideoOthers: boolean;
  canEnableVideoOthers: boolean;
  
  // Screen Sharing
  canShareScreen: boolean;
  canStopOthersScreenShare: boolean;
  
  // Room Management
  canInviteParticipants: boolean;
  canRemoveParticipants: boolean;
  canPromoteParticipants: boolean;
  canDemoteParticipants: boolean;
  canLockRoom: boolean;
  canUnlockRoom: boolean;
  canEndCallForAll: boolean;
  
  // Recording
  canStartRecording: boolean;
  canStopRecording: boolean;
  canDownloadRecording: boolean;
  
  // Chat & Interaction
  canSendMessages: boolean;
  canDeleteMessages: boolean;
  canRaiseHand: boolean;
  canManageHandRaises: boolean;
  
  // Settings
  canChangeRoomSettings: boolean;
  canViewParticipantList: boolean;
  canViewAnalytics: boolean;
}

export type ParticipantStatus = 
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'muted'
  | 'video_disabled'
  | 'screen_sharing'
  | 'away'
  | 'disconnected'
  | 'reconnecting'
  | 'kicked'
  | 'banned';

export interface ConnectionInfo {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  networkStats: NetworkStats;
  deviceInfo: DeviceInfo;
}

export interface NetworkStats {
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  bandwidth: {
    upload: number; // kbps
    download: number; // kbps
  };
  lastUpdated: string;
}

export interface DeviceInfo {
  camera?: MediaDeviceInfo;
  microphone?: MediaDeviceInfo;
  speaker?: MediaDeviceInfo;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// ===== REQUEST/RESPONSE INTERFACES =====

export interface CreateRoomRequest {
  conversationId: number;
  roomType: 'group' | 'direct' | 'broadcast';
  settings?: Partial<RoomSettings>;
  inviteUserIds?: string[];
  scheduledStartTime?: string;
  metadata?: Record<string, any>;
}

export interface CreateRoomResponse {
  room: VideoCallRoom;
  livekitToken: string;
  livekitServerUrl: string;
  invitationLinks?: string[];
}

export interface JoinRoomRequest {
  userId?: string;
  displayName?: string;
  requestedRole?: ParticipantRole;
  deviceInfo?: Partial<DeviceInfo>;
  metadata?: Record<string, any>;
}

export interface JoinRoomResponse {
  room: VideoCallRoom;
  participant: ParticipantInfo;
  livekitToken: string;
  livekitServerUrl: string;
  waitingForApproval?: boolean;
}

export interface UpdateParticipantRequest {
  role?: ParticipantRole;
  permissions?: Partial<ParticipantPermissions>;
  status?: ParticipantStatus;
  metadata?: Record<string, any>;
}

export interface BulkParticipantActionRequest {
  participantIds: string[];
  action: 'mute' | 'unmute' | 'disable_video' | 'enable_video' | 'remove' | 'promote' | 'demote';
  targetRole?: ParticipantRole;
  reason?: string;
}

export interface RoomAnalytics {
  sessionId: string;
  totalDuration: number;
  peakParticipants: number;
  totalParticipants: number;
  averageParticipants: number;
  totalSpeakingTime: number;
  participantEngagement: ParticipantEngagement[];
  networkQualityStats: NetworkQualityStats;
  recordingInfo?: RecordingInfo;
}

export interface ParticipantEngagement {
  userId: string;
  userName: string;
  joinDuration: number;
  speakingTime: number;
  handRaises: number;
  messagesCount: number;
  averageConnectionQuality: string;
}

export interface NetworkQualityStats {
  averageLatency: number;
  averageJitter: number;
  averagePacketLoss: number;
  connectionIssues: number;
  reconnections: number;
}

export interface RecordingInfo {
  recordingId: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  fileSize: number;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

// ===== COMPREHENSIVE API FUNCTIONS =====

/**
 * ROOM LIFECYCLE MANAGEMENT
 */

export const createVideoCallRoom = async (
  request: CreateRoomRequest
): Promise<CreateRoomResponse> => {
  const response = await apiClient.post<ApiResponse<CreateRoomResponse>>(
    `/video-calls/rooms`,
    request
  );
  return response.data.data;
};

export const joinVideoCallRoom = async (
  sessionId: string,
  request: JoinRoomRequest
): Promise<JoinRoomResponse> => {
  const response = await apiClient.post<ApiResponse<JoinRoomResponse>>(
    `/video-calls/rooms/${sessionId}/join`,
    request
  );
  return response.data.data;
};

export const leaveVideoCallRoom = async (
  sessionId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(`/video-calls/rooms/${sessionId}/leave`, { reason });
};

export const endVideoCallRoom = async (
  sessionId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(`/video-calls/rooms/${sessionId}/end`, { reason });
};

/**
 * ROOM INFORMATION & STATUS
 */

export const getRoomDetails = async (
  sessionId: string
): Promise<VideoCallRoom> => {
  const response = await apiClient.get<ApiResponse<VideoCallRoom>>(
    `/video-calls/rooms/${sessionId}`
  );
  return response.data.data;
};

export const getRoomParticipants = async (
  sessionId: string,
  includeDisconnected = false
): Promise<ParticipantInfo[]> => {
  const response = await apiClient.get<ApiResponse<ParticipantInfo[]>>(
    `/video-calls/rooms/${sessionId}/participants`,
    { params: { includeDisconnected } }
  );
  return response.data.data;
};

export const getParticipantDetails = async (
  sessionId: string,
  userId: string
): Promise<ParticipantInfo> => {
  const response = await apiClient.get<ApiResponse<ParticipantInfo>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}`
  );
  return response.data.data;
};

/**
 * PARTICIPANT MANAGEMENT
 */

export const updateParticipant = async (
  sessionId: string,
  userId: string,
  request: UpdateParticipantRequest
): Promise<ParticipantInfo> => {
  const response = await apiClient.patch<ApiResponse<ParticipantInfo>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}`,
    request
  );
  return response.data.data;
};

export const removeParticipant = async (
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  await apiClient.delete(
    `/video-calls/rooms/${sessionId}/participants/${userId}`,
    { data: { reason } }
  );
};

export const bulkParticipantAction = async (
  sessionId: string,
  request: BulkParticipantActionRequest
): Promise<{ success: string[]; failed: string[] }> => {
  const response = await apiClient.post<ApiResponse<{ success: string[]; failed: string[] }>>(
    `/video-calls/rooms/${sessionId}/participants/bulk-action`,
    request
  );
  return response.data.data;
};

/**
 * AUDIO/VIDEO CONTROLS
 */

export const muteParticipant = async (
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/participants/${userId}/mute`,
    { reason }
  );
};

export const unmuteParticipant = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/participants/${userId}/unmute`
  );
};

export const disableParticipantVideo = async (
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/participants/${userId}/disable-video`,
    { reason }
  );
};

export const enableParticipantVideo = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/participants/${userId}/enable-video`
  );
};

export const stopParticipantScreenShare = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/participants/${userId}/stop-screen-share`
  );
};

/**
 * ROLE & PERMISSION MANAGEMENT
 */

export const promoteParticipant = async (
  sessionId: string,
  userId: string,
  targetRole: ParticipantRole
): Promise<ParticipantInfo> => {
  const response = await apiClient.post<ApiResponse<ParticipantInfo>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}/promote`,
    { targetRole }
  );
  return response.data.data;
};

export const demoteParticipant = async (
  sessionId: string,
  userId: string,
  targetRole: ParticipantRole
): Promise<ParticipantInfo> => {
  const response = await apiClient.post<ApiResponse<ParticipantInfo>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}/demote`,
    { targetRole }
  );
  return response.data.data;
};

export const updateParticipantPermissions = async (
  sessionId: string,
  userId: string,
  permissions: Partial<ParticipantPermissions>
): Promise<ParticipantInfo> => {
  const response = await apiClient.patch<ApiResponse<ParticipantInfo>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}/permissions`,
    { permissions }
  );
  return response.data.data;
};

/**
 * ROOM SETTINGS MANAGEMENT
 */

export const updateRoomSettings = async (
  sessionId: string,
  settings: Partial<RoomSettings>
): Promise<VideoCallRoom> => {
  const response = await apiClient.patch<ApiResponse<VideoCallRoom>>(
    `/video-calls/rooms/${sessionId}/settings`,
    { settings }
  );
  return response.data.data;
};

export const lockRoom = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/video-calls/rooms/${sessionId}/lock`);
};

export const unlockRoom = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/video-calls/rooms/${sessionId}/unlock`);
};

/**
 * RECORDING MANAGEMENT
 */

export const startRecording = async (
  sessionId: string,
  settings?: Partial<RecordingSettings>
): Promise<{ recordingId: string }> => {
  const response = await apiClient.post<ApiResponse<{ recordingId: string }>>(
    `/video-calls/rooms/${sessionId}/recording/start`,
    { settings }
  );
  return response.data.data;
};

export const stopRecording = async (
  sessionId: string
): Promise<RecordingInfo> => {
  const response = await apiClient.post<ApiResponse<RecordingInfo>>(
    `/video-calls/rooms/${sessionId}/recording/stop`
  );
  return response.data.data;
};

export const getRecordingInfo = async (
  sessionId: string,
  recordingId: string
): Promise<RecordingInfo> => {
  const response = await apiClient.get<ApiResponse<RecordingInfo>>(
    `/video-calls/rooms/${sessionId}/recordings/${recordingId}`
  );
  return response.data.data;
};

/**
 * ANALYTICS & REPORTING
 */

export const getRoomAnalytics = async (
  sessionId: string
): Promise<RoomAnalytics> => {
  const response = await apiClient.get<ApiResponse<RoomAnalytics>>(
    `/video-calls/rooms/${sessionId}/analytics`
  );
  return response.data.data;
};

export const getParticipantAnalytics = async (
  sessionId: string,
  userId: string
): Promise<ParticipantEngagement> => {
  const response = await apiClient.get<ApiResponse<ParticipantEngagement>>(
    `/video-calls/rooms/${sessionId}/participants/${userId}/analytics`
  );
  return response.data.data;
};

/**
 * ROOM HISTORY & SEARCH
 */

export interface RoomHistoryFilter {
  conversationId?: number;
  userId?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  minDuration?: number;
  maxDuration?: number;
  minParticipants?: number;
  maxParticipants?: number;
}

export const getRoomHistory = async (
  filter?: RoomHistoryFilter,
  pageNumber = 1,
  pageSize = 20
): Promise<PagedResult<VideoCallRoom>> => {
  const response = await apiClient.get<ApiResponse<PagedResult<VideoCallRoom>>>(
    `/video-calls/rooms/history`,
    { 
      params: { 
        ...filter, 
        pageNumber, 
        pageSize 
      } 
    }
  );
  return response.data.data;
};

/**
 * INVITATION MANAGEMENT
 */

export interface RoomInvitation {
  invitationId: string;
  sessionId: string;
  inviterUserId: string;
  inviteeUserId: string;
  inviteeEmail?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
}

export const inviteToRoom = async (
  sessionId: string,
  userIds: string[],
  message?: string
): Promise<RoomInvitation[]> => {
  const response = await apiClient.post<ApiResponse<RoomInvitation[]>>(
    `/video-calls/rooms/${sessionId}/invitations`,
    { userIds, message }
  );
  return response.data.data;
};

export const acceptRoomInvitation = async (
  invitationId: string
): Promise<JoinRoomResponse> => {
  const response = await apiClient.post<ApiResponse<JoinRoomResponse>>(
    `/video-calls/invitations/${invitationId}/accept`
  );
  return response.data.data;
};

export const declineRoomInvitation = async (
  invitationId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/invitations/${invitationId}/decline`,
    { reason }
  );
};

/**
 * WAITING ROOM MANAGEMENT
 */

export interface WaitingRoomParticipant {
  userId: string;
  userName: string;
  displayName?: string;
  requestedAt: string;
  deviceInfo?: Partial<DeviceInfo>;
  message?: string;
}

export const getWaitingRoomParticipants = async (
  sessionId: string
): Promise<WaitingRoomParticipant[]> => {
  const response = await apiClient.get<ApiResponse<WaitingRoomParticipant[]>>(
    `/video-calls/rooms/${sessionId}/waiting-room`
  );
  return response.data.data;
};

export const approveWaitingRoomParticipant = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/waiting-room/${userId}/approve`
  );
};

export const denyWaitingRoomParticipant = async (
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post(
    `/video-calls/rooms/${sessionId}/waiting-room/${userId}/deny`,
    { reason }
  );
};

/**
 * REAL-TIME EVENTS (WebSocket/SignalR)
 */

export interface RoomEvent {
  type: string;
  sessionId: string;
  userId?: string;
  timestamp: string;
  data: any;
}

export const subscribeToRoomEvents = (
  sessionId: string,
  onEvent: (event: RoomEvent) => void
): () => void => {
  // Implementation would depend on your WebSocket/SignalR setup
  // This is a placeholder for the subscription mechanism
  console.log(`Subscribing to room events for session: ${sessionId}`);
  
  // Return unsubscribe function
  return () => {
    console.log(`Unsubscribing from room events for session: ${sessionId}`);
  };
};

// ===== ERROR TYPES =====

export class VideoCallRoomError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'VideoCallRoomError';
  }
}

export const handleVideoCallError = (error: any): never => {
  if (error.response?.data?.errors) {
    const apiError = error.response.data.errors[0];
    throw new VideoCallRoomError(
      apiError.message,
      apiError.errorCode,
      error.response.status,
      error.response.data
    );
  }
  
  throw new VideoCallRoomError(
    error.message || 'Unknown video call error',
    'UNKNOWN_ERROR',
    error.response?.status
  );
};
