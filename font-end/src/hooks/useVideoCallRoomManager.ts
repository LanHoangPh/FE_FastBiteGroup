/**
 * COMPREHENSIVE VIDEO CALL ROOM MANAGER HOOK
 *
 * This hook provides complete room management functionality using the
 * comprehensive API specification. It replaces the limited useVideoCallAdmin hook.
 *
 * @author FastBite Group Frontend Team
 * @version 2.0.0
 * @created 2025-01-23
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  VideoCallRoom,
  ParticipantInfo,
  ParticipantRole,
  ParticipantPermissions,
  RoomSettings,
  BulkParticipantActionRequest,
  WaitingRoomParticipant,
  RoomAnalytics,
  getRoomDetails,
  getRoomParticipants,
  updateParticipant,
  bulkParticipantAction,
  muteParticipant,
  unmuteParticipant,
  disableParticipantVideo,
  enableParticipantVideo,
  stopParticipantScreenShare,
  promoteParticipant,
  demoteParticipant,
  updateParticipantPermissions,
  updateRoomSettings,
  lockRoom,
  unlockRoom,
  startRecording,
  stopRecording,
  endVideoCallRoom,
  getWaitingRoomParticipants,
  approveWaitingRoomParticipant,
  denyWaitingRoomParticipant,
  getRoomAnalytics,
  subscribeToRoomEvents,
  VideoCallRoomError,
} from "@/lib/api/customer/video-call-room-management";
import { removeParticipant } from "@/lib/api/customer/calls";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/utils/errorUtils";

// ===== HOOK INTERFACES =====

export interface UseVideoCallRoomManagerProps {
  sessionId: string | null;
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseVideoCallRoomManagerReturn {
  // Room Data
  room: VideoCallRoom | null;
  participants: ParticipantInfo[];
  waitingRoomParticipants: WaitingRoomParticipant[];
  currentUser: ParticipantInfo | null;
  analytics: RoomAnalytics | null;

  // Loading States
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // User Status
  isAdmin: boolean;
  isModerator: boolean;
  canManageParticipants: boolean;
  canManageRoom: boolean;
  userPermissions: ParticipantPermissions | null;

  // Data Management
  refreshRoom: () => Promise<void>;
  refreshParticipants: () => Promise<void>;
  refreshWaitingRoom: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  // Participant Management
  muteParticipant: (userId: string, reason?: string) => Promise<void>;
  unmuteParticipant: (userId: string) => Promise<void>;
  disableVideo: (userId: string, reason?: string) => Promise<void>;
  enableVideo: (userId: string) => Promise<void>;
  stopScreenShare: (userId: string) => Promise<void>;
  removeParticipant: (userId: string, reason?: string) => Promise<void>;

  // Bulk Actions
  bulkMute: (userIds: string[], reason?: string) => Promise<void>;
  bulkUnmute: (userIds: string[]) => Promise<void>;
  bulkDisableVideo: (userIds: string[], reason?: string) => Promise<void>;
  bulkEnableVideo: (userIds: string[]) => Promise<void>;
  bulkRemove: (userIds: string[], reason?: string) => Promise<void>;

  // Role Management
  promoteToAdmin: (userId: string) => Promise<void>;
  promoteToModerator: (userId: string) => Promise<void>;
  demoteToParticipant: (userId: string) => Promise<void>;
  updatePermissions: (
    userId: string,
    permissions: Partial<ParticipantPermissions>
  ) => Promise<void>;

  // Room Management
  updateRoomSettings: (settings: Partial<RoomSettings>) => Promise<void>;
  lockRoom: () => Promise<void>;
  unlockRoom: () => Promise<void>;
  endRoom: (reason?: string) => Promise<void>;

  // Recording
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  isRecording: boolean;

  // Waiting Room
  approveWaitingParticipant: (userId: string) => Promise<void>;
  denyWaitingParticipant: (userId: string, reason?: string) => Promise<void>;
  approveAllWaiting: () => Promise<void>;
  denyAllWaiting: (reason?: string) => Promise<void>;

  // Statistics
  participantCount: number;
  adminCount: number;
  moderatorCount: number;
  speakingParticipants: ParticipantInfo[];
  mutedParticipants: ParticipantInfo[];
  videoDisabledParticipants: ParticipantInfo[];
}

// ===== MAIN HOOK IMPLEMENTATION =====

export function useVideoCallRoomManager({
  sessionId,
  enabled = true,
  autoRefresh = true,
  refreshInterval = 5000,
}: UseVideoCallRoomManagerProps): UseVideoCallRoomManagerReturn {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const eventSubscriptionRef = useRef<(() => void) | null>(null);

  // ===== QUERIES =====

  const {
    data: room,
    isLoading: isLoadingRoom,
    refetch: refetchRoom,
    error: roomError,
  } = useQuery<VideoCallRoom>({
    queryKey: ["videoCallRoom", sessionId],
    queryFn: () => getRoomDetails(sessionId!),
    enabled: enabled && !!sessionId,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    refetch: refetchParticipants,
    error: participantsError,
  } = useQuery<ParticipantInfo[]>({
    queryKey: ["videoCallParticipants", sessionId],
    queryFn: () => getRoomParticipants(sessionId!, false),
    enabled: enabled && !!sessionId,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: waitingRoomParticipants = [], refetch: refetchWaitingRoom } =
    useQuery({
      queryKey: ["videoCallWaitingRoom", sessionId],
      queryFn: () => getWaitingRoomParticipants(sessionId!),
      enabled: enabled && !!sessionId && room?.settings?.enableWaitingRoom,
      refetchInterval: autoRefresh ? refreshInterval / 2 : false, // More frequent for waiting room
    });

  const { data: analytics, refetch: refetchAnalytics } =
    useQuery<RoomAnalytics>({
      queryKey: ["videoCallAnalytics", sessionId],
      queryFn: () => getRoomAnalytics(sessionId!),
      enabled: enabled && !!sessionId,
      refetchInterval: autoRefresh ? refreshInterval * 2 : false, // Less frequent for analytics
    });

  // ===== COMPUTED VALUES =====

  const currentUser = participants.find((p) => p.userId === user?.id) || null;
  const isAdmin =
    currentUser?.role === "owner" || currentUser?.role === "admin";
  const isModerator = isAdmin || currentUser?.role === "moderator";
  const canManageParticipants =
    currentUser?.permissions.canRemoveParticipants || false;
  const canManageRoom = currentUser?.permissions.canChangeRoomSettings || false;
  const userPermissions = currentUser?.permissions || null;
  const isRecording = room?.isRecording || false;

  // Statistics
  const participantCount = participants.length;
  const adminCount = participants.filter(
    (p) => p.role === "owner" || p.role === "admin"
  ).length;
  const moderatorCount = participants.filter(
    (p) => p.role === "moderator"
  ).length;
  const speakingParticipants = participants.filter(
    (p) => p.status === "speaking"
  );
  const mutedParticipants = participants.filter(
    (p) => !p.connectionInfo.isAudioEnabled
  );
  const videoDisabledParticipants = participants.filter(
    (p) => !p.connectionInfo.isVideoEnabled
  );

  const isLoading = isLoadingRoom || isLoadingParticipants;
  const isRefreshing = false; // Could be enhanced with specific refresh states

  // Handle errors from queries
  useEffect(() => {
    if (roomError) {
      setError(roomError.message || "Có lỗi xảy ra khi tải thông tin phòng");
    } else if (participantsError) {
      setError(
        participantsError.message ||
          "Có lỗi xảy ra khi tải danh sách người tham gia"
      );
    } else {
      setError(null);
    }
  }, [roomError, participantsError]);

  // ===== MUTATIONS =====

  const createMutation = (
    mutationFn: (...args: any[]) => Promise<any>,
    successMessage?: string,
    invalidateQueries: string[] = ["videoCallRoom", "videoCallParticipants"]
  ) => {
    return useMutation({
      mutationFn,
      onSuccess: () => {
        if (successMessage) {
          toast.success(successMessage);
        }
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey, sessionId] });
        });
      },
      onError: (error) => {
        const errorMessage =
          error instanceof VideoCallRoomError
            ? error.message
            : "Có lỗi xảy ra khi thực hiện thao tác";
        toast.error(errorMessage);
        setError(errorMessage);
      },
    });
  };

  // Participant Control Mutations
  const muteMutation = createMutation(
    ({ userId, reason }: { userId: string; reason?: string }) =>
      muteParticipant(sessionId!, userId, reason),
    "Đã tắt tiếng người tham gia"
  );

  const unmuteMutation = createMutation(
    (userId: string) => unmuteParticipant(sessionId!, userId),
    "Đã bật tiếng người tham gia"
  );

  const disableVideoMutation = createMutation(
    ({ userId, reason }: { userId: string; reason?: string }) =>
      disableParticipantVideo(sessionId!, userId, reason),
    "Đã tắt camera người tham gia"
  );

  const enableVideoMutation = createMutation(
    (userId: string) => enableParticipantVideo(sessionId!, userId),
    "Đã bật camera người tham gia"
  );

  const stopScreenShareMutation = createMutation(
    (userId: string) => stopParticipantScreenShare(sessionId!, userId),
    "Đã dừng chia sẻ màn hình"
  );

  const removeParticipantMutation = createMutation(
    ({ userId, reason }: { userId: string; reason?: string }) =>
      removeParticipant(sessionId!, userId),
    "Đã xóa người tham gia khỏi cuộc gọi"
  );

  // Bulk Action Mutations
  const bulkActionMutation = createMutation(
    (request: BulkParticipantActionRequest) =>
      bulkParticipantAction(sessionId!, request)
  );

  // Role Management Mutations
  const promoteParticipantMutation = createMutation(
    ({ userId, targetRole }: { userId: string; targetRole: ParticipantRole }) =>
      promoteParticipant(sessionId!, userId, targetRole),
    "Đã thăng cấp người tham gia"
  );

  const demoteParticipantMutation = createMutation(
    ({ userId, targetRole }: { userId: string; targetRole: ParticipantRole }) =>
      demoteParticipant(sessionId!, userId, targetRole),
    "Đã hạ cấp người tham gia"
  );

  const updatePermissionsMutation = createMutation(
    ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: Partial<ParticipantPermissions>;
    }) => updateParticipantPermissions(sessionId!, userId, permissions),
    "Đã cập nhật quyền người tham gia"
  );

  // Room Management Mutations
  const updateSettingsMutation = createMutation(
    (settings: Partial<RoomSettings>) =>
      updateRoomSettings(sessionId!, settings),
    "Đã cập nhật cài đặt phòng"
  );

  const lockRoomMutation = createMutation(
    () => lockRoom(sessionId!),
    "Đã khóa phòng"
  );

  const unlockRoomMutation = createMutation(
    () => unlockRoom(sessionId!),
    "Đã mở khóa phòng"
  );

  const endRoomMutation = createMutation(
    (reason?: string) => endVideoCallRoom(sessionId!, reason),
    "Đã kết thúc cuộc gọi cho tất cả"
  );

  // Recording Mutations
  const startRecordingMutation = createMutation(
    () => startRecording(sessionId!),
    "Đã bắt đầu ghi âm"
  );

  const stopRecordingMutation = createMutation(
    () => stopRecording(sessionId!),
    "Đã dừng ghi âm"
  );

  // Waiting Room Mutations
  const approveWaitingMutation = createMutation(
    (userId: string) => approveWaitingRoomParticipant(sessionId!, userId),
    "Đã chấp nhận người tham gia",
    ["videoCallWaitingRoom", "videoCallParticipants"]
  );

  const denyWaitingMutation = createMutation(
    ({ userId, reason }: { userId: string; reason?: string }) =>
      denyWaitingRoomParticipant(sessionId!, userId, reason),
    "Đã từ chối người tham gia",
    ["videoCallWaitingRoom"]
  );

  // ===== CALLBACK FUNCTIONS =====

  const refreshRoom = useCallback(async () => {
    await refetchRoom();
  }, [refetchRoom]);

  const refreshParticipants = useCallback(async () => {
    await refetchParticipants();
  }, [refetchParticipants]);

  const refreshWaitingRoomCallback = useCallback(async () => {
    await refetchWaitingRoom();
  }, [refetchWaitingRoom]);

  const refreshAnalyticsCallback = useCallback(async () => {
    await refetchAnalytics();
  }, [refetchAnalytics]);

  // Participant Management
  const muteParticipantCallback = useCallback(
    async (userId: string, reason?: string) => {
      await muteMutation.mutateAsync({ userId, reason });
    },
    [muteMutation]
  );

  const unmuteParticipantCallback = useCallback(
    async (userId: string) => {
      await unmuteMutation.mutateAsync(userId);
    },
    [unmuteMutation]
  );

  const disableVideo = useCallback(
    async (userId: string, reason?: string) => {
      await disableVideoMutation.mutateAsync({ userId, reason });
    },
    [disableVideoMutation]
  );

  const enableVideo = useCallback(
    async (userId: string) => {
      await enableVideoMutation.mutateAsync(userId);
    },
    [enableVideoMutation]
  );

  const stopScreenShare = useCallback(
    async (userId: string) => {
      await stopScreenShareMutation.mutateAsync(userId);
    },
    [stopScreenShareMutation]
  );

  const removeParticipantCallback = useCallback(
    async (userId: string, reason?: string) => {
      await removeParticipantMutation.mutateAsync({ userId, reason });

      // Invalidate queries để refresh danh sách người tham gia
      queryClient.invalidateQueries({
        queryKey: ["videoCallParticipants", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["videoCallRoom", sessionId] });
    },
    [removeParticipantMutation, queryClient, sessionId]
  );

  // Bulk Actions
  const bulkMute = useCallback(
    async (userIds: string[], reason?: string) => {
      await bulkActionMutation.mutateAsync({
        participantIds: userIds,
        action: "mute",
        reason,
      });
    },
    [bulkActionMutation]
  );

  const bulkUnmute = useCallback(
    async (userIds: string[]) => {
      await bulkActionMutation.mutateAsync({
        participantIds: userIds,
        action: "unmute",
      });
    },
    [bulkActionMutation]
  );

  const bulkDisableVideo = useCallback(
    async (userIds: string[], reason?: string) => {
      await bulkActionMutation.mutateAsync({
        participantIds: userIds,
        action: "disable_video",
        reason,
      });
    },
    [bulkActionMutation]
  );

  const bulkEnableVideo = useCallback(
    async (userIds: string[]) => {
      await bulkActionMutation.mutateAsync({
        participantIds: userIds,
        action: "enable_video",
      });
    },
    [bulkActionMutation]
  );

  const bulkRemove = useCallback(
    async (userIds: string[], reason?: string) => {
      await bulkActionMutation.mutateAsync({
        participantIds: userIds,
        action: "remove",
        reason,
      });
    },
    [bulkActionMutation]
  );

  // Role Management
  const promoteToAdmin = useCallback(
    async (userId: string) => {
      await promoteParticipantMutation.mutateAsync({
        userId,
        targetRole: "admin",
      });
    },
    [promoteParticipantMutation]
  );

  const promoteToModerator = useCallback(
    async (userId: string) => {
      await promoteParticipantMutation.mutateAsync({
        userId,
        targetRole: "moderator",
      });
    },
    [promoteParticipantMutation]
  );

  const demoteToParticipant = useCallback(
    async (userId: string) => {
      await demoteParticipantMutation.mutateAsync({
        userId,
        targetRole: "participant",
      });
    },
    [demoteParticipantMutation]
  );

  const updatePermissions = useCallback(
    async (userId: string, permissions: Partial<ParticipantPermissions>) => {
      await updatePermissionsMutation.mutateAsync({ userId, permissions });
    },
    [updatePermissionsMutation]
  );

  // Room Management
  const updateRoomSettingsCallback = useCallback(
    async (settings: Partial<RoomSettings>) => {
      await updateSettingsMutation.mutateAsync(settings);
    },
    [updateSettingsMutation]
  );

  const lockRoomCallback = useCallback(async () => {
    await lockRoomMutation.mutateAsync(undefined);
  }, [lockRoomMutation]);

  const unlockRoomCallback = useCallback(async () => {
    await unlockRoomMutation.mutateAsync(undefined);
  }, [unlockRoomMutation]);

  const endRoom = useCallback(
    async (reason?: string) => {
      await endRoomMutation.mutateAsync(reason);
    },
    [endRoomMutation]
  );

  // Recording
  const startRecordingCallback = useCallback(async () => {
    await startRecordingMutation.mutateAsync(undefined);
  }, [startRecordingMutation]);

  const stopRecordingCallback = useCallback(async () => {
    await stopRecordingMutation.mutateAsync(undefined);
  }, [stopRecordingMutation]);

  // Waiting Room
  const approveWaitingParticipant = useCallback(
    async (userId: string) => {
      await approveWaitingMutation.mutateAsync(userId);
    },
    [approveWaitingMutation]
  );

  const denyWaitingParticipant = useCallback(
    async (userId: string, reason?: string) => {
      await denyWaitingMutation.mutateAsync({ userId, reason });
    },
    [denyWaitingMutation]
  );

  const approveAllWaiting = useCallback(async () => {
    const promises = waitingRoomParticipants.map((p) =>
      approveWaitingRoomParticipant(sessionId!, p.userId)
    );
    await Promise.all(promises);
    toast.success("Đã chấp nhận tất cả người tham gia đang chờ");
    await refetchWaitingRoom();
    await refetchParticipants();
  }, [
    waitingRoomParticipants,
    sessionId,
    refetchWaitingRoom,
    refetchParticipants,
  ]);

  const denyAllWaiting = useCallback(
    async (reason?: string) => {
      const promises = waitingRoomParticipants.map((p) =>
        denyWaitingRoomParticipant(sessionId!, p.userId, reason)
      );
      await Promise.all(promises);
      toast.success("Đã từ chối tất cả người tham gia đang chờ");
      await refetchWaitingRoom();
    },
    [waitingRoomParticipants, sessionId, refetchWaitingRoom]
  );

  // ===== REAL-TIME EVENTS =====

  useEffect(() => {
    if (!sessionId || !enabled) return;

    // Subscribe to real-time room events
    const unsubscribe = subscribeToRoomEvents(sessionId, (event) => {
      // Handle different event types
      switch (event.type) {
        case "participant_joined":
        case "participant_left":
        case "participant_updated":
          queryClient.invalidateQueries({
            queryKey: ["videoCallParticipants", sessionId],
          });
          break;
        case "room_settings_updated":
          queryClient.invalidateQueries({
            queryKey: ["videoCallRoom", sessionId],
          });
          break;
        case "waiting_room_updated":
          queryClient.invalidateQueries({
            queryKey: ["videoCallWaitingRoom", sessionId],
          });
          break;
        case "recording_started":
        case "recording_stopped":
          queryClient.invalidateQueries({
            queryKey: ["videoCallRoom", sessionId],
          });
          toast.info(
            event.type === "recording_started"
              ? "Đã bắt đầu ghi âm"
              : "Đã dừng ghi âm"
          );
          break;
      }
    });

    eventSubscriptionRef.current = unsubscribe;

    return () => {
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current();
        eventSubscriptionRef.current = null;
      }
    };
  }, [sessionId, enabled, queryClient]);

  // ===== RETURN HOOK INTERFACE =====

  return {
    // Room Data
    room: room || null,
    participants,
    waitingRoomParticipants,
    currentUser,
    analytics: analytics || null,

    // Loading States
    isLoading,
    isRefreshing,
    error,

    // User Status
    isAdmin,
    isModerator,
    canManageParticipants,
    canManageRoom,
    userPermissions,

    // Data Management
    refreshRoom,
    refreshParticipants,
    refreshWaitingRoom: refreshWaitingRoomCallback,
    refreshAnalytics: refreshAnalyticsCallback,

    // Participant Management
    muteParticipant: muteParticipantCallback,
    unmuteParticipant: unmuteParticipantCallback,
    disableVideo,
    enableVideo,
    stopScreenShare,
    removeParticipant: removeParticipantCallback,

    // Bulk Actions
    bulkMute,
    bulkUnmute,
    bulkDisableVideo,
    bulkEnableVideo,
    bulkRemove,

    // Role Management
    promoteToAdmin,
    promoteToModerator,
    demoteToParticipant,
    updatePermissions,

    // Room Management
    updateRoomSettings: updateRoomSettingsCallback,
    lockRoom: lockRoomCallback,
    unlockRoom: unlockRoomCallback,
    endRoom,

    // Recording
    startRecording: startRecordingCallback,
    stopRecording: stopRecordingCallback,
    isRecording,

    // Waiting Room
    approveWaitingParticipant,
    denyWaitingParticipant,
    approveAllWaiting,
    denyAllWaiting,

    // Statistics
    participantCount,
    adminCount,
    moderatorCount,
    speakingParticipants,
    mutedParticipants,
    videoDisabledParticipants,
  };
}

// ===== HELPER FUNCTIONS =====

function handleVideoCallError(error: any): VideoCallRoomError {
  if (error instanceof VideoCallRoomError) {
    return error;
  }

  return new VideoCallRoomError(
    error.message || "Có lỗi xảy ra với cuộc gọi video",
    "UNKNOWN_ERROR"
  );
}
