import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConversationPartnerDto,
  ConversationType,
} from "@/types/customer/user.types";
import { UserPresenceStatus } from "@/types/customer/models";
import { DirectDetailsSheet } from "./DirectDetailsSheet";
import { useChatHub } from "@/providers/ChatHubProvider";
import { useVideoCallContext } from "@/providers/VideoCallDirectProvider";
import {
  VideoCallButton,
  AudioCallButton,
} from "@/components/features/video-call/calldirect/VideoCallButton";

interface DirectChatHeaderProps {
  conversationId: number;
  partner?: ConversationPartnerDto | null;
  displayName: string;
  conversationType: ConversationType;
  avatarUrl?: string | null;
  onSearchOpen?: () => void;
}

export function DirectChatHeader({
  conversationId,
  partner,
  displayName,
  conversationType,
  avatarUrl,
  onSearchOpen,
}: DirectChatHeaderProps) {
  const { user } = useAuthStore();
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const { startCall, videoCallState } = useVideoCallContext();
  const { typingUsers } = useChatHub();

  const typingUsersInConversation = typingUsers[conversationId] || [];
  const typingUserNames = typingUsersInConversation
    .map((user) => user.fullName)
    .join(", ");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPresenceText = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "Đang hoạt động";
      case UserPresenceStatus.Busy:
        return "Bận";
      case UserPresenceStatus.Absent:
        return "Vắng mặt";
      case UserPresenceStatus.Offline:
      default:
        return "Không hoạt động";
    }
  };

  const getPresenceColor = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "text-green-500";
      case UserPresenceStatus.Busy:
        return "text-red-500";
      case UserPresenceStatus.Absent:
        return "text-yellow-500";
      case UserPresenceStatus.Offline:
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const handleVideoCall = () => {
    if (partner && conversationType === ConversationType.Direct) {
      startCall(
        conversationId,
        partner.userId,
        partner.fullName,
        partner.avatarUrl || ""
      );
    }
  };
  const isCalling =
    videoCallState.isOutgoingCall &&
    videoCallState.outgoingCallData?.receiverId === partner?.userId;

  const handleAudioCall = () => {
    // TODO: Implement audio call functionality
    console.log("Audio call not implemented yet");
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {displayName}
            </h2>
            {typingUsersInConversation.length > 0 ? (
              <p className="text-sm text-green-500">
                {typingUserNames}{" "}
                {typingUsersInConversation.length === 1
                  ? "đang nhập tin nhắn..."
                  : "đang nhập tin nhắn..."}
              </p>
            ) : conversationType === ConversationType.Direct && partner ? (
              <p
                className={`text-sm ${getPresenceColor(
                  partner.presenceStatus
                )}`}
              >
                {getPresenceText(partner.presenceStatus)}
              </p>
            ) : conversationType === ConversationType.Group ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhóm chat
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Search Messages Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchOpen}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Tìm kiếm tin nhắn"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Call Buttons - Only show for direct conversations */}
          {conversationType === ConversationType.Direct && partner && (
            <>
              {/* <AudioCallButton
                onClick={handleAudioCall}
                isCalling={isCalling}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              /> */}
              <VideoCallButton
                onClick={handleVideoCall}
                isCalling={isCalling}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              />
            </>
          )}
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsDetailsSheetOpen(true)}
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Direct Details Sheet */}
      <DirectDetailsSheet
        conversationId={conversationId}
        partner={partner}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </>
  );
}
