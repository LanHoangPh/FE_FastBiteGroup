"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { MoreVertical, Search, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConversationDetailDto } from "@/types/customer/user.types";
import { GroupDetailsSheet } from "@/components/features/groups/GroupDetailsSheet";
import { VideoCallSetupModal } from "@/components/features/video-call/setting/VideoCallSetupModal";

interface GroupChatHeaderProps {
  conversationDetails: ConversationDetailDto;
  onSearchOpen?: () => void;
}

export function GroupChatHeader({
  conversationDetails,
  onSearchOpen,
}: GroupChatHeaderProps) {
  const { user } = useAuthStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isVideoCallSetupOpen, setIsVideoCallSetupOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={conversationDetails.avatarUrl || undefined}
              alt={conversationDetails.displayName}
            />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-sm">
              {getInitials(conversationDetails.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {conversationDetails.displayName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhóm chat
            </p>
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

          {/* <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </Button> */}

          {/* Video Call Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVideoCallSetupOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Bắt đầu cuộc gọi video"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>

          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsSheetOpen(true)}
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

      {/* The Sheet component is rendered here but controlled by the state */}
      {conversationDetails.groupId && (
        <GroupDetailsSheet
          groupId={conversationDetails.groupId}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}

      {/* Video Call Setup Modal */}
      <VideoCallSetupModal
        isOpen={isVideoCallSetupOpen}
        onOpenChange={setIsVideoCallSetupOpen}
        groupId={conversationDetails.conversationId.toString()}
        groupName={conversationDetails.displayName}
        userId={user?.id}
        onJoinCall={() => {
          // This callback is called when the setup modal starts the call
          // The modal handles the API call and navigation internally
        }}
      />
    </>
  );
}
