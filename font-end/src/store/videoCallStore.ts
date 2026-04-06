import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VideoCallSession {
  sessionId: string;
  conversationId: number;
  livekitToken: string;
  livekitServerUrl: string;
  isActive: boolean;
  isInitiator?: boolean;
}

interface VideoCallStore {
  // Current active call session
  currentSession: VideoCallSession | null;
  
  // UI state
  isCallSetupModalOpen: boolean;
  isCallMinimized: boolean;
  
  // Actions
  setCurrentSession: (session: VideoCallSession | null) => void;
  clearCurrentSession: () => void;
  setCallSetupModalOpen: (isOpen: boolean) => void;
  setCallMinimized: (isMinimized: boolean) => void;
  
  // Helper methods
  isInCall: () => boolean;
  getCurrentSessionId: () => string | null;
}

export const useVideoCallStore = create<VideoCallStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isCallSetupModalOpen: false,
      isCallMinimized: false,
      
      // Actions
      setCurrentSession: (session) => {
        set({ currentSession: session });
      },
      
      clearCurrentSession: () => {
        set({ 
          currentSession: null,
          isCallMinimized: false 
        });
      },
      
      setCallSetupModalOpen: (isOpen) => {
        set({ isCallSetupModalOpen: isOpen });
      },
      
      setCallMinimized: (isMinimized) => {
        set({ isCallMinimized: isMinimized });
      },
      
      // Helper methods
      isInCall: () => {
        const session = get().currentSession;
        return session !== null && session.isActive;
      },
      
      getCurrentSessionId: () => {
        const session = get().currentSession;
        return session?.sessionId || null;
      },
    }),
    {
      name: "video-call-store",
      // Only persist essential data, not UI state
      partialize: (state) => ({
        currentSession: state.currentSession,
      }),
    }
  )
);
