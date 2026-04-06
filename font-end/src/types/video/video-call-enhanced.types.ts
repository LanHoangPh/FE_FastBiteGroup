// types/video-call-enhanced.types.ts

// Enhanced interfaces for advanced video calling features

export interface VideoCallStore {
  // Session management
  currentSession: VideoCallSession | null;
  participants: Participant[];

  // UI state
  isCallMinimized: boolean;
  activePanel: "chat" | "participants" | "settings" | null;

  // Media settings
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  speakerEnabled: boolean;

  // Advanced features
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingStatus: "idle" | "starting" | "recording" | "stopping";

  // Actions
  setCurrentSession: (session: VideoCallSession | null) => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export interface VideoCallSession {
  sessionId: string;
  conversationId: number;
  livekitToken: string;
  livekitServerUrl: string;
  isActive: boolean;
  isInitiator?: boolean;
  groupName?: string;
  participants: Participant[];
}

export interface Participant {
  identity: string;
  name: string;
  isLocal: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenShareEnabled: boolean;
  role: "host" | "moderator" | "participant";
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  timestamp: Date;
}

export interface RecordingStatus {
  status: "idle" | "starting" | "recording" | "stopping";
  egressId?: string;
  startedAt?: Date;
}

export interface ScreenShareOptions {
  audio: boolean;
  selfBrowserSurface: "include" | "exclude";
  systemAudio: "include" | "exclude";
}
