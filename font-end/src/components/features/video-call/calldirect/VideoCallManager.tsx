"use client";

import React, { useEffect, useState } from "react";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";
import { VideoCallWrapper } from "./VideoCallWrapper";
import { useAuthStore } from "@/store/authStore";

interface VideoCallManagerProps {
  className?: string;
}

export function VideoCallManager({ className }: VideoCallManagerProps) {
  const { videoCallState } = useVideoCallContext();
  const { user } = useAuthStore();

  // Don't render if no active call states
  if (
    !videoCallState.isIncomingCall &&
    !videoCallState.isOutgoingCall &&
    videoCallState.callStatus !== "connected"
  ) {
    return null;
  }

  const handleClose = () => {
    // Reset any state if needed
  };

  return <VideoCallWrapper onClose={handleClose} className={className} />;
}
