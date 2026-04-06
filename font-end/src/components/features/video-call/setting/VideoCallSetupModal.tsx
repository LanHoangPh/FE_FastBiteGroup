"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Phone, Video, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VideoPreview } from "./VideoPreview";
import { AudioSettings } from "./AudioSettings";
import { useMediaDevices } from "@/hooks/useLiveKitMedia";
import { startVideoCall, joinVideoCall } from "@/lib/api/customer/video-call";
import { VideoCallSessionData } from "@/types/video/video-call-api.types";
import {
  VideoCallSettings,
  VideoCallSetupProps,
} from "../../../../types/video/video-call.types";

export function VideoCallSetupModal({
  isOpen,
  onOpenChange,
  onJoinCall,
  groupId,
  groupName = "Group Call",
  userId,
  sessionId,
}: VideoCallSetupProps & { userId?: string }) {
  const { cameras, microphones, speakers, refreshDevices } = useMediaDevices();

  const [settings, setSettings] = useState<VideoCallSettings>({
    cameraEnabled: false,
    selectedCamera: null,
    availableCameras: [],
    microphoneEnabled: false,
    selectedMicrophone: null,
    availableMicrophones: [],
    selectedSpeaker: null,
    availableSpeakers: [],
    useComputerAudio: true,
    usePhoneAudio: false,
    joinWithVideo: false,
    joinWithAudio: false,
  });

  const [isStartingCall, setIsStartingCall] = useState(false);

  // Load devices when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshDevices();
    }
  }, [isOpen, refreshDevices]);

  // Update settings when devices are loaded
  useEffect(() => {
    if (cameras.length > 0 && microphones.length > 0 && speakers.length > 0) {
      setSettings((prev) => {
        if (
          prev.selectedCamera &&
          prev.selectedMicrophone &&
          prev.selectedSpeaker
        ) {
          return prev;
        }

        return {
          ...prev,
          availableCameras: cameras,
          availableMicrophones: microphones,
          availableSpeakers: speakers,
          selectedCamera: prev.selectedCamera || cameras[0]?.deviceId || null,
          selectedMicrophone:
            prev.selectedMicrophone || microphones[0]?.deviceId || null,
          selectedSpeaker:
            prev.selectedSpeaker || speakers[0]?.deviceId || null,
        };
      });
    }
  }, [cameras.length, microphones.length, speakers.length]);

  const handleSettingsChange = useCallback(
    (newSettings: Partial<VideoCallSettings>) => {
      setSettings((prev: VideoCallSettings) => ({ ...prev, ...newSettings }));
    },
    []
  );

  const handleJoinCall = async () => {
    if (!groupId) {
      return;
    }

    setIsStartingCall(true);
    try {
      let session: VideoCallSessionData;

      // If we have a session ID, we're joining an existing call
      if (sessionId) {
        const joinResponse = await joinVideoCall(
          sessionId,
          parseInt(groupId),
          userId
        );
        session = {
          videoCallSessionId: sessionId,
          livekitToken: joinResponse.livekitToken,
          livekitServerUrl: joinResponse.livekitServerUrl,
        };
      } else {
        // Otherwise, we're starting a new call
        session = await startVideoCall(parseInt(groupId));
      }

      onOpenChange(false);

      const settingsData = {
        cameraEnabled: settings.cameraEnabled,
        microphoneEnabled: settings.microphoneEnabled,
        selectedCamera: settings.selectedCamera,
        selectedMicrophone: settings.selectedMicrophone,
        selectedSpeaker: settings.selectedSpeaker,
        useComputerAudio: settings.useComputerAudio,
        usePhoneAudio: settings.usePhoneAudio,
      };

      const videoCallUrl = `/video-call/${
        session.videoCallSessionId
      }?groupName=${encodeURIComponent(groupName)}&token=${encodeURIComponent(
        session.livekitToken
      )}&serverUrl=${encodeURIComponent(
        session.livekitServerUrl
      )}&settings=${encodeURIComponent(
        JSON.stringify(settingsData)
      )}&isInitiator=${!sessionId}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ""
      }&conversationId=${encodeURIComponent(groupId)}`;
      window.open(videoCallUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Handle error silently or show toast
      console.error("Failed to join/start call:", error);
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[600px] p-0 bg-transparent border-0 shadow-none sm:max-w-5xl lg:max-w-6xl">
        <div className="relative w-full h-full">
          <div className="relative z-10 w-full h-full p-4">
            <div className="bg-gradient-to-br from-card via-card to-muted/50 rounded-2xl shadow-2xl border border-border/20 w-full max-w-4xl h-full max-h-[600px] flex flex-col animate-in zoom-in-95 fade-in-0 duration-300 sm:max-w-5xl lg:max-w-6xl backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/20">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-card-foreground text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      {sessionId ? "Tham gia" : "Bắt đầu"} {groupName}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm mt-1">
                      Thiết lập máy quay, thu âm và loa trước khi{" "}
                      {sessionId ? "tham gia" : "bắt đầu"} cuộc gọi. Cuộc gọi sẽ
                      mở trong tab mới.
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-card-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex flex-1 flex-col lg:flex-row min-h-0">
                {/* Left Panel - Video Preview */}
                <div className="flex-1 lg:flex-none lg:w-3/5">
                  <VideoPreview
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                  />
                </div>

                {/* Right Panel - Audio Settings */}
                <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-border/50 bg-gradient-to-br from-muted/20 to-transparent">
                  <AudioSettings
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border/50 flex-shrink-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
                <div className="text-sm text-muted-foreground">
                  Cuộc gọi sẽ mở trong tab mới
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isStartingCall}
                    className="px-6 py-2 border-border/50 hover:bg-muted/50"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleJoinCall}
                    disabled={isStartingCall}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200"
                  >
                    {isStartingCall ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {sessionId ? "Đang tham gia..." : "Đang mở cuộc gọi..."}
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        {sessionId ? "Tham gia cuộc gọi" : "Mở cuộc gọi"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
