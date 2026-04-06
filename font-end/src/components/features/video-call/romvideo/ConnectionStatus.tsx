"use client";

import React from "react";
import { useConnectionState, useParticipants } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { cn } from "@/lib/utils";
import styles from "./CallInterface.module.css";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const connectionState = useConnectionState();
  const participants = useParticipants();

  const getStatusInfo = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return {
          text: "Đã kết nối",
          className: styles.connected,
          showPulse: true,
        };
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return {
          text: "Đang kết nối...",
          className: styles.connecting,
          showPulse: true,
        };
      case ConnectionState.Disconnected:
        return {
          text: "Mất kết nối",
          className: styles.disconnected,
          showPulse: false,
        };
      default:
        return {
          text: "Không xác định",
          className: styles.disconnected,
          showPulse: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={cn(styles.connectionStatus, statusInfo.className, className)}>
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          statusInfo.showPulse && styles.connectionPulse
        )}
      />
      <span className="text-sm font-medium">
        {statusInfo.text}
      </span>
      {connectionState === ConnectionState.Connected && (
        <span className="text-xs opacity-75">
          • {participants.length} người tham gia
        </span>
      )}
    </div>
  );
}
