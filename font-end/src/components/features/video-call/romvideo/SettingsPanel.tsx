"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Mic, PhoneOff, Volume2, Users, Settings, X, Sparkles } from "lucide-react";
import { useMediaDevices } from "@/hooks/useLiveKitMedia";
import { EndCallForAllModal } from "./EndCallForAllModal";

interface SettingsPanelProps {
  onClose: () => void;
  onEndCallForAll: () => void;
  isLeavingCall: boolean;
  isVisible?: boolean;
  sessionId: string;
  isAdmin?: boolean;
  initialSettings?: {
    selectedCamera?: string | null;
    selectedMicrophone?: string | null;
    selectedSpeaker?: string | null;
  };
}

export function SettingsPanel({
  onClose,
  onEndCallForAll,
  isLeavingCall,
  isVisible = true,
  sessionId,
  isAdmin = false,
  initialSettings,
}: SettingsPanelProps) {
  const { cameras, microphones, speakers, refreshDevices } = useMediaDevices();

  // Settings state
  const [roomSettings, setRoomSettings] = useState({
    selectedCamera: initialSettings?.selectedCamera || null,
    selectedMicrophone: initialSettings?.selectedMicrophone || null,
    selectedSpeaker: initialSettings?.selectedSpeaker || null,
  });

  // Modal state
  const [showEndCallModal, setShowEndCallModal] = useState(false);

  // Handle device changes
  const handleCameraChange = (deviceId: string) => {
    setRoomSettings((prev) => ({ ...prev, selectedCamera: deviceId }));
  };

  // Get device name by ID
  const getDeviceName = (deviceId: string | null, devices: any[]) => {
    if (!deviceId) return "Chưa chọn thiết bị";
    const device = devices.find((d) => d.deviceId === deviceId);
    return device?.label || `Device ${deviceId.slice(0, 8)}`;
  };

  const handleMicrophoneChange = (deviceId: string) => {
    setRoomSettings((prev) => ({ ...prev, selectedMicrophone: deviceId }));
  };

  const handleSpeakerChange = (deviceId: string) => {
    setRoomSettings((prev) => ({ ...prev, selectedSpeaker: deviceId }));
  };

  // Handle end call modal
  const handleEndCallClick = () => {
    setShowEndCallModal(true);
  };

  // Load devices when component mounts
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setRoomSettings({
        selectedCamera: initialSettings.selectedCamera || null,
        selectedMicrophone: initialSettings.selectedMicrophone || null,
        selectedSpeaker: initialSettings.selectedSpeaker || null,
      });
    }
  }, [initialSettings]);

  // Update settings when devices are loaded
  useEffect(() => {
    if (cameras.length > 0 && microphones.length > 0 && speakers.length > 0) {
      setRoomSettings((prev) => {
        return {
          ...prev,
          selectedCamera: prev.selectedCamera || cameras[0]?.deviceId || null,
          selectedMicrophone:
            prev.selectedMicrophone || microphones[0]?.deviceId || null,
          selectedSpeaker:
            prev.selectedSpeaker || speakers[0]?.deviceId || null,
        };
      });
    }
  }, [cameras.length, microphones.length, speakers.length]);

  return (
    <>
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-card via-card to-card/95 border-l border-border/50 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl backdrop-blur-xl ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Enhanced Header */}
        <div className="p-4 border-b border-border/30 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Settings className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-card-foreground font-semibold text-lg">
                  Cài đặt
                </h3>
                <p className="text-xs text-muted-foreground">Thiết bị và cuộc gọi</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Enhanced Settings Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto scroll-smooth bg-gradient-to-b from-transparent via-background/5 to-transparent scrollbar-hide">
          {/* Enhanced Camera Settings */}
          <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 shadow-lg">
                <Camera className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <Label className="text-card-foreground font-semibold text-lg">
                  Máy quay
                </Label>
                <p className="text-xs text-muted-foreground">Chọn thiết bị camera</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-sm font-medium">Thiết bị được chọn</Label>
              <Select
                value={roomSettings.selectedCamera || ""}
                onValueChange={handleCameraChange}
              >
                <SelectTrigger className="bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-card-foreground max-w-full overflow-hidden rounded-xl h-12 shadow-sm hover:shadow-md transition-all duration-200">
                  <SelectValue
                    placeholder={getDeviceName(
                      roomSettings.selectedCamera,
                      cameras
                    )}
                    className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium"
                  />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-card to-card/95 border-border/50 shadow-xl backdrop-blur-xl rounded-xl">
                  {cameras.map((camera) => (
                    <SelectItem
                      key={camera.deviceId}
                      value={camera.deviceId}
                      className="text-card-foreground hover:bg-cyan-500/10 truncate rounded-lg m-1 transition-all duration-200"
                      title={
                        camera.label || `Camera ${camera.deviceId.slice(0, 8)}`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <span>{camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Microphone Settings */}
          <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/5 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 shadow-lg">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <Label className="text-card-foreground font-semibold text-lg">
                  Thu âm
                </Label>
                <p className="text-xs text-muted-foreground">Chọn thiết bị microphone</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-sm font-medium">Thiết bị được chọn</Label>
              <Select
                value={roomSettings.selectedMicrophone || ""}
                onValueChange={handleMicrophoneChange}
              >
                <SelectTrigger className="bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-card-foreground max-w-full overflow-hidden rounded-xl h-12 shadow-sm hover:shadow-md transition-all duration-200">
                  <SelectValue
                    placeholder={getDeviceName(
                      roomSettings.selectedMicrophone,
                      microphones
                    )}
                    className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium"
                  />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-card to-card/95 border-border/50 shadow-xl backdrop-blur-xl rounded-xl">
                  {microphones.map((microphone) => (
                    <SelectItem
                      key={microphone.deviceId}
                      value={microphone.deviceId}
                      className="text-card-foreground hover:bg-purple-500/10 truncate rounded-lg m-1 transition-all duration-200"
                      title={
                        microphone.label ||
                        `Microphone ${microphone.deviceId.slice(0, 8)}`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span>{microphone.label ||
                          `Microphone ${microphone.deviceId.slice(0, 8)}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Speaker Settings */}
          <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 shadow-lg shadow-green-500/5 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 shadow-lg">
                <Volume2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <Label className="text-card-foreground font-semibold text-lg">Loa</Label>
                <p className="text-xs text-muted-foreground">Chọn thiết bị phát âm thanh</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-sm font-medium">Thiết bị được chọn</Label>
              <Select
                value={roomSettings.selectedSpeaker || ""}
                onValueChange={handleSpeakerChange}
              >
                <SelectTrigger className="bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 text-card-foreground max-w-full overflow-hidden rounded-xl h-12 shadow-sm hover:shadow-md transition-all duration-200">
                  <SelectValue
                    placeholder={getDeviceName(
                      roomSettings.selectedSpeaker,
                      speakers
                    )}
                    className="truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium"
                  />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-card to-card/95 border-border/50 shadow-xl backdrop-blur-xl rounded-xl">
                  {speakers.map((speaker) => (
                    <SelectItem
                      key={speaker.deviceId}
                      value={speaker.deviceId}
                      className="text-card-foreground hover:bg-green-500/10 truncate rounded-lg m-1 transition-all duration-200"
                      title={
                        speaker.label ||
                        `Speaker ${speaker.deviceId.slice(0, 8)}`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-green-400" />
                        <span>{speaker.label ||
                          `Speaker ${speaker.deviceId.slice(0, 8)}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced End Call Section - Only for Admins */}
          {isAdmin && (
            <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 shadow-lg shadow-red-500/5 backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 shadow-lg">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <Label className="text-card-foreground font-semibold text-lg">
                    Quản lý cuộc gọi
                  </Label>
                  <p className="text-xs text-muted-foreground">Chỉ dành cho quản trị viên</p>
                </div>
              </div>
              <Button
                onClick={handleEndCallClick}
                disabled={isLeavingCall}
                variant="destructive"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50 rounded-xl font-semibold"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                {isLeavingCall ? "Đang kết thúc..." : "Kết thúc cuộc gọi"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* End Call For All Modal */}
      <EndCallForAllModal
        isOpen={showEndCallModal}
        onClose={() => setShowEndCallModal(false)}
        sessionId={sessionId}
        onCallEnded={onEndCallForAll}
      />
    </>
  );
}
