"use client";

import React from "react";
import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leaveVideoCall } from "@/lib/api/customer/video-call";

interface EndCallButtonProps {
  sessionId: string;
  conversationId: number;
  isHostOrAdmin: boolean;
  onCallEnded: (
    message?: string,
    reason?: "ended_by_host" | "ended_by_user" | "connection_lost" | "unknown"
  ) => void;
  className?: string;
}

export function EndCallButton({
  sessionId,
  conversationId,
  isHostOrAdmin,
  onCallEnded,
  className = "",
}: EndCallButtonProps) {
  const [isLeavingCall, setIsLeavingCall] = React.useState(false);

  const handleEndCall = async () => {
    setIsLeavingCall(true);
    try {
      // Call API to leave the video call
      await leaveVideoCall(sessionId);
      onCallEnded("Bạn đã rời khỏi cuộc gọi", "ended_by_user");
    } catch (error) {
      // Still end the call locally even if API fails
      onCallEnded("Bạn đã rời khỏi cuộc gọi", "ended_by_user");
    } finally {
      setIsLeavingCall(false);
    }
  };

  return (
    <Button
      onClick={handleEndCall}
      disabled={isLeavingCall}
      className={`rounded-full w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      size="sm"
    >
      <PhoneOff className="h-5 w-5" />
    </Button>
  );
}
