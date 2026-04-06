// types/video-call-api.types.ts

import { ApiResponse } from "../api.types";

/**
 * Video Call API Response Types
 */

export interface VideoCallSessionData {
  videoCallSessionId: string;
  livekitToken: string;
  livekitServerUrl: string;
}

export interface StartVideoCallRequest {
  conversationId: number;
}

// Backend response format
export interface StartCallResponseDto {
  videoCallSessionId: string; // Backend returns as string
  livekitToken: string;
  livekitServerUrl: string;
}

export interface StartVideoCallResponse
  extends ApiResponse<StartCallResponseDto> {}

// Backend response format for joining calls
export interface JoinCallResponseDto {
  livekitToken: string;
  livekitServerUrl: string;
}

export interface JoinVideoCallResponse
  extends ApiResponse<JoinCallResponseDto> {}

/**
 * Video Call Session Types
 */
export interface VideoCallSession {
  sessionId: string;
  conversationId: number;
  livekitToken: string;
  livekitServerUrl: string;
  participants: VideoCallParticipant[];
  isActive: boolean;
  startedAt: Date;
}

export interface VideoCallParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  joinedAt: Date;
}

/**
 * LiveKit Integration Types
 */
export interface LiveKitRoomConfig {
  url: string;
  token: string;
  options?: {
    adaptiveStream?: boolean;
    dynacast?: boolean;
    publishDefaults?: {
      videoSimulcastLayers?: any[];
      videoCodec?: string;
    };
  };
}

export interface VideoCallState {
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  participants: VideoCallParticipant[];
  localParticipant?: VideoCallParticipant;
}
