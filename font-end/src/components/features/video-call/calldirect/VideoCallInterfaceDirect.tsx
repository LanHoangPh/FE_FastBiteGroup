"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Minus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";
import { useAuthStore } from "@/store/authStore";
import { VideoCallDirectLayout } from "./LiveKitVideoCallDirect";
import { UltraMinimizedCall } from "./UltraMinimizedCall";
import { MinimizedCall } from "./MinimizedCall";

type VideoCallSize = "fullscreen" | "minimized" | "ultra-minimized";

interface VideoCallInterface1v1Props {
  size?: VideoCallSize;
  onSizeChange?: (size: VideoCallSize) => void;
  onClose?: () => void;
  className?: string;
}

export function VideoCallInterface1v1({
  size = "fullscreen",
  onSizeChange,
  onClose,
  className,
}: VideoCallInterface1v1Props) {
  const { videoCallState, acceptCall, declineCall, endCall } =
    useVideoCallContext();
  const { user: currentUser } = useAuthStore();
  // Get controls from context instead of managing local state
  const controls = videoCallState.controls;
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUserEndingCall, setIsUserEndingCall] = useState(false);

  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get caller/receiver info
  const callerInfo = videoCallState.isIncomingCall
    ? videoCallState.incomingCallData?.caller
    : videoCallState.isOutgoingCall
    ? {
        userId: videoCallState.outgoingCallData?.receiverId || "",
        fullName: videoCallState.outgoingCallData?.receiverName || "",
        avatarUrl: videoCallState.outgoingCallData?.receiverAvatar,
      }
    : videoCallState.callerProfile;

  // Handle call duration
  useEffect(() => {
    if (
      videoCallState.callStatus === "connected" &&
      !callStartTimeRef.current
    ) {
      callStartTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const newDuration = Math.floor(
            (Date.now() - callStartTimeRef.current) / 1000
          );
          setCallDuration(newDuration);
        }
      }, 1000);
    } else if (
      videoCallState.callStatus !== "connected" &&
      callStartTimeRef.current
    ) {
      callStartTimeRef.current = null;
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [videoCallState.callStatus]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle incoming call
  const handleAcceptCall = async () => {
    if (videoCallState.incomingCallData) {
      setIsConnecting(true);
      try {
        await acceptCall(videoCallState.incomingCallData.videoCallSessionId);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleDeclineCall = async () => {
    if (videoCallState.incomingCallData) {
      await declineCall(videoCallState.incomingCallData.videoCallSessionId);
    }
  };

  const handleEndCall = async (isUserInitiated: boolean = true) => {
    const sessionId =
      videoCallState.incomingCallData?.videoCallSessionId ||
      videoCallState.outgoingCallData?.sessionId ||
      videoCallState.navigationData?.sessionId ||
      videoCallState.sessionData?.videoCallSessionId;

    if (isUserInitiated) {
      setIsUserEndingCall(true);
    }

    if (sessionId && isUserInitiated) {
      await endCall(sessionId);
    }
    onClose?.();
  };

  // Show incoming call UI
  if (videoCallState.isIncomingCall && videoCallState.incomingCallData) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className
        )}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Caller Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-green-500/20">
                <AvatarImage src={callerInfo?.avatarUrl} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-green-400 to-blue-500 text-white">
                  {callerInfo?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Caller Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {callerInfo?.fullName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Cuộc gọi video đến
              </p>
            </div>

            {/* Call Actions */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDeclineCall}
                size="lg"
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleAcceptCall}
                disabled={isConnecting}
                size="lg"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show outgoing call UI
  if (videoCallState.isOutgoingCall && videoCallState.outgoingCallData) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className
        )}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            {/* Receiver Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-blue-500/20">
                <AvatarImage src={callerInfo?.avatarUrl} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {callerInfo?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Receiver Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {callerInfo?.fullName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Đang gọi...</p>
            </div>

            {/* Call Actions */}
            <div className="flex justify-center">
              <Button
                onClick={() => handleEndCall(true)}
                size="lg"
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show active call UI
  if (videoCallState.callStatus === "connected") {
    // Ultra minimized call - chỉ hiển thị thời gian
    if (size === "ultra-minimized") {
      return (
        <UltraMinimizedCall
          callerName={callerInfo?.fullName}
          callDuration={callDuration}
          onExpand={() => onSizeChange?.("minimized")}
          onClose={() => handleEndCall(true)}
        />
      );
    }

    // Minimized call - có thể drag
    if (size === "minimized") {
      return (
        <MinimizedCall
          callerInfo={callerInfo}
          callDuration={callDuration}
          isVideoEnabled={controls?.isVideoEnabled || false}
          isAudioEnabled={controls?.isAudioEnabled || false}
          liveKitControls={controls}
          onSizeChange={onSizeChange!}
          onClose={() => handleEndCall(true)}
          localUserName={currentUser?.fullName}
          localUserAvatar={currentUser?.avatarUrl || undefined}
        />
      );
    }

    // Fullscreen call
    return (
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[65vw] h-[55vh] max-w-3xl max-h-[500px]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 flex-shrink-0 p-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={callerInfo?.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xs">
                {callerInfo?.fullName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="block">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {callerInfo?.fullName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(callDuration)}
                </Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Ultra minimize button - chỉ hiển thị khi không phải ultra-minimized */}
            {size !== ("ultra-minimized" as VideoCallSize) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSizeChange?.("ultra-minimized")}
                className="w-6 h-6"
                title="Thu nhỏ tối đa"
              >
                <Minus className="w-3 h-3" />
              </Button>
            )}

            {/* Minimize/Maximize button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSizeChange?.("minimized")}
              className="w-6 h-6"
              title="Thu nhỏ"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEndCall(true)}
              className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Kết thúc cuộc gọi"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Video Conference */}
        <div className="flex-1 relative min-h-0">
          {videoCallState.room ? (
            <VideoCallDirectLayout
              room={videoCallState.room}
              partnerName={callerInfo?.fullName}
              partnerAvatar={callerInfo?.avatarUrl}
              localUserName={currentUser?.fullName}
              localUserAvatar={currentUser?.avatarUrl || undefined}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-white">Connecting...</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <Button
            variant={controls?.isAudioEnabled ? "default" : "destructive"}
            size="icon"
            onClick={() => controls?.toggleAudio()}
            className="rounded-full w-12 h-12"
          >
            {controls?.isAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant={controls?.isVideoEnabled ? "default" : "destructive"}
            size="icon"
            onClick={() => controls?.toggleVideo()}
            className="rounded-full w-12 h-12"
          >
            {controls?.isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleEndCall(true)}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
