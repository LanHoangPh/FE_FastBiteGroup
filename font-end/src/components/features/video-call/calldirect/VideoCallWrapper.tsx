"use client";

import React, { useState, useEffect } from "react";
import { VideoCallInterface1v1 } from "./VideoCallInterfaceDirect";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";
import { LiveKitVideoCallDirect } from "./LiveKitVideoCallDirect";
import { useAuthStore } from "@/store/authStore";

type VideoCallSize = "fullscreen" | "minimized" | "ultra-minimized";

interface VideoCallWrapperProps {
  onClose?: () => void;
  className?: string;
}

export function VideoCallWrapper({
  onClose,
  className,
}: VideoCallWrapperProps) {
  const [size, setSize] = useState<VideoCallSize>("fullscreen");
  const [hasAutoMinimized, setHasAutoMinimized] = useState(false);
  const { videoCallState } = useVideoCallContext();
  const { user: currentUser } = useAuthStore();

  // Get the necessary props for LiveKitVideoCallDirect from Context
  const sessionId =
    videoCallState.navigationData?.sessionId ||
    videoCallState.sessionData?.videoCallSessionId ||
    "";

  const conversationId =
    videoCallState.navigationData?.conversationId ||
    videoCallState.conversationId ||
    0;

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

  // Auto-minimize after 3 seconds if call is connected (only once per call)
  useEffect(() => {
    if (videoCallState.callStatus === "connected" && !hasAutoMinimized) {
      const timer = setTimeout(() => {
        setSize("minimized");
        setHasAutoMinimized(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Reset auto-minimize flag when call ends
    if (videoCallState.callStatus !== "connected") {
      setHasAutoMinimized(false);
      setSize("fullscreen"); // Reset to fullscreen for next call
    }
  }, [videoCallState.callStatus, hasAutoMinimized]);

  const handleSizeChange = (newSize: VideoCallSize) => {
    setSize(newSize);
    // Prevent auto-minimize after manual size change
    if (newSize === "fullscreen") {
      setHasAutoMinimized(true);
    }
  };

  return (
    <>
      {/* 1. The "ENGINE" always runs in the background */}
      {/* This only manages connection + provides `room` into Context. */}
      {/* It doesn't render video UI anymore, so we can safely hide it. */}
      {sessionId && conversationId && (
        <div className="hidden">
          <LiveKitVideoCallDirect
            sessionId={sessionId}
            conversationId={conversationId}
            onClose={onClose || (() => {})}
            partnerName={callerInfo?.fullName}
            partnerAvatar={callerInfo?.avatarUrl}
            localUserName={currentUser?.fullName}
            localUserAvatar={currentUser?.avatarUrl || undefined}
            livekitToken={
              videoCallState.navigationData?.token ||
              videoCallState.sessionData?.livekitToken
            }
            livekitServerUrl={
              videoCallState.navigationData?.serverUrl ||
              videoCallState.sessionData?.livekitServerUrl
            }
          />
        </div>
      )}

      {/* 2. The UI "SHELLS" */}
      {/* These consume `room` from Context and display video accordingly */}
      <VideoCallInterface1v1
        size={size}
        onSizeChange={handleSizeChange}
        onClose={onClose}
        className={className}
      />
    </>
  );
}
