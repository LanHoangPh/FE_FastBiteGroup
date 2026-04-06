"use client";

import { useRef, useEffect, useState } from "react";
import { Video, VideoOff, Loader2, AlertCircle, User } from "lucide-react";
import { VideoCallSettings } from "../../../../types/video/video-call.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SimpleCameraPreviewProps {
  settings: VideoCallSettings;
  onSettingsChange: (settings: Partial<VideoCallSettings>) => void;
}

export function SimpleCameraPreview({
  settings,
  onSettingsChange,
}: SimpleCameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera when enabled
  useEffect(() => {
    if (settings.cameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [settings.cameraEnabled, settings.selectedCamera]);

  // Update video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Handle video play error silently
      });
    }
  }, [stream]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: settings.selectedCamera
          ? { deviceId: settings.selectedCamera }
          : true,
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError("Không thể truy cập camera");
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Enhanced Video Preview Area */}
      <div className="w-full h-full relative flex items-center justify-center">
        {settings.cameraEnabled ? (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-semibold mb-1">
                    Đang kết nối camera
                  </p>
                  <p className="text-gray-400 text-sm">
                    Vui lòng chờ giây lát...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-red-400 text-lg font-semibold mb-1">
                    Lỗi camera
                  </p>
                  <p className="text-gray-400 text-sm max-w-xs">
                    {error}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Kiểm tra quyền truy cập camera
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    minWidth: "100%",
                    minHeight: "100%",
                  }}
                />
                {/* Video overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Enhanced Camera Off State */}
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white/10 shadow-2xl">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-2xl font-bold">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-gray-900 flex items-center justify-center shadow-lg">
                <VideoOff className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-white text-lg font-semibold">
                Camera đang tắt
              </p>
              <p className="text-gray-400 text-sm max-w-xs">
                Bật camera để xem trước hình ảnh của bạn
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-red-400/30 animate-pulse" />
            <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-8 left-6 w-2 h-2 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        )}
      </div>
      
      {/* Enhanced Corner Indicators */}
      <div className="absolute top-3 left-3">
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border",
          settings.cameraEnabled && !error && !isLoading
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            settings.cameraEnabled && !error && !isLoading
              ? "bg-green-400 animate-pulse"
              : "bg-gray-400"
          )} />
          <span>
            {settings.cameraEnabled && !error && !isLoading ? "Trực tiếp" : "Ngoại tuyến"}
          </span>
        </div>
      </div>
    </div>
  );
}
