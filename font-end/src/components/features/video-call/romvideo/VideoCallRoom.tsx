"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Room,
  RoomEvent,
  RoomOptions,
  VideoPresets,
  TrackPublishDefaults,
  RoomConnectOptions,
  Track,
  DisconnectReason,
} from "livekit-client";
import {
  RoomContext,
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { CallInterface } from "./CallInterface";
import { CallEndedScreen } from "./CallEndedScreen";
import {
  leaveVideoCall,
  endVideoCallForAll,
} from "@/lib/api/customer/video-call";
import apiClient from "@/lib/api/apiClient";
import { useVideoCallAdmin } from "@/hooks/useVideoCallAdmin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import "@livekit/components-styles";

interface VideoCallRoomProps {
  roomId: string;
  conversationId: number;
  groupName?: string;
  livekitToken?: string;
  livekitServerUrl?: string;
  settings?: string; // JSON string of settings from setup modal
  isInitiator?: boolean; // Whether current user initiated the call
  userId?: string; // Current user ID
  onClose?: () => void;
}

export function VideoCallRoom({
  roomId,
  conversationId,
  groupName = "Video Call",
  livekitToken,
  livekitServerUrl,
  settings,
  isInitiator = false,
  userId,
  onClose,
}: VideoCallRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isLeavingCall, setIsLeavingCall] = useState(false);
  const [callStatus, setCallStatus] = useState<{
    isActive: boolean;
    message?: string;
    isLoading: boolean;
  }>({
    isActive: true,
    isLoading: true,
  });

  const router = useRouter();

  // Use the new admin management system
  const {
    isAdmin,
    isLoading: adminLoading,
    sessionDetails,
    participants,
    refreshAdminStatus,
    refreshSessionDetails,
  } = useVideoCallAdmin({
    sessionId: roomId,
    conversationId: conversationId,
    enabled: true,
  });

  // Add global error handler for LiveKit SessionManager visibility change errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Suppress specific LiveKit SessionManager errors
      if (
        event.error?.message?.includes("No subscription") &&
        event.error?.stack?.includes("SessionManager") &&
        event.error?.stack?.includes("handleVisibilityChange")
      ) {
        // Prevent the error from being logged to console
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress specific LiveKit SessionManager promise rejections
      if (
        event.reason?.message?.includes("No subscription") &&
        event.reason?.stack?.includes("SessionManager")
      ) {
        event.preventDefault();
        return false;
      }
    };

    // Add error event listeners
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Only the initiator should have admin privileges
  const effectiveIsAdmin = isInitiator;

  // Parse settings from URL params with memoization
  const parsedSettings = useMemo(() => {
    if (!settings) {
      return {
        cameraEnabled: false,
        microphoneEnabled: false,
        selectedCamera: null,
        selectedMicrophone: null,
        selectedSpeaker: null,
        useComputerAudio: true,
        usePhoneAudio: false,
      };
    }

    try {
      return JSON.parse(settings);
    } catch {
      return {
        cameraEnabled: false,
        microphoneEnabled: false,
        selectedCamera: null,
        selectedMicrophone: null,
        selectedSpeaker: null,
        useComputerAudio: true,
        usePhoneAudio: false,
      };
    }
  }, [settings]);

  // Memoized call status check function
  const checkCallStatus = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        // Since checkVideoCallStatus is not available in our API,
        // we'll assume the call is active if we can connect to it
        // This is a simplified approach - in production you might want
        // to add a proper status check API endpoint
        setCallStatus({
          isActive: true,
          message: undefined,
          isLoading: false,
        });
      } catch (error) {
        // For any errors, assume call is active for new calls
        setCallStatus({
          isActive: true,
          message: undefined,
          isLoading: false,
        });
      }
    },
    []
  );

  // Check call status on component mount
  useEffect(() => {
    if (roomId) {
      checkCallStatus(roomId);
    }
  }, [roomId, checkCallStatus]);

  // Monitor if user is still in the call (for admin removal detection)
  // Tạm thời disable polling để tránh gây ra disconnect không mong muốn
  // useEffect(() => {
  //   if (!roomId || !userId || !isConnected) return;

  //   const checkUserStatus = async () => {
  //     try {
  //       // Polling để kiểm tra xem người dùng có còn trong cuộc gọi không
  //       // Nếu API trả về 404 hoặc user không còn trong danh sách participants
  //       // thì có nghĩa là họ đã bị xóa
  //       const response = await apiClient.get(`/video-calls/${roomId}/participants`);

  //       if (response.status === 200) {
  //         const participants = (response.data as any)?.data || [];
  //         const userStillInCall = participants.some((p: any) => p.userId === userId);

  //         if (!userStillInCall) {
  //           // Người dùng không còn trong danh sách participants
  //           setCallStatus({
  //             isActive: false,
  //             message: "Bạn đã bị xóa khỏi cuộc gọi bởi quản trị viên",
  //             isLoading: false,
  //           });
  //         }
  //       }
  //     } catch (error: any) {
  //       // Xử lý các lỗi cụ thể
  //       if (error.response?.status === 404) {
  //         // Cuộc gọi không tồn tại
  //         setCallStatus({
  //           isActive: false,
  //           message: "Cuộc gọi đã kết thúc",
  //           isLoading: false,
  //         });
  //       } else if (error.response?.status === 403) {
  //         // Không có quyền truy cập - có thể bị xóa
  //         setCallStatus({
  //           isActive: false,
  //           message: "Bạn đã bị xóa khỏi cuộc gọi bởi quản trị viên",
  //           isLoading: false,
  //         });
  //       }
  //       // Silent error handling cho các lỗi khác
  //     }
  //   };

  //   // Kiểm tra mỗi 5 giây
  //   const interval = setInterval(checkUserStatus, 5000);

  //   return () => clearInterval(interval);
  // }, [roomId, userId, isConnected]);

  // Handle redirect when user is removed from call
  useEffect(() => {
    if (!callStatus.isActive && callStatus.message?.includes("bị xóa")) {
      // Người dùng bị xóa khỏi cuộc gọi - redirect về trang chủ sau 3 giây
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [callStatus.isActive, callStatus.message, router]);

  // Monitor and enforce settings after connection
  useEffect(() => {
    if (!room || !isConnected) return;

    const enforceSettings = async () => {
      try {
        // Check current state
        const isCameraEnabled = room.localParticipant.isCameraEnabled;
        const isMicrophoneEnabled = room.localParticipant.isMicrophoneEnabled;

        // Enforce camera setting
        if (parsedSettings.cameraEnabled !== isCameraEnabled) {
          await room.localParticipant.setCameraEnabled(
            parsedSettings.cameraEnabled
          );
        }

        // Enforce microphone setting
        if (parsedSettings.microphoneEnabled !== isMicrophoneEnabled) {
          // Resume AudioContext if enabling microphone
          if (parsedSettings.microphoneEnabled) {
            try {
              // Try to access AudioContext through room's internal structure
              const audioContext =
                (room as any).engine?.client?.audioContext ||
                (room as any).engine?.audioContext ||
                (room as any).audioContext;

              if (audioContext && audioContext.state === "suspended") {
                await audioContext.resume();
              }
            } catch (error) {
              // Silent error handling
            }
          }

          await room.localParticipant.setMicrophoneEnabled(
            parsedSettings.microphoneEnabled
          );
        }
      } catch (error) {
        // Silent error handling
      }
    };

    // Enforce settings after a delay to allow LiveKit to stabilize
    const timeoutId = setTimeout(enforceSettings, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    room,
    isConnected,
    parsedSettings.cameraEnabled,
    parsedSettings.microphoneEnabled,
  ]);

  // Handle AudioContext on mount
  useEffect(() => {
    const handleUserInteraction = async () => {
      // Resume AudioContext on any user interaction
      if (window.AudioContext || (window as any).webkitAudioContext) {
        try {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }
        } catch (error) {
          // Silent error handling
        }
      }
    };

    // Add event listeners for user interaction
    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Monitor track publications and enforce settings
  useEffect(() => {
    if (!room || !isConnected) return;

    const handleTrackPublished = (publication: any) => {
      // If microphone is disabled but audio track is published, unpublish it
      if (publication.kind === "audio" && !parsedSettings.microphoneEnabled) {
        room.localParticipant.unpublishTrack(publication.track);
      }

      // If camera is disabled but video track is published, unpublish it
      if (publication.kind === "video" && !parsedSettings.cameraEnabled) {
        room.localParticipant.unpublishTrack(publication.track);
      }
    };

    room.on(RoomEvent.TrackPublished, handleTrackPublished);

    return () => {
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
    };
  }, [
    room,
    isConnected,
    parsedSettings.cameraEnabled,
    parsedSettings.microphoneEnabled,
  ]);

  const roomRef = useRef<Room | null>(null);

  // Memoized room options for better performance
  const roomOptions = useMemo(
    (): RoomOptions => ({
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: true,
        videoCodec: "vp9",
      } as TrackPublishDefaults,
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    }),
    []
  );

  // Memoized connect options
  const connectOptions = useMemo(
    (): RoomConnectOptions => ({
      autoSubscribe: true,
    }),
    []
  );

  // Memoized cleanup function for LiveKit room
  const cleanupLiveKitRoom = useCallback(async (roomToClean: Room) => {
    try {
      // Stop all tracks first
      const videoTracks = Array.from(
        roomToClean.localParticipant.videoTrackPublications.values()
      );
      const audioTracks = Array.from(
        roomToClean.localParticipant.audioTrackPublications.values()
      );

      for (const track of [...videoTracks, ...audioTracks]) {
        if (track.track) {
          track.track.stop();
          await roomToClean.localParticipant.unpublishTrack(track.track);
        }
      }

      // Wait for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 500));
      await roomToClean.disconnect();
    } catch {
      // Silent error handling for cleanup
    }
  }, []);

  // Memoized connection and setup function
  const connectAndSetupRoom = useCallback(
    async (roomToConnect: Room) => {
      if (
        !livekitToken ||
        !livekitServerUrl ||
        !callStatus.isActive ||
        callStatus.isLoading
      ) {
        return;
      }

      try {
        await roomToConnect.connect(
          livekitServerUrl,
          livekitToken,
          connectOptions
        );

        // Apply camera and microphone settings after connection
        // Wait for LiveKit to fully initialize
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Force disable both camera and mic first
        await roomToConnect.localParticipant.setCameraEnabled(false);
        await roomToConnect.localParticipant.setMicrophoneEnabled(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Unpublish any existing tracks
        const videoTracks = Array.from(
          roomToConnect.localParticipant.videoTrackPublications.values()
        );
        const audioTracks = Array.from(
          roomToConnect.localParticipant.audioTrackPublications.values()
        );

        for (const track of [...videoTracks, ...audioTracks]) {
          if (track.track) {
            await roomToConnect.localParticipant.unpublishTrack(track.track);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Apply user settings
        if (parsedSettings.cameraEnabled) {
          await roomToConnect.localParticipant.setCameraEnabled(true);
        }

        if (parsedSettings.microphoneEnabled) {
          // Resume AudioContext if needed
          try {
            const audioContext =
              (roomToConnect as any).engine?.client?.audioContext ||
              (roomToConnect as any).engine?.audioContext ||
              (roomToConnect as any).audioContext;

            if (audioContext?.state === "suspended") {
              await audioContext.resume();
            }
          } catch {
            // Silent error handling
          }

          await roomToConnect.localParticipant.setMicrophoneEnabled(true);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        // Silent error handling for production
      }
    },
    [
      livekitToken,
      livekitServerUrl,
      callStatus.isActive,
      callStatus.isLoading,
      connectOptions,
      parsedSettings.cameraEnabled,
      parsedSettings.microphoneEnabled,
    ]
  );

  // Initialize room
  useEffect(() => {
    const newRoom = new Room(roomOptions);
    roomRef.current = newRoom;
    setRoom(newRoom);

    // Event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setCallStatus((prev) => ({
        ...prev,
        isActive: true,
        message: undefined,
      }));
    };

    const handleDisconnected = (reason?: DisconnectReason) => {
      console.log(`[VideoCallRoom] Disconnected with reason:`, reason);
      console.log(`[VideoCallRoom] Current user:`, userId);
      console.log(`[VideoCallRoom] Room ID:`, roomId);

      setIsConnected(false);

      if (
        reason === DisconnectReason.SERVER_SHUTDOWN ||
        reason === DisconnectReason.ROOM_DELETED
      ) {
        console.log(`[VideoCallRoom] Server shutdown or room deleted`);
        setCallStatus({
          isActive: false,
          message: "Cuộc gọi đã được kết thúc bởi server",
          isLoading: false,
        });
      } else if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
        console.log(`[VideoCallRoom] Participant removed by admin`);
        // Người dùng bị xóa khỏi cuộc gọi bởi admin
        setCallStatus({
          isActive: false,
          message: "Bạn đã bị xóa khỏi cuộc gọi bởi quản trị viên",
          isLoading: false,
        });
      } else if (reason === DisconnectReason.CLIENT_INITIATED) {
        console.log(`[VideoCallRoom] Client initiated disconnect`);
        // Người dùng tự rời khỏi cuộc gọi
        setCallStatus({
          isActive: false,
          message: "Bạn đã rời khỏi cuộc gọi",
          isLoading: false,
        });
      } else if (reason === DisconnectReason.DUPLICATE_IDENTITY) {
        console.log(`[VideoCallRoom] Duplicate identity`);
        // Trùng lặp identity - có thể do refresh hoặc mở nhiều tab
        setCallStatus({
          isActive: false,
          message: "Phiên đăng nhập trùng lặp - vui lòng đóng tab khác",
          isLoading: false,
        });
      } else {
        console.log(`[VideoCallRoom] Other disconnect reason:`, reason);
        // Các trường hợp khác (bao gồm lỗi mạng)
        setCallStatus({
          isActive: false,
          message: "Cuộc gọi đã kết thúc",
          isLoading: false,
        });
      }

      // Chỉ gọi onClose nếu cuộc gọi thực sự kết thúc
      if (!callStatus.isActive) {
        onClose?.();
      }
    };

    const handleReconnecting = () => {
      // Don't show call ended during reconnection attempts
    };

    const handleReconnected = () => {
      setCallStatus((prev) => ({
        ...prev,
        isActive: true,
        message: undefined,
      }));
    };

    // Handle visibility change errors gracefully
    const handleVisibilityChange = () => {
      try {
        if (newRoom.state === "connected" && newRoom.localParticipant) {
          if (document.hidden) {
            newRoom.localParticipant.videoTrackPublications.forEach((pub) => {
              if (pub.track && !pub.track.isMuted) {
                pub.track.mute();
              }
            });
          } else if (parsedSettings.cameraEnabled) {
            newRoom.localParticipant.videoTrackPublications.forEach((pub) => {
              if (pub.track && pub.track.isMuted) {
                pub.track.unmute();
              }
            });
          }
        }
      } catch {
        // Silently handle visibility change errors
      }
    };

    newRoom.on(RoomEvent.Connected, handleConnected);
    newRoom.on(RoomEvent.Disconnected, handleDisconnected);
    newRoom.on(RoomEvent.Reconnecting, handleReconnecting);
    newRoom.on(RoomEvent.Reconnected, handleReconnected);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Connect to LiveKit room
    connectAndSetupRoom(newRoom);

    return () => {
      newRoom.off(RoomEvent.Connected, handleConnected);
      newRoom.off(RoomEvent.Disconnected, handleDisconnected);
      newRoom.off(RoomEvent.Reconnecting, handleReconnecting);
      newRoom.off(RoomEvent.Reconnected, handleReconnected);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup
      cleanupLiveKitRoom(newRoom);
    };
  }, [
    roomOptions,
    connectAndSetupRoom,
    onClose,
    parsedSettings.cameraEnabled,
    cleanupLiveKitRoom,
  ]);

  // Handle leave call with useCallback
  const handleLeaveCall = useCallback(async () => {
    if (isLeavingCall) return;

    setIsLeavingCall(true);
    try {
      await leaveVideoCall(roomId);

      setCallStatus({
        isActive: false,
        message: "Bạn đã rời khỏi cuộc gọi",
        isLoading: false,
      });

      if (room) {
        await cleanupLiveKitRoom(room);
      }

      onClose?.();
    } catch {
      // Still close the room even if API call fails
      if (room) {
        await cleanupLiveKitRoom(room);
      }
      onClose?.();
    } finally {
      setIsLeavingCall(false);
    }
  }, [isLeavingCall, roomId, room, onClose, cleanupLiveKitRoom]);

  // Handle ending call for all participants with useCallback
  const handleEndCallForAll = useCallback(
    async (
      message?: string,
      reason?: "ended_by_host" | "ended_by_user" | "connection_lost" | "unknown"
    ) => {
      setCallStatus({
        isActive: false,
        message:
          message || "Cuộc gọi đã được kết thúc cho tất cả người tham gia",
        isLoading: false,
      });

      if (room) {
        await cleanupLiveKitRoom(room);
      }
    },
    [room, cleanupLiveKitRoom]
  );

  // Show loading state while checking call status
  if (callStatus.isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-white text-2xl font-semibold mb-2">
            Đang kiểm tra trạng thái cuộc gọi...
          </h2>
          <p className="text-gray-400 text-lg">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Show call ended message if call is explicitly marked as inactive
  // Only show "call ended" if we have a definitive status from the server
  if (!callStatus.isActive) {
    // Determine reason based on message
    let reason:
      | "ended_by_host"
      | "ended_by_user"
      | "connection_lost"
      | "removed_by_admin"
      | "unknown" = "unknown";

    if (callStatus.message?.includes("rời khỏi")) {
      reason = "ended_by_user";
    } else if (callStatus.message?.includes("bị xóa")) {
      reason = "removed_by_admin";
    } else if (callStatus.message?.includes("kết thúc bởi server")) {
      reason = "ended_by_host";
    } else if (callStatus.message?.includes("kết nối")) {
      reason = "connection_lost";
    }

    return <CallEndedScreen message={callStatus.message} reason={reason} />;
  }

  if (!room) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang khởi tạo phòng...</p>
        </div>
      </div>
    );
  }

  // Move the RoomContext.Provider up to wrap the useTracks hook
  return (
    <RoomContext.Provider value={room}>
      <CallInterface
        groupName={groupName}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        showChat={showChat}
        setShowChat={setShowChat}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        roomId={roomId}
        conversationId={conversationId}
        effectiveIsAdmin={effectiveIsAdmin}
        isInitiator={isInitiator}
        userId={userId}
        sessionDetails={sessionDetails}
        handleEndCallForAll={handleEndCallForAll}
        isLeavingCall={isLeavingCall}
        parsedSettings={parsedSettings}
      />
    </RoomContext.Provider>
  );
}
