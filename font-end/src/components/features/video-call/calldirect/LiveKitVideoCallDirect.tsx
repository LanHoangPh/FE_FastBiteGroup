"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Room,
  RoomOptions,
  RoomConnectOptions,
  VideoPresets,
  Track,
} from "livekit-client";
import {
  RoomContext,
  VideoTrack,
  AudioTrack,
  useTracks,
} from "@livekit/components-react";
import { joinVideoCall } from "@/lib/api/customer/video-call";
import { cn } from "@/lib/utils";
import { useLiveKitControls } from "@/hooks/useLiveKitControls";
import { stopAllMediaTracks } from "@/lib/utils/mediaCleanup";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

// Component for 1-1 video layout (fullscreen)
export function VideoCallDirectLayout({
  room,
  partnerName,
  partnerAvatar,
  localUserName,
  localUserAvatar,
}: {
  room: Room;
  partnerName?: string;
  partnerAvatar?: string;
  localUserName?: string;
  localUserAvatar?: string;
}) {
  // Use useTracks to fetch Camera and Microphone tracks
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone],
    { room: room } // always specify the room explicitly
  );

  // Safely locate required tracks
  const localVideoTrack = tracks.find(
    (t) => t.participant.isLocal && t.source === Track.Source.Camera
  );
  const remoteVideoTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.Camera
  );
  const remoteAudioTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.Microphone
  );

  // Check if cameras are actually enabled
  const isLocalCameraEnabled = localVideoTrack?.publication?.isSubscribed && !localVideoTrack?.publication?.isMuted;
  const isRemoteCameraEnabled = remoteVideoTrack?.publication?.isSubscribed && !remoteVideoTrack?.publication?.isMuted;

  // Get remote participant for fallback display
  const remoteParticipants = Array.from(room.remoteParticipants.values());
  const remoteParticipant = remoteParticipants[0];

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      {/* Main video area - split screen for 1-1 */}
      <div className="flex-1 flex gap-2 p-2">
        {/* Remote participant (main view) */}
        <div className="flex-1 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {isRemoteCameraEnabled ? (
            // ✅ DECLARATIVE: Just drop this component
            <VideoTrack trackRef={remoteVideoTrack} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                  <AvatarImage src={partnerAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                    {partnerName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-lg font-medium mb-1">
                  {partnerName || "Người dùng"}
                </p>
              </div>
            </div>
          )}
          {/* Remote audio plays automatically — no <audio> tag needed */}
          {remoteAudioTrack && <AudioTrack trackRef={remoteAudioTrack} />}
        </div>

        {/* Local participant (picture-in-picture) */}
        <div className="w-80 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {isLocalCameraEnabled ? (
            // ✅ DECLARATIVE: Same for local video
            <VideoTrack trackRef={localVideoTrack} className="h-full w-full object-cover" muted={true} />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                  <AvatarImage src={localUserAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                    {localUserName?.charAt(0) || <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-lg font-medium mb-1">
                  {localUserName || "Bạn"}
                </p>
              </div>
            </div>
          )}

          {/* Local participant indicator */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            Bạn
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for minimized video layout (shows remote participant prominently)
export function VideoCallMinimizedLayout({
  room,
  partnerName,
  partnerAvatar,
  localUserName,
  localUserAvatar,
}: {
  room: Room;
  partnerName?: string;
  partnerAvatar?: string;
  localUserName?: string;
  localUserAvatar?: string;
}) {
  // Use useTracks to fetch Camera and Microphone tracks
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone],
    { room: room }
  );

  // Safely locate required tracks
  const localVideoTrack = tracks.find(
    (t) => t.participant.isLocal && t.source === Track.Source.Camera
  );
  const remoteVideoTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.Camera
  );
  const remoteAudioTrack = tracks.find(
    (t) => !t.participant.isLocal && t.source === Track.Source.Microphone
  );

  // Check if cameras are actually enabled
  const isLocalCameraEnabled = localVideoTrack?.publication?.isSubscribed && !localVideoTrack?.publication?.isMuted;
  const isRemoteCameraEnabled = remoteVideoTrack?.publication?.isSubscribed && !remoteVideoTrack?.publication?.isMuted;

  return (
    <div className="h-full w-full relative bg-gray-900">
      {/* Primary view: Remote participant (who you're talking to) */}
      {isRemoteCameraEnabled ? (
        <VideoTrack trackRef={remoteVideoTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-2 ring-2 ring-white/20">
              <AvatarImage src={partnerAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-lg font-bold">
                {partnerName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <p className="text-white text-sm font-medium">
              {partnerName || "Người dùng"}
            </p>
          </div>
        </div>
      )}

      {/* Small local video in corner (optional - only if enabled) */}
      {isLocalCameraEnabled && (
        <div className="absolute top-2 right-2 w-20 h-16 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-white/20">
          <VideoTrack trackRef={localVideoTrack} className="h-full w-full object-cover" muted={true} />
        </div>
      )}

      {/* Remote audio plays automatically */}
      {remoteAudioTrack && <AudioTrack trackRef={remoteAudioTrack} />}
    </div>
  );
}

interface LiveKitVideoCallDirectProps {
  sessionId: string;
  conversationId: number;
  onClose: (isUserInitiated?: boolean) => void;
  partnerName?: string;
  partnerAvatar?: string;
  userId?: string;
  localUserName?: string;
  localUserAvatar?: string;
  className?: string;
  livekitToken?: string;
  livekitServerUrl?: string;
}

export function LiveKitVideoCallDirect({
  sessionId,
  conversationId,
  onClose,
  partnerName,
  partnerAvatar,
  userId,
  localUserName,
  localUserAvatar,
  className,
  livekitToken,
  livekitServerUrl,
}: LiveKitVideoCallDirectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);

  // Get the context updater
  const { setRoom } = useVideoCallContext();

  // Reset state when component mounts
  useEffect(() => {
    setIsConnected(false);
    setError(null);
    setIsConnecting(false);
    connectionAttemptedRef.current = false;
    retryCountRef.current = 0;
  }, []);

  // Timeout to reset isConnecting if stuck
  useEffect(() => {
    if (isConnecting) {
      const timeout = setTimeout(() => {
        setIsConnecting(false);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isConnecting]);

  const room = useMemo(() => {
    const roomOptions: RoomOptions = {
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h540],
        red: true,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    };
    return new Room(roomOptions);
  }, []); // Empty dependency array - room should be created only once

  // Note: Controls are now managed in VideoCallContext, not here

  // Update Context once connected
  useEffect(() => {
    if (isConnected) {
      setRoom(room);
    } else {
      setRoom(null);
    }
  }, [isConnected, room, setRoom]);

  const connectOptions: RoomConnectOptions = {
    autoSubscribe: true,
  };

  useEffect(() => {
    let isMounted = true;
    let connectionAborted = false;

    const connectToLiveKit = async () => {
      try {
        setError(null);
        setIsConnecting(true);

        // Use provided token or get new one from backend
        let token = livekitToken;
        let serverUrl = livekitServerUrl;

        if (!token || !serverUrl) {
          const joinResponse = await joinVideoCall(
            sessionId,
            conversationId,
            userId
          );
          token = joinResponse.livekitToken;
          serverUrl = joinResponse.livekitServerUrl;
        }

        if (isMounted && !connectionAborted && token && serverUrl) {
          // Connect to LiveKit room with token
          await room.connect(serverUrl, token, connectOptions);

          // Check if connection was aborted during connect
          if (connectionAborted || !isMounted) {
            if (isMounted) {
              setIsConnecting(false);
            }
            return;
          }

          // Keep camera and microphone off by default
          try {
            await room.localParticipant.setMicrophoneEnabled(false);
            await room.localParticipant.setCameraEnabled(false);
          } catch (deviceError) {
            // Continue without camera/microphone if device is in use
          }

          if (isMounted && !connectionAborted) {
            setIsConnected(true);
            setIsConnecting(false);
          }
        }
      } catch (err) {
        if (isMounted && !connectionAborted) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to connect to LiveKit room";

          // Check if it's a device error and we can retry
          if (
            errorMessage.includes("Device in use") &&
            retryCountRef.current < 3
          ) {
            retryCountRef.current++;
            setTimeout(() => {
              if (isMounted && !connectionAborted) {
                connectionAttemptedRef.current = false;
                connectToLiveKit();
              }
            }, 2000); // Retry after 2 seconds
            return;
          }

          setError(errorMessage);
          setIsConnecting(false);
        }
      }
    };

    // Only attempt connection if we have the required data and haven't connected yet
    if (
      sessionId &&
      !isConnected &&
      !isConnecting &&
      !connectionAttemptedRef.current
    ) {
      connectionAttemptedRef.current = true;
      connectToLiveKit();
    }

    return () => {
      isMounted = false;
      connectionAborted = true;
      // Reset connection attempted flag for next mount
      connectionAttemptedRef.current = false;
    };
  }, [sessionId, livekitToken, livekitServerUrl]); // Removed room and connectOptions from dependencies

  // Cleanup on unmount - only disconnect if we're actually unmounting, not in Strict Mode
  useEffect(() => {
    return () => {
      // Cleanup camera and microphone before disconnecting
      if (room && room.localParticipant) {
        try {
          room.localParticipant.setCameraEnabled(false);
          room.localParticipant.setMicrophoneEnabled(false);
          room.localParticipant.setScreenShareEnabled(false);
        } catch (cleanupError) {
          // Silent cleanup error handling
        }
      }

      // Also cleanup media tracks at the browser level
      stopAllMediaTracks().catch(() => {
        // Silent error handling
      });

      // Don't disconnect in development Strict Mode - let the room handle its own lifecycle
      if (process.env.NODE_ENV === "production" && room) {
        room.disconnect();
      }
    };
  }, [room]);

  // Handle room disconnect
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = async (reason?: any) => {
      setIsConnected(false);

      // Cleanup camera and microphone when disconnecting
      try {
        if (room && room.localParticipant) {
          await room.localParticipant.setCameraEnabled(false);
          await room.localParticipant.setMicrophoneEnabled(false);
          await room.localParticipant.setScreenShareEnabled(false);
        }

        // Also cleanup media tracks at the browser level
        await stopAllMediaTracks();
      } catch (cleanupError) {
        // Silent cleanup error handling
      }

      // Only call onClose if it's a user-initiated disconnect
      // Don't auto-close on connection errors
      if (reason === "CLIENT_INITIATED" || reason === "SERVER_SHUTDOWN") {
        onClose(true); // User initiated
      } else {
        // For connection errors, just show error state
        setError("Kết nối bị ngắt. Vui lòng thử lại.");
        onClose(false); // Not user initiated
      }
    };

    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("disconnected", handleDisconnected);
    };
  }, [room, onClose]);

  // ✅ Nothing is rendered anymore - this component only manages connection
  return null;
}
