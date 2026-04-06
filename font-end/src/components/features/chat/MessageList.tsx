"use client";

import {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { PagedResult } from "@/types/api.types";
import {
  MessageDto,
  MessageType,
  ConversationType,
  ReactionDto,
} from "@/types/customer/user.types";
import { getMessageHistory } from "@/lib/api/customer/conversations";
import { MessageGroup } from "./MessageGroup";
import { SystemNotificationMessage } from "./SystemNotificationMessage";
import { useChatHub } from "@/providers/ChatHubProvider";
import { useAuthStore } from "@/store/authStore";
import { MarkAsReadDto } from "@/types/customer/hub.types";
import { MessageHistoryResponseDto } from "@/types/customer/conversation";
import { useDebouncedCallback } from "use-debounce";

interface MessageListProps {
  initialMessagesPage: PagedResult<MessageDto>;
  conversationId: number;
  conversationType: ConversationType;
  onReply?: (message: MessageDto) => void;
  onScrollToMessage?: (messageId: string) => void;
  highlightedMessageId?: string | null;
}

export interface MessageListRef {
  scrollToBottom: () => void;
}

const MessageListComponent = (
  {
    initialMessagesPage,
    conversationId,
    conversationType,
    onReply,
    onScrollToMessage,
    highlightedMessageId,
  }: MessageListProps,
  ref: React.Ref<MessageListRef>
) => {
  const { ref: topElementRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px 0px 0px", // Trigger 100px before the element comes into view
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { connection } = useChatHub();
  const queryClient = useQueryClient();
  const currentUserId = user?.id;

  // Track unread message IDs for the current user
  const [unreadMessageIds, setUnreadMessageIds] = useState<Set<string>>(() => {
    if (!currentUserId) return new Set();

    const initialUnreadIds = initialMessagesPage.items
      .filter((msg) => {
        // Ensure readBy array exists before checking
        const readBy = msg.readBy || [];
        return !readBy.some((receipt) => receipt.userId === currentUserId);
      })
      .map((msg) => msg.id);

    return new Set(initialUnreadIds);
  });

  // Track newly visible message IDs that are unread
  const [newlyVisibleUnreadMessageIds, setNewlyVisibleUnreadMessageIds] =
    useState<Set<string>>(new Set());

  // Track if user is at bottom of scroll
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Expose scrollToBottom method to parent components
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      // With flex-col-reverse, we want to scroll to the top to show newest messages at the bottom
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
          setIsAtBottom(true);
        }
      }, 0);
    }
  }, []);

  // Expose the scrollToBottom method via ref
  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }));

  // Set up infinite query for message history
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["messageHistory", conversationId],
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      getMessageHistory(conversationId, {
        beforeMessageId: pageParam ?? undefined,
        limit: 50,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
    // Seed the query with the data we already have from the details page
    initialData: {
      pages: [
        {
          messages: initialMessagesPage.items,
          hasMore:
            initialMessagesPage.pageNumber < initialMessagesPage.totalPages,
          nextCursor:
            initialMessagesPage.items.length > 0
              ? initialMessagesPage.items[0]?.id // The oldest message ID as cursor (first in chronological order)
              : null,
        },
      ],
      pageParams: [null],
    },
  });

  // Debounced function to send read receipts
  const sendReadReceipts = useDebouncedCallback(() => {
    if (
      newlyVisibleUnreadMessageIds.size > 0 &&
      connection?.state === "Connected" &&
      currentUserId
    ) {
      const idsToSend = Array.from(newlyVisibleUnreadMessageIds);

      console.log(
        "[MessageList] 📤 Sending read receipts for messages:",
        idsToSend
      );
      console.log("[MessageList] 🎯 Conversation ID:", conversationId);
      console.log("[MessageList] 👤 Current user ID:", currentUserId);

      const payload: MarkAsReadDto = {
        conversationId,
        messageIds: idsToSend,
      };

      connection
        .invoke("MarkMessagesAsRead", payload)
        .then(() => {
          console.log("[MessageList] ✅ Read receipts sent successfully");
          // Clear the set after successful send
          setNewlyVisibleUnreadMessageIds(new Set());
          // Update local unread message IDs
          setUnreadMessageIds((prev) => {
            const newSet = new Set(prev);
            idsToSend.forEach((id) => newSet.delete(id));
            console.log(
              "[MessageList] 🔄 Updated local unread count:",
              newSet.size
            );
            return newSet;
          });
        })
        .catch((error) => {
          console.error(
            "[MessageList] ❌ Failed to mark messages as read:",
            error
          );
        });
    } else {
      console.log("[MessageList] ⏸️ Skipping read receipts:", {
        hasVisibleMessages: newlyVisibleUnreadMessageIds.size > 0,
        connectionState: connection?.state,
        hasUserId: !!currentUserId,
      });
    }
  }, 1500); // Send read receipts after 1.5 seconds of inactivity

  // Handle when an unread message becomes visible - using useCallback to prevent infinite re-renders
  const handleUnreadMessageVisible = useCallback((messageId: string) => {
    console.log("[MessageList] 👁️ Unread message became visible:", messageId);

    // Only add to the set if the message is still unread
    setNewlyVisibleUnreadMessageIds((prev) => {
      // Check if the message is already in the set to prevent unnecessary updates
      if (prev.has(messageId)) {
        console.log(
          "[MessageList] ⏭️ Message already in visible set, skipping:",
          messageId
        );
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(messageId);
      console.log(
        "[MessageList] ➕ Added to visible set. Total visible unread:",
        newSet.size
      );
      return newSet;
    });
  }, []);

  // Trigger debounced send when newly visible unread messages change
  useEffect(() => {
    if (newlyVisibleUnreadMessageIds.size > 0) {
      sendReadReceipts();
    }
  }, [newlyVisibleUnreadMessageIds, sendReadReceipts]);

  // Trigger infinite scroll when top element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle scroll events to track position
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px tolerance
      setIsAtBottom(isNearBottom);
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Scroll to bottom when new messages are added (only if user was already at bottom)
  useEffect(() => {
    if (scrollContainerRef.current && isAtBottom) {
      // With flex-col-reverse, we want to scroll to the top to show newest messages at the bottom
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [data?.pages, isAtBottom]); // Depend on pages and isAtBottom

  // --- REMOVED: All SignalR event listeners ---
  // Event listening is now centralized in ChatHubProvider
  // MessageList just trusts that data from useInfiniteQuery is always up-to-date

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      sendReadReceipts.cancel();
    };
  }, [sendReadReceipts]);

  // Flatten all messages from all pages in correct chronological order
  // IMPORTANT: We need to reverse the pages order to get correct chronological order
  // because we're using flex-col-reverse for proper scrolling behavior
  const allMessages = useMemo(() => {
    if (!data?.pages) return [];

    // For correct chronological order with flex-col-reverse:
    // 1. Take pages in reverse order (oldest first)
    // 2. Within each page, messages are already in chronological order
    const messages: MessageDto[] = [];

    // Process pages from oldest to newest (reverse order)
    for (let i = data.pages.length - 1; i >= 0; i--) {
      const page = data.pages[i];
      if (page.messages) {
        messages.push(...page.messages);
      }
    }

    return messages;
  }, [data?.pages]);

  // Scroll to highlighted message when highlightedMessageId changes
  useEffect(() => {
    if (highlightedMessageId && allMessages.length > 0) {
      // Use setTimeout to ensure DOM is updated after cache update
      const timeoutId = setTimeout(() => {
        const targetElement = document.getElementById(
          `message-${highlightedMessageId}`
        );
        if (targetElement) {
          // Scroll to the message with smooth animation
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add highlight effect
          targetElement.classList.add("highlight-message");

          // Remove highlight after 3 seconds
          const highlightTimeout = setTimeout(() => {
            targetElement.classList.remove("highlight-message");
          }, 3000);

          return () => clearTimeout(highlightTimeout);
        }
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timeoutId);
    }
  }, [highlightedMessageId, allMessages]);

  // Group consecutive messages from the same sender using all messages from infinite query
  const messageGroups = useMemo(() => {
    const groups: {
      sender: {
        userId: string;
        displayName: string;
        avatarUrl?: string | null;
      };
      messages: MessageDto[];
      isCurrentUserGroup: boolean;
    }[] = [];

    let currentGroup: (typeof groups)[0] | null = null;

    allMessages.forEach((message) => {
      // Handle system messages separately (no grouping)
      if (message.messageType === MessageType.SystemNotification) {
        // End current group if exists
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        // Add as single message
        groups.push({
          sender: message.sender,
          messages: [message],
          isCurrentUserGroup: message.isMine,
        });
        return;
      }

      // Regular message grouping logic
      // Check if sender exists before accessing its properties
      if (!message.sender) {
        console.warn("Message without sender found:", message);
        return;
      }

      if (
        currentGroup &&
        currentGroup.sender.userId === message.sender.userId &&
        currentGroup.isCurrentUserGroup === message.isMine
      ) {
        // Add to current group
        currentGroup.messages.push(message);
      } else {
        // Start new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          sender: message.sender,
          messages: [message],
          isCurrentUserGroup: message.isMine,
        };
      }
    });

    // Add the last group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [allMessages]);

  return (
    <>
      {/* CSS for highlight effect */}
      <style jsx>{`
        .highlight-message {
          animation: highlight-flash 3s ease-in-out;
        }

        @keyframes highlight-flash {
          0%,
          100% {
            background-color: transparent;
          }
          15%,
          85% {
            background-color: rgba(59, 130, 246, 0.1);
          }
        }

        .dark .highlight-message {
          animation: highlight-flash-dark 3s ease-in-out;
        }

        @keyframes highlight-flash-dark {
          0%,
          100% {
            background-color: transparent;
          }
          15%,
          85% {
            background-color: rgba(59, 130, 246, 0.2);
          }
        }
      `}</style>

      <div
        // ADD flex and flex-col-reverse, REMOVE space-y-4 from here
        className="h-full w-full overflow-y-auto p-4 flex flex-col-reverse relative"
        ref={scrollContainerRef}
      >
        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
                setIsAtBottom(true);
              }
            }}
            className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-all z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* WRAP the list in a div to re-apply space-y-4 */}
        <div className="space-y-4">
          {messageGroups.length > 0 ? (
            messageGroups.map((group, groupIndex) => {
              const firstMessage = group.messages[0];

              // Simplified rendering logic
              if (firstMessage.messageType === MessageType.SystemNotification) {
                return (
                  <SystemNotificationMessage
                    key={`${firstMessage.id}-${groupIndex}`}
                    message={firstMessage}
                  />
                );
              }

              return (
                <MessageGroup
                  key={`${firstMessage.id}-${groupIndex}`}
                  messages={group.messages}
                  sender={group.sender}
                  isCurrentUserGroup={group.isCurrentUserGroup}
                  conversationType={conversationType}
                  onReply={onReply}
                  onScrollToMessage={onScrollToMessage}
                  highlightedMessageId={highlightedMessageId}
                  onMessageInView={(messageId: string, inView: boolean) => {
                    // Only track messages that are not from the current user and are unread
                    const message = allMessages.find((m) => m.id === messageId);
                    if (!message || message.isMine || !user) return;

                    // Check if user has already read this message
                    // Ensure readBy array exists before checking
                    const readBy = message.readBy || [];
                    const isRead = readBy.some(
                      (receipt) => receipt.userId === user.id
                    );
                    if (isRead) return;

                    // This is for backward compatibility with the old system
                    // The new system uses the handleUnreadMessageVisible function
                  }}
                  unreadMessageIds={unreadMessageIds}
                  onMessageVisible={handleUnreadMessageVisible}
                />
              );
            })
          ) : (
            // Empty state
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-muted-foreground">
                <div className="text-lg mb-2">💬</div>
                <div className="text-sm">Chưa có tin nhắn nào</div>
                <div className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</div>
              </div>
            </div>
          )}
        </div>

        {/* Error state */}
        {isError && (
          <div className="text-center text-sm text-red-500">
            Could not load messages.
          </div>
        )}

        {/* PLACE these elements AFTER the message list in the JSX */}
        {/* Loading indicator for fetching older messages */}
        {isFetchingNextPage && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading older messages...
          </p>
        )}

        {/* Sentinel element for infinite scroll */}
        <div ref={topElementRef} className="h-1" />
      </div>
    </>
  );
};

export const MessageList = forwardRef(MessageListComponent);
