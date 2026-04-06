"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import {
  MessageDto,
  ToggleReactionRequestDto,
  ReactionDto,
} from "@/types/customer/user.types";
import { MessageHistoryResponseDto } from "@/types/customer/conversation";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { ReactionList } from "./ReactionList";
import { ReactionPicker } from "./ReactionPicker";
import { toggleMessageReaction } from "@/lib/api/customer/conversations";
import { handleApiError } from "@/lib/utils/errorUtils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: MessageDto;
  onReply?: (message: MessageDto) => void;
  onScrollToMessage?: (messageId: string) => void;
  highlightedMessageId?: string | null;
  onInView?: (inView: boolean) => void;
  isUnread?: boolean;
  onMessageVisible?: (messageId: string) => void;
}

export function MessageItem({
  message,
  onReply,
  onScrollToMessage,
  highlightedMessageId,
  onInView,
  isUnread,
  onMessageVisible,
}: MessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { ref, inView } = useInView({
    threshold: 0.5, // 50% of the element needs to be visible
    triggerOnce: true, // Only trigger once
    rootMargin: "0px 0px 0px 0px",
  });

  // Cache key for this conversation's message history
  const queryKey = ["messageHistory", message.conversationId];

  // Toggle reaction mutation with OPTIMISTIC UPDATES
  const toggleReactionMutation = useMutation({
    mutationFn: ({ reactionCode }: { reactionCode: string }) =>
      toggleMessageReaction(message.conversationId, message.id, {
        reactionCode,
      }),

    // OPTIMISTIC UPDATE - Updates UI immediately before API responds
    onMutate: async ({ reactionCode }) => {
      console.log(
        "[MessageItem] 🚀 Optimistic update for reaction:",
        reactionCode
      );

      // Cancel ongoing fetches to avoid conflicts
      await queryClient.cancelQueries({ queryKey });

      // Save snapshot of previous data for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<MessageHistoryResponseDto>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          console.log("[MessageItem] Updating cache optimistically...");

          const newData = {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) => {
                if (msg.id === message.id) {
                  console.log(
                    "[MessageItem] Found target message, updating reactions"
                  );

                  const currentReactions = msg.reactions || [];
                  const currentUserId = user?.id;

                  if (!currentUserId) return msg;

                  // Check if user already has this reaction
                  const existingReactionIndex = currentReactions.findIndex(
                    (r) =>
                      r.userId === currentUserId &&
                      r.reactionCode === reactionCode
                  );

                  let newReactions: ReactionDto[];

                  if (existingReactionIndex >= 0) {
                    // Remove existing reaction (toggle off)
                    console.log("[MessageItem] Removing existing reaction");
                    newReactions = currentReactions.filter(
                      (_, index) => index !== existingReactionIndex
                    );
                  } else {
                    // Add new reaction (toggle on)
                    console.log("[MessageItem] Adding new reaction");
                    const newReaction: ReactionDto = {
                      userId: currentUserId,
                      reactionCode,
                      reactedAt: new Date().toISOString(),
                      fullName: user?.fullName || "You",
                      avatarUrl: user?.avatarUrl || null,
                    };
                    newReactions = [...currentReactions, newReaction];
                  }

                  return {
                    ...msg,
                    reactions: newReactions,
                  };
                }
                return msg;
              }),
            })),
          };

          console.log("[MessageItem] Optimistic update complete");
          return newData;
        }
      );

      return { previousData };
    },

    // Rollback on error
    onError: (error, variables, context) => {
      console.error(
        "[MessageItem] ❌ Reaction mutation failed, rolling back:",
        error
      );

      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast.error("Không thể thêm reaction. Vui lòng thử lại.");
      handleApiError(error);
    },

    // Always refetch after completion to ensure consistency
    onSettled: () => {
      console.log("[MessageItem] 🔄 Refetching to ensure consistency");
      queryClient.invalidateQueries({ queryKey });
    },

    // Success callback (optional)
    onSuccess: (data) => {
      console.log("[MessageItem] ✅ Reaction API call successful:", data);
      console.log(
        "[MessageItem] 📡 Backend should now broadcast MessageReactionsUpdated event"
      );
      console.log("[MessageItem] 🎯 ConversationId:", message.conversationId);
      console.log("[MessageItem] 🎯 MessageId:", message.id);
      console.log(
        "[MessageItem] 🎯 Expected SignalR group: Conversation_" +
          message.conversationId
      );
      console.log(
        "[MessageItem] 🔍 Watch for SignalR event in ChatHubProvider..."
      );

      // Add a timeout to check if SignalR event was received
      setTimeout(() => {
        console.log(
          "[MessageItem] ⏰ 3 seconds passed - did you see SignalR event in ChatHubProvider?"
        );
        console.log(
          "[MessageItem] 🚨 If no SignalR event, this is a backend group broadcasting issue!"
        );
      }, 3000);
    },
  });

  // Handle reaction toggle
  const handleReactionToggle = (reactionCode: string) => {
    console.log("[MessageItem] 👆 User clicked reaction:", reactionCode);
    toggleReactionMutation.mutate({ reactionCode });
  };

  // Notify parent when view status changes
  useEffect(() => {
    if (onInView) {
      onInView(inView);
    }
  }, [inView, onInView]);

  // Report when unread message becomes visible for read receipts
  useEffect(() => {
    if (isUnread && inView && onMessageVisible) {
      console.log(
        "[MessageItem] 👁️ Unread message became visible:",
        message.id
      );
      onMessageVisible(message.id);
    }
  }, [isUnread, inView, message.id, onMessageVisible]);

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          "flex w-full",
          message.isMine ? "justify-end" : "justify-start"
        )}
      >
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 italic flex items-center gap-2">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {/* Render the content from the backend */}
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const isHighlighted = highlightedMessageId === message.id;

  // Handle reply action with smooth scrolling
  const handleReply = (msg: MessageDto) => {
    if (onReply) {
      onReply(msg);
    }
  };

  // Handle scroll to message with smooth scrolling
  const handleScrollToMessage = (messageId: string) => {
    if (onScrollToMessage) {
      onScrollToMessage(messageId);
    }
  };

  return (
    <div
      ref={ref}
      id={`message-${message.id}`}
      data-message-id={message.id}
      className={cn(
        "flex w-full group relative transition-all duration-200 px-2 py-1 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-lg",
        message.isMine ? "justify-end" : "justify-start",
        isHighlighted &&
          "bg-blue-100/50 dark:bg-blue-900/20 ring-2 ring-blue-500/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-xs sm:max-w-sm lg:max-w-md relative">
        {/* Compact Reply Preview */}
        {message.parentMessage && (
          <div
            className={cn(
              "text-xs mb-1 pl-2 border-l-2 border-blue-400/60 transition-all duration-200 group/reply bg-blue-50/30 dark:bg-blue-950/20 p-1.5 rounded-r-md",
              onScrollToMessage &&
                "cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-950/30 hover:border-blue-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (onScrollToMessage && message.parentMessageId) {
                handleScrollToMessage(message.parentMessageId);
              }
            }}
          >
            <div className="flex items-center gap-1">
              <span className="font-medium text-blue-600 dark:text-blue-400 text-xs">
                ↳ {message.parentMessage.senderName}
              </span>
              {onScrollToMessage && (
                <svg
                  className="w-2.5 h-2.5 text-blue-500 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              )}
            </div>
            <div className="text-gray-600 dark:text-gray-300 truncate max-w-[200px] text-xs">
              {message.parentMessage.contentSnippet}
            </div>
          </div>
        )}

        {/* Compact Square Message Bubble */}
        <div
          className={cn(
            "rounded-lg p-2.5 relative shadow-sm transition-all duration-200 border",
            message.isMine
              ? "bg-blue-500 text-white rounded-tr-sm border-blue-400/20"
              : "bg-white dark:bg-gray-800 text-foreground rounded-tl-sm border-gray-200 dark:border-gray-700"
          )}
        >
          {/* Message Content */}
          <MessageContent
            message={message}
            onScrollToMessage={handleScrollToMessage}
          />

          {/* Compact Timestamp */}
          <div
            className={cn(
              "text-xs mt-1 flex items-center justify-between",
              message.isMine ? "text-white/70" : "text-muted-foreground"
            )}
          >
            <span>
              {new Date(message.sentAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {message.isMine && (
              <div className="w-1 h-1 bg-white/60 rounded-full" />
            )}
          </div>
        </div>

        {/* Compact Message Actions - Positioned to not overlap content */}
        {isHovered && (
          <div
            className={cn(
              "absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150",
              message.isMine ? "-left-16 top-0" : "-right-16 top-0"
            )}
          >
            <MessageActions
              message={message}
              onReply={handleReply}
              onReactionSelect={handleReactionToggle}
            />
          </div>
        )}

        {/* Compact Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={cn(
              "mt-0.5",
              message.isMine ? "flex justify-end" : "flex justify-start"
            )}
          >
            <ReactionList
              reactions={message.reactions}
              messageId={message.id}
              conversationId={message.conversationId}
              onReactionToggle={handleReactionToggle}
              disabled={toggleReactionMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
