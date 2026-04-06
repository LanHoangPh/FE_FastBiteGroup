"use client";

import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  Camera,
  CameraOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VideoCallSettings,
  AudioSettingsProps,
} from "../../../../types/video/video-call.types";

export function AudioSettings({
  settings,
  onSettingsChange,
}: AudioSettingsProps) {
  const handleMicrophoneToggle = (enabled: boolean) => {
    onSettingsChange({ microphoneEnabled: enabled });
  };

  const handleCameraToggle = (enabled: boolean) => {
    onSettingsChange({
      cameraEnabled: enabled,
      joinWithVideo: enabled,
    });
  };

  const handleMicrophoneChange = (deviceId: string) => {
    onSettingsChange({ selectedMicrophone: deviceId });
  };

  const handleSpeakerChange = (deviceId: string) => {
    onSettingsChange({ selectedSpeaker: deviceId });
  };

  const handleAudioOptionChange = (value: string) => {
    if (value === "computer") {
      onSettingsChange({ useComputerAudio: true, usePhoneAudio: false });
    } else if (value === "phone") {
      onSettingsChange({ useComputerAudio: false, usePhoneAudio: true });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-card/80 via-card to-muted/30 rounded-r-xl lg:rounded-r-xl rounded-b-xl lg:rounded-b-none p-4 lg:p-6 overflow-y-auto scrollbar-hide backdrop-blur-sm">
      <div className="space-y-3 lg:space-y-4">
        {/* Audio Options */}
        <div className="space-y-3">
          <h3 className="text-card-foreground font-bold text-xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Cài đặt
          </h3>

          <RadioGroup
            value={settings.useComputerAudio ? "computer" : "phone"}
            onValueChange={handleAudioOptionChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
              <RadioGroupItem
                value="computer"
                id="computer-audio"
                className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
              />
              <Label
                htmlFor="computer-audio"
                className="text-card-foreground font-medium cursor-pointer"
              >
                Âm thanh máy tính
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
              <RadioGroupItem
                value="phone"
                id="phone-audio"
                className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
              />
              <Label
                htmlFor="phone-audio"
                className="text-card-foreground font-medium cursor-pointer"
              >
                Không sử dụng âm thanh
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Camera Settings */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10">
                {settings.cameraEnabled ? (
                  <Camera className="w-5 h-5 text-cyan-500" />
                ) : (
                  <CameraOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <Label
                htmlFor="camera-toggle"
                className="text-card-foreground font-semibold"
              >
                Máy quay
              </Label>
            </div>
            <Switch
              id="camera-toggle"
              checked={settings.cameraEnabled}
              onCheckedChange={handleCameraToggle}
              className="data-[state=checked]:bg-cyan-500 ring-2 ring-transparent data-[state=checked]:ring-cyan-400/20 transition-all duration-200"
            />
          </div>

          {/* Camera Selection */}
          {settings.cameraEnabled && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Máy quay</Label>
              <Select
                value={settings.selectedCamera || ""}
                onValueChange={(deviceId) =>
                  onSettingsChange({ selectedCamera: deviceId })
                }
              >
                <SelectTrigger className="bg-card border-border text-card-foreground">
                  <SelectValue placeholder="Chọn máy quay" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {settings.availableCameras.map((camera) => (
                    <SelectItem
                      key={camera.deviceId}
                      value={camera.deviceId}
                      className="text-card-foreground hover:bg-accent"
                    >
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Microphone Settings */}
        <div
          className={`space-y-3 p-4 rounded-xl border transition-all duration-200 ${
            settings.useComputerAudio
              ? "bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border-purple-500/10"
              : "bg-muted/10 border-muted/20 opacity-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-all duration-200 ${
                  settings.useComputerAudio
                    ? "bg-gradient-to-br from-purple-500/10 to-purple-600/10"
                    : "bg-muted/20"
                }`}
              >
                {settings.microphoneEnabled && settings.useComputerAudio ? (
                  <Mic className="w-5 h-5 text-purple-500" />
                ) : (
                  <MicOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <Label
                htmlFor="mic-toggle"
                className={`font-semibold transition-all duration-200 ${
                  settings.useComputerAudio
                    ? "text-card-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Thu âm
              </Label>
            </div>
            <Switch
              id="mic-toggle"
              checked={settings.microphoneEnabled && settings.useComputerAudio}
              onCheckedChange={handleMicrophoneToggle}
              disabled={!settings.useComputerAudio}
              className="data-[state=checked]:bg-purple-500 ring-2 ring-transparent data-[state=checked]:ring-purple-400/20 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {settings.microphoneEnabled && settings.useComputerAudio && (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Thu âm</Label>
                <Select
                  value={settings.selectedMicrophone || ""}
                  onValueChange={handleMicrophoneChange}
                  disabled={!settings.useComputerAudio}
                >
                  <SelectTrigger className="bg-card border-border text-card-foreground disabled:opacity-50">
                    <SelectValue placeholder="Chọn microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {settings.availableMicrophones.map((mic) => (
                      <SelectItem
                        key={mic.deviceId}
                        value={mic.deviceId}
                        className="text-card-foreground hover:bg-accent"
                      >
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Speaker Settings */}
        <div
          className={`space-y-3 p-4 rounded-xl border transition-all duration-200 ${
            settings.useComputerAudio
              ? "bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 border-indigo-500/10"
              : "bg-muted/10 border-muted/20 opacity-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-all duration-200 ${
                settings.useComputerAudio
                  ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/10"
                  : "bg-muted/20"
              }`}
            >
              <Volume2
                className={`w-5 h-5 transition-all duration-200 ${
                  settings.useComputerAudio
                    ? "text-indigo-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <Label
              className={`font-semibold transition-all duration-200 ${
                settings.useComputerAudio
                  ? "text-card-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Loa
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Loa</Label>
            <Select
              value={settings.selectedSpeaker || ""}
              onValueChange={handleSpeakerChange}
              disabled={!settings.useComputerAudio}
            >
              <SelectTrigger className="bg-card border-border text-card-foreground disabled:opacity-50">
                <SelectValue placeholder="Chọn loa" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {settings.availableSpeakers.map((speaker) => (
                  <SelectItem
                    key={speaker.deviceId}
                    value={speaker.deviceId}
                    className="text-card-foreground hover:bg-accent"
                  >
                    {speaker.label || `Loa ${speaker.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
