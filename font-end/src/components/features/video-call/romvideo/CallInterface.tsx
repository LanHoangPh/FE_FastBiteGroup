//CallInterface.tsx;
"use client";

import React, { useState } from "react";
import {
  RoomContext,
  GridLayout,
  ParticipantTile,
  useTracks,
  FocusLayout,
  useMaybeLayoutContext,
  ConnectionQualityIndicator,
  ParticipantName,
  AudioTrack,
  VideoTrack,
  useRoomContext,
  useParticipants,
  ControlBar,
  RoomAudioRenderer,
} from "@livekit/components-react";
import {
  MessageCircle,
  Settings,
  Users,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { ChatPanel } from "./VideoChatPanel";
import { SettingsPanel } from "./SettingsPanel";
import { ScreenShareToggle } from "./ScreenShareToggle";
import { ScreenShareTextOverride } from "./ScreenShareTextOverride";
import { MicrophoneToggle } from "./MicrophoneToggle";
import { CameraToggle } from "./CameraToggle";
import { EndCallButton } from "./EndCallButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResponsiveVideoGrid } from "./ResponsiveVideoGrid";
import { ConnectionStatus } from "./ConnectionStatus";
import styles from "./CallInterface.module.css";
import "@livekit/components-styles";

// Loading component for better UX
function CallLoadingState({ message = "Đang tải..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

// Create a child component for the call interface
function CallInterface({
  groupName,
  showParticipants,
  setShowParticipants,
  showChat,
  setShowChat,
  showSettings,
  setShowSettings,
  roomId,
  conversationId,
  effectiveIsAdmin,
  isInitiator,
  userId,
  sessionDetails,
  handleEndCallForAll,
  isLeavingCall,
  parsedSettings,
}: {
  groupName: string;
  showParticipants: boolean;
  setShowParticipants: (show: boolean) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  roomId: string;
  conversationId: number;
  effectiveIsAdmin: boolean;
  isInitiator: boolean | undefined;
  userId: string | undefined;
  sessionDetails: any; // Session details from useVideoCallAdmin
  handleEndCallForAll: (
    message?: string,
    reason?: "ended_by_host" | "ended_by_user" | "connection_lost" | "unknown"
  ) => Promise<void>;
  isLeavingCall: boolean;
  parsedSettings: any;
}) {
  // ✅ SAFE to call useTracks() here
  // Because this component will ALWAYS render inside RoomContext.Provider
  const tracks = useTracks();
  const room = useRoomContext();
  const participants = useParticipants();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle loading state
  React.useEffect(() => {
    if (room && participants.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [room, participants.length]);

  // ✅ Use the layout context to check if there's a pinned track
  const layoutContext = useMaybeLayoutContext();
  const pinnedTrack = layoutContext?.pin.state?.[0] || null;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      className={cn(
        "h-screen w-screen bg-gray-900 relative overflow-hidden",
        isFullscreen && styles.fullscreenMode
      )}
    >
      {/* LiveKit Audio Renderer - handles all audio playback */}
      <RoomAudioRenderer />

      <ScreenShareTextOverride />

      <div
        className={cn(
          "h-full flex flex-col transition-all duration-300 ease-in-out",
          (showParticipants || showChat || showSettings) && "pr-80"
        )}
      >
        {/* Enhanced Header with better styling */}
        <div className="z-50 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg">
                  {groupName}
                </span>
                <span className="text-gray-300 text-sm">
                  {participants.length} người tham gia
                </span>
              </div>
              {/* Enhanced connection status indicator */}
              <ConnectionStatus />
            </div>
            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <Button
                onClick={toggleFullscreen}
                className={cn(
                  "rounded-full w-10 h-10 border-0 transition-all duration-200",
                  styles.floatingButton,
                  "bg-white/10 hover:bg-white/20 text-white"
                )}
                size="sm"
                variant="ghost"
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
              {/* Right side controls */}
              <Button
                onClick={() => setShowParticipants(!showParticipants)}
                className={cn(
                  "rounded-full w-10 h-10 border-0 transition-all duration-200",
                  styles.floatingButton,
                  showParticipants
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
                size="sm"
                variant="ghost"
                title="Người tham gia"
              >
                <Users className="w-5 h-5" />
                {participants.length > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center",
                      styles.participantCount
                    )}
                  >
                    {participants.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setShowChat(!showChat)}
                className={cn(
                  "rounded-full w-10 h-10 border-0 transition-all duration-200",
                  styles.floatingButton,
                  showChat
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
                size="sm"
                variant="ghost"
                title="Trò chuyện"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "rounded-full w-10 h-10 border-0 transition-all duration-200",
                  styles.floatingButton,
                  showSettings
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
                size="sm"
                variant="ghost"
                title="Cài đặt"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Video Conference Area */}
        <div
          className="flex-1 relative"
          style={{ height: "calc(100vh - 180px)" }}
        >
          {isLoading && <CallLoadingState message="Đang kết nối cuộc gọi..." />}

          {pinnedTrack ? (
            // 👉 If a track is pinned, render enhanced FocusLayout
            <div className="h-full w-full relative">
              <FocusLayout trackRef={pinnedTrack} className="h-full w-full" />
              {/* Enhanced overlay for pinned view */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className={cn(
                    "absolute top-4 left-4 rounded-lg px-3 py-2",
                    styles.screenShareIndicator
                  )}
                >
                  <span className="text-sm font-medium">📌 Đang ghim</span>
                </div>
              </div>
            </div>
          ) : (
            // 👉 Enhanced responsive grid layout
            <ResponsiveVideoGrid tracks={tracks} className="h-full w-full" />
          )}

          {/* No participants fallback */}
          {!isLoading && participants.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  Đang chờ người tham gia
                </h3>
                <p className="text-gray-400">
                  Cuộc gọi sẽ bắt đầu khi có người khác tham gia
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer Controls with better styling */}
        <div className="relative z-50 mt-auto h-auto min-h-[120px] flex items-end">
          <div className="w-full bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-sm p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Your custom API-based controls - keeping them as they are */}
              <MicrophoneToggle />
              <CameraToggle />
              <ScreenShareToggle />
              <EndCallButton
                sessionId={roomId}
                conversationId={conversationId}
                isHostOrAdmin={effectiveIsAdmin}
                onCallEnded={(message, reason) => {
                  handleEndCallForAll(message, reason);
                }}
              />
            </div>

            {/* Enhanced status indicators */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {/* Recording indicator */}
              {room && room.isRecording && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                    styles.recordingIndicator
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      styles.connectionPulse
                    )}
                  />
                  <span>Đang ghi âm</span>
                </div>
              )}

              {/* Screen sharing indicator */}
              {tracks.some((track) => track.source === "screen_share") && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                    styles.screenShareIndicator
                  )}
                >
                  <span>🖥️ Đang chia sẻ màn hình</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right Side Panels with better transitions */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-40",
          styles.sidePanel,
          !(showParticipants || showChat || showSettings) && "translate-x-full"
        )}
      >
        <ParticipantsPanel
          onClose={() => setShowParticipants(false)}
          isVisible={showParticipants}
          sessionId={roomId}
          conversationId={conversationId}
          isAdmin={effectiveIsAdmin}
          isInitiator={isInitiator}
          userId={userId}
          initiatorUserId={
            sessionDetails?.initiatorUserId ||
            (isInitiator ? userId : undefined)
          }
        />

        <ChatPanel onClose={() => setShowChat(false)} isVisible={showChat} />

        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onEndCallForAll={handleEndCallForAll}
          isLeavingCall={isLeavingCall}
          isVisible={showSettings}
          sessionId={roomId}
          isAdmin={effectiveIsAdmin}
          initialSettings={{
            selectedCamera: parsedSettings.selectedCamera,
            selectedMicrophone: parsedSettings.selectedMicrophone,
            selectedSpeaker: parsedSettings.selectedSpeaker,
          }}
        />
      </div>
    </div>
  );
}

// Export the component to fix the TypeScript error
export { CallInterface };
