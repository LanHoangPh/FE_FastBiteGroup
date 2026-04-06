// store/videoCallEnhancedStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VideoCallStore,
  VideoCallSession,
  Participant,
  RecordingStatus,
} from "@/types/video/video-call-enhanced.types";

export const useVideoCallEnhancedStore = create<VideoCallStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      participants: [],
      isCallMinimized: false,
      activePanel: null,
      cameraEnabled: true,
      microphoneEnabled: true,
      speakerEnabled: true,
      isScreenSharing: false,
      isRecording: false,
      recordingStatus: "idle",

      // Actions
      setCurrentSession: (session) => set({ currentSession: session }),

      toggleCamera: () =>
        set((state) => ({ cameraEnabled: !state.cameraEnabled })),

      toggleMicrophone: () =>
        set((state) => ({ microphoneEnabled: !state.microphoneEnabled })),

      startScreenShare: () => set({ isScreenSharing: true }),

      stopScreenShare: () => set({ isScreenSharing: false }),

      startRecording: () =>
        set({
          isRecording: true,
          recordingStatus: "recording",
        }),

      stopRecording: () =>
        set({
          isRecording: false,
          recordingStatus: "idle",
        }),
    }),
    {
      name: "video-call-enhanced-store",
      partialize: (state) => ({
        currentSession: state.currentSession,
        cameraEnabled: state.cameraEnabled,
        microphoneEnabled: state.microphoneEnabled,
      }),
    }
  )
);
