"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  MessageDto,
  MessageSenderDto,
  ConversationType,
} from "@/types/customer/user.types";
import { GroupRole } from "@/types/customer/group";
import { MessageItem } from "./MessageItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageGroupProps {
  messages: MessageDto[];
  sender: MessageSenderDto;
  isCurrentUserGroup: boolean;
  conversationType: ConversationType;
  onReply?: (message: MessageDto) => void;
  onScrollToMessage?: (messageId: string) => void;
  highlightedMessageId?: string | null;
  onMessageInView?: (messageId: string, inView: boolean) => void;
  unreadMessageIds?: Set<string>;
  onMessageVisible?: (messageId: string) => void;
}

export function MessageGroup({
  messages,
  sender,
  isCurrentUserGroup,
  conversationType,
  onReply,
  onScrollToMessage,
  highlightedMessageId,
  onMessageInView,
  unreadMessageIds = new Set(),
  onMessageVisible = () => {},
}: MessageGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  // Memoize the onMessageVisible callback to prevent re-renders
  const handleMessageVisible = useCallback(
    (messageId: string) => {
      onMessageVisible(messageId);
    },
    [onMessageVisible]
  );

  // Add a useEffect to force re-render when messages change
  useEffect(() => {
    // This effect will run whenever messages change, ensuring the component re-renders
  }, [messages]);

  if (messages.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get the role from the first message for role-based styling
  const firstMessage = messages[0];
  const role = firstMessage.senderRoleInGroup;

  // Determine avatar ring class based on role and conversation type
  const getRoleRingClass = () => {
    if (conversationType !== ConversationType.Group) {
      return "ring-2 ring-border";
    }

    switch (role) {
      case GroupRole.Admin:
        return "ring-2 ring-yellow-400";
      case GroupRole.Moderator:
        return "ring-2 ring-blue-400";
      case GroupRole.Member:
      default:
        return "ring-2 ring-border";
    }
  };

  // Scroll to a specific message within this group
  const scrollToMessageInGroup = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && groupRef.current) {
      const groupRect = groupRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();

      // Calculate relative position within the group
      const relativeTop =
        messageRect.top - groupRect.top + groupRef.current.scrollTop;

      // Scroll to position with offset for better visibility
      groupRef.current.scrollTo({
        top: relativeTop - 100, // 100px offset for better visibility
        behavior: "smooth",
      });
    }
  };

  // Check if any message in this group is highlighted
  const isGroupHighlighted = messages.some(
    (msg) => msg.id === highlightedMessageId
  );

  return (
    <div
      ref={groupRef}
      className={cn(
        "flex gap-3 mb-4 transition-all duration-300",
        isCurrentUserGroup ? "flex-row-reverse" : "flex-row",
        isGroupHighlighted &&
          "bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-2 -mx-2"
      )}
    >
      {/* Avatar - only show for other users */}
      {!isCurrentUserGroup && (
        <div className="flex-shrink-0">
          <Avatar className={cn("h-8 w-8", getRoleRingClass())}>
            <AvatarImage
              src={sender.avatarUrl || undefined}
              alt={sender.displayName}
            />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-xs">
              {getInitials(sender.displayName)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Messages */}
      <div
        className={cn(
          "flex-1 space-y-1",
          isCurrentUserGroup ? "items-end" : "items-start"
        )}
      >
        {/* Sender name with role indicator - only show for other users */}
        {!isCurrentUserGroup && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-1 ml-3">
            <span>{sender.displayName}</span>
            {conversationType === ConversationType.Group && role && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  role === GroupRole.Admin &&
                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                  role === GroupRole.Moderator &&
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  role === GroupRole.Member &&
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {role === GroupRole.Admin && "Quản trị viên"}
                {role === GroupRole.Moderator && "Điều hành viên"}
                {role === GroupRole.Member && "Thành viên"}
              </span>
            )}
          </div>
        )}

        {/* Message items with reduced spacing within group */}
        {/* IMPORTANT: Messages are already in correct chronological order from parent component */}
        {messages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            id={`message-${message.id}`}
            className={index > 0 ? "mt-1" : ""}
          >
            <MessageItem
              message={message}
              onReply={onReply}
              onScrollToMessage={onScrollToMessage}
              highlightedMessageId={highlightedMessageId}
              onInView={(inView: boolean) =>
                onMessageInView?.(message.id, inView)
              }
              isUnread={unreadMessageIds.has(message.id)}
              onMessageVisible={handleMessageVisible}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
