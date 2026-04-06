"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserMinus,
  Crown,
  User,
  AlertTriangle,
} from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import {
  muteParticipantMic,
  stopParticipantVideo,
  removeParticipant,
} from "@/lib/api/customer/video-call";
import { useVideoCallAdmin } from "@/hooks/useVideoCallAdmin";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

// Type definitions
type LoadingAction = "mute" | "video" | "remove";
type LoadingKey = `${LoadingAction}-${string}`;

interface ParticipantsPanelProps {
  onClose?: () => void;
  isVisible?: boolean;
  sessionId?: string;
  conversationId?: number;
  isAdmin?: boolean;
  isInitiator?: boolean;
  userId?: string;
  initiatorUserId?: string; // ID của người khởi tạo cuộc gọi
}

interface ParticipantInfo {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isAdmin: boolean;
  isCurrentUser: boolean;
}

export function ParticipantsPanel({
  onClose,
  isVisible = true,
  sessionId,
  conversationId,
  isAdmin = false,
  isInitiator = false,
  userId,
  initiatorUserId,
}: ParticipantsPanelProps) {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [isLoading, setIsLoading] = useState<LoadingKey | null>(null);

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { user } = useAuthStore();

  // Get detailed admin status and session info
  const {
    sessionDetails,
    participants: adminParticipants,
    refreshSessionDetails,
  } = useVideoCallAdmin({
    sessionId: sessionId || null,
    conversationId: conversationId,
    enabled: !!sessionId && !!conversationId,
  });

  // Memoized participant information processing
  const participantsList = useMemo((): ParticipantInfo[] => {
    return participants.map((participant) => {
      const name = participant.name || participant.identity || "Người dùng";
      const participantData = adminParticipants.find(
        (p) => p.userId === participant.identity
      );

      // Logic xác định admin dựa trên thời gian tham gia:
      // Người tham gia đầu tiên (theo thời gian) sẽ là admin duy nhất
      // Sắp xếp participants theo thời gian tham gia
      const sortedByJoinTime = participants.sort((a, b) => {
        // Sử dụng joinedAt nếu có, nếu không thì sử dụng identity để đảm bảo tính nhất quán
        if (a.joinedAt && b.joinedAt) {
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        }
        // Fallback: sắp xếp theo identity để đảm bảo tính nhất quán
        return a.identity.localeCompare(b.identity);
      });
      const firstParticipantId = sortedByJoinTime[0]?.identity;

      // Chỉ người tham gia đầu tiên là admin
      const isParticipantAdmin = participant.identity === firstParticipantId;

      const isCurrentUser = participant.identity === user?.id;

      return {
        identity: participant.identity,
        name,
        isLocal: participant.isLocal,
        isSpeaking: participant.isSpeaking,
        isMicrophoneEnabled: participant.isMicrophoneEnabled,
        isCameraEnabled: participant.isCameraEnabled,
        isAdmin: isParticipantAdmin,
        isCurrentUser,
      };
    });
  }, [
    participants,
    adminParticipants,
    sessionDetails?.initiatorUserId,
    initiatorUserId,
    isInitiator,
    user?.id,
  ]);

  // Memoized action handlers
  const handleMuteParticipant = useCallback(
    async (participantId: string) => {
      if (!sessionId) return;

      // Chỉ người tham gia đầu tiên (admin) mới có thể mute người khác
      const sortedParticipants = participants.sort((a, b) => {
        if (a.joinedAt && b.joinedAt) {
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        }
        return a.identity.localeCompare(b.identity);
      });
      const firstParticipantId = sortedParticipants[0]?.identity;

      if (user?.id !== firstParticipantId) return;

      const loadingKey: LoadingKey = `mute-${participantId}`;
      setIsLoading(loadingKey);

      try {
        // Admin chỉ có thể tắt mic của người tham gia
        await muteParticipantMic(sessionId, participantId);
        await refreshSessionDetails();

        toast.success("Đã tắt mic của người tham gia");
      } catch (error: any) {
        toast.error("Không thể tắt mic của người tham gia");
      } finally {
        setIsLoading(null);
      }
    },
    [sessionId, participants, user?.id, refreshSessionDetails]
  );

  const handleStopParticipantVideo = useCallback(
    async (participantId: string) => {
      if (!sessionId) return;

      // Chỉ người tham gia đầu tiên (admin) mới có thể tắt video người khác
      const sortedParticipants = participants.sort((a, b) => {
        if (a.joinedAt && b.joinedAt) {
          return a.joinedAt.getTime() - b.joinedAt.getTime();
        }
        return a.identity.localeCompare(b.identity);
      });
      const firstParticipantId = sortedParticipants[0]?.identity;

      if (user?.id !== firstParticipantId) return;

      const loadingKey: LoadingKey = `video-${participantId}`;
      setIsLoading(loadingKey);

      try {
        // Admin chỉ có thể tắt cam của người tham gia
        await stopParticipantVideo(sessionId, participantId);
        await refreshSessionDetails();

        toast.success("Đã tắt cam của người tham gia");
      } catch (error: any) {
        toast.error("Không thể tắt cam của người tham gia");
      } finally {
        setIsLoading(null);
      }
    },
    [sessionId, participants, user?.id, refreshSessionDetails]
  );

  // Show delete confirmation dialog
  const handleShowDeleteDialog = useCallback(
    (participantId: string, participantName: string) => {
      setParticipantToDelete({ id: participantId, name: participantName });
      setShowDeleteDialog(true);
    },
    []
  );

  // Handle actual removal after confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (!sessionId || !participantToDelete) return;

    // Chỉ người tham gia đầu tiên (admin) mới có thể xóa người khác
    const sortedParticipants = participants.sort((a, b) => {
      if (a.joinedAt && b.joinedAt) {
        return a.joinedAt.getTime() - b.joinedAt.getTime();
      }
      return a.identity.localeCompare(b.identity);
    });
    const firstParticipantId = sortedParticipants[0]?.identity;

    if (user?.id !== firstParticipantId) return;

    const { id: participantId, name: participantName } = participantToDelete;
    const loadingKey: LoadingKey = `remove-${participantId}`;
    setIsLoading(loadingKey);

    try {
      await removeParticipant(sessionId, participantId);

      // Refresh session details để cập nhật danh sách người tham gia
      await refreshSessionDetails();

      // Hiển thị thông báo thành công
      toast.success(`Đã xóa ${participantName} khỏi cuộc gọi`);
    } catch (error: any) {
      // Hiển thị thông báo lỗi
      const errorMessage = error.message || "Không thể xóa người tham gia";
      toast.error(errorMessage);
    } finally {
      setIsLoading(null);
      setShowDeleteDialog(false);
      setParticipantToDelete(null);
    }
  }, [
    sessionId,
    participants,
    user?.id,
    participantToDelete,
    refreshSessionDetails,
  ]);

  // Cancel delete action
  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
    setParticipantToDelete(null);
  }, []);

  return (
    <div
      className={`absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out z-50 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Người tham gia</h3>
          {onClose && (
            <Button
              onClick={onClose}
              className="rounded-full w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50"
              size="sm"
            >
              ×
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {participantsList.map((participant) => {
            const {
              identity,
              name,
              isLocal,
              isSpeaking,
              isMicrophoneEnabled,
              isCameraEnabled,
              isAdmin: isParticipantAdmin,
              isCurrentUser,
            } = participant;

            // Use project's standard avatar gradient and initials
            const avatarGradient = getAvatarGradient();
            const avatarLetter = getInitials(name);

            return (
              <div
                key={identity}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                            bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/30
                            ${
                              isSpeaking
                                ? "border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                                : "border border-gray-700/30"
                            }`}
              >
                <div
                  className={`w-12 h-12 ${avatarGradient} rounded-full flex items-center justify-center relative shadow-lg`}
                >
                  <span className="text-white font-bold text-sm">
                    {avatarLetter}
                  </span>
                  {isParticipantAdmin && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-white font-medium truncate max-w-[140px]"
                        title={name}
                      >
                        {name.length > 18
                          ? `${name.substring(0, 15)}...`
                          : name}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isParticipantAdmin ? (
                        <span className="text-xs bg-gradient-to-r from-purple-600/30 to-purple-500/30 text-purple-200 border border-purple-500/50 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 shadow-sm">
                          <Crown className="w-3 h-3" />
                          Quản trị viên
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-600/30 text-gray-300 border border-gray-500/50 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                          <User className="w-3 h-3" />
                          Thành viên
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* More menu - only show for non-admin participants and if current user is admin */}
                  {/* Only the first participant (admin) can manage other participants */}
                  {(() => {
                    const sortedParticipants = participants.sort((a, b) => {
                      if (a.joinedAt && b.joinedAt) {
                        return a.joinedAt.getTime() - b.joinedAt.getTime();
                      }
                      return a.identity.localeCompare(b.identity);
                    });
                    const firstParticipantId = sortedParticipants[0]?.identity;
                    return (
                      !isParticipantAdmin &&
                      user?.id === firstParticipantId &&
                      !isCurrentUser
                    );
                  })() && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-600/30"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-gray-800/95 backdrop-blur-sm border-gray-700/50 text-white shadow-xl">
                        {/* Chỉ hiển thị "Tắt mic" khi mic đang bật */}
                        {isMicrophoneEnabled && (
                          <DropdownMenuItem
                            onClick={() => handleMuteParticipant(identity)}
                            disabled={isLoading === `mute-${identity}`}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 text-gray-200 hover:text-white"
                          >
                            {isLoading === `mute-${identity}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                            ) : (
                              <MicOff className="h-4 w-4 text-red-400" />
                            )}
                            Tắt mic
                          </DropdownMenuItem>
                        )}

                        {/* Chỉ hiển thị "Tắt cam" khi cam đang bật */}
                        {isCameraEnabled && (
                          <DropdownMenuItem
                            onClick={() => handleStopParticipantVideo(identity)}
                            disabled={isLoading === `video-${identity}`}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 text-gray-200 hover:text-white"
                          >
                            {isLoading === `video-${identity}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                            ) : (
                              <VideoOff className="h-4 w-4 text-red-400" />
                            )}
                            Tắt cam
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleShowDeleteDialog(identity, name)}
                          disabled={isLoading === `remove-${identity}`}
                          className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        >
                          <UserMinus className="h-4 w-4" />
                          Xóa khỏi cuộc gọi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Xác nhận xóa người tham gia
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <span className="font-semibold text-white">
                {participantToDelete?.name}
              </span>{" "}
              khỏi cuộc gọi video này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDelete}
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading === `remove-${participantToDelete?.id}`}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading === `remove-${participantToDelete?.id}` ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang xóa...
                </div>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
