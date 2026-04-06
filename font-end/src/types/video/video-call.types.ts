// types/video-call.types.ts

// =================================================================
// VIDEO CALL TYPES
// These interfaces describe the data models related to video calling.
// =================================================================

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface VideoCallSettings {
  // Camera settings
  cameraEnabled: boolean;
  selectedCamera: string | null;
  availableCameras: VideoDevice[];

  // Microphone settings
  microphoneEnabled: boolean;
  selectedMicrophone: string | null;
  availableMicrophones: AudioDevice[];

  // Speaker settings
  selectedSpeaker: string | null;
  availableSpeakers: AudioDevice[];

  // Audio settings
  useComputerAudio: boolean;
  usePhoneAudio: boolean;

  // Call settings
  joinWithVideo: boolean;
  joinWithAudio: boolean;
}

export interface VideoCallSetupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onJoinCall: (settings: VideoCallSettings) => void;
  groupId?: string;
  groupName?: string;
  sessionId?: string; // Added for joining existing calls
}

export interface VideoPreviewProps {
  settings: VideoCallSettings;
  onSettingsChange: (settings: Partial<VideoCallSettings>) => void;
}

export interface AudioSettingsProps {
  settings: VideoCallSettings;
  onSettingsChange: (settings: Partial<VideoCallSettings>) => void;
}
