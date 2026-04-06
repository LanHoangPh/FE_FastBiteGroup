"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Room,
  RoomOptions,
  RoomConnectOptions,
  VideoPresets,
} from "livekit-client";
import {
  RoomContext,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import { LogLevel } from "livekit-client";
import { joinVideoCall, leaveVideoCall } from "@/lib/api/customer/video-call";
import { Button } from "@/components/ui/button";
import { X, PhoneOff } from "lucide-react";

interface LiveKitVideoConferenceProps {
  sessionId: string;
  conversationId: number;
  onClose: () => void;
  groupName?: string;
  userId?: string;
}

export function LiveKitVideoConference({
  sessionId,
  conversationId,
  onClose,
  groupName,
  userId,
}: LiveKitVideoConferenceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const roomOptions = useMemo((): RoomOptions => {
    return {
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: true,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    };
  }, []);

  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const connectToLiveKit = async () => {
      try {
        setError(null);
        setIsConnecting(true);

        // Get LiveKit token from backend
        const joinResponse = await joinVideoCall(
          sessionId,
          conversationId,
          userId
        );

        if (isMounted) {
          // Connect to LiveKit room with real token
          await room.connect(
            joinResponse.livekitServerUrl,
            joinResponse.livekitToken,
            connectOptions
          );

          // Enable camera and microphone by default
          await room.localParticipant.enableCameraAndMicrophone();

          setIsConnected(true);
          setIsConnecting(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to connect to LiveKit room"
          );
          setIsConnecting(false);
        }
      }
    };

    connectToLiveKit();

    return () => {
      isMounted = false;
      room.disconnect();
    };
  }, [room, sessionId, connectOptions]);

  const handleDisconnect = async () => {
    try {
      // Leave the call via backend API
      await leaveVideoCall(sessionId);
    } catch (error) {
      // Handle error silently
    } finally {
      // Always disconnect from room and call onClose
      room.disconnect();
      onClose();
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-white text-xl font-semibold mb-4">Lỗi kết nối</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={onClose} className="w-full">
            Đóng
          </Button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-white text-xl font-semibold mb-4">
            Đang kết nối đến {groupName || "cuộc gọi video"}...
          </h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-semibold text-lg">
            {groupName || "Cuộc gọi video"}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Rời khỏi
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* LiveKit VideoConference */}
      <div className="h-full">
        <RoomContext.Provider value={room}>
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
        </RoomContext.Provider>
      </div>
    </div>
  );
}
