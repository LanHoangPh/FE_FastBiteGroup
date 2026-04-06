"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { throttle } from "lodash-es";

import { useAuthStore } from "@/store/authStore";
import {
  MessageDto,
  ReadReceiptDto,
  MessageType,
  ReactionDto,
} from "@/types/customer/user.types";
import { TypingUserDto, MarkAsReadDto } from "@/types/customer/hub.types";
import { InfiniteData } from "@tanstack/react-query";
import { MessageHistoryResponseDto } from "@/types/customer/conversation";

interface ChatHubContextType {
  connection: HubConnection | null;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  startTyping: (conversationId: number, typingUser: TypingUserDto) => void;
  stopTyping: (conversationId: number) => void;
  markMessagesAsRead: (payload: MarkAsReadDto) => void;
  typingUsers: Record<number, TypingUserDto[]>;
}

const ChatHubContext = createContext<ChatHubContextType | undefined>(undefined);

export function ChatHubProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [typingUsers, setTypingUsers] = useState<
    Record<number, TypingUserDto[]>
  >({});
  const isAtBottomRef = useRef(true);

  const showThrottledConnectionStatus = throttle(
    (message: string, description?: string) => {
      console.log(`[ChatHub] ${message}`, description);
    },
    10000,
    { leading: true, trailing: false }
  );

  const showThrottledSuccess = throttle(
    (message: string, description?: string) => {
      console.log(`[ChatHub] ${message}`, description);
    },
    10000,
    { leading: true, trailing: false }
  );

  // --- Define event handlers with useCallback for stable references ---
  // MOVED OUTSIDE useEffect to follow Rules of Hooks

  // 1. Handle new message received
  const handleReceiveMessage = useCallback(
    (newMessage: MessageDto) => {
      console.log("[ChatHub] 🚀 NEW MESSAGE RECEIVED:", newMessage);
      console.log("[ChatHub] Message details:", {
        id: newMessage.id,
        content: newMessage.content,
        conversationId: newMessage.conversationId,
        sender: newMessage.sender,
      });

      const queryKey = ["messageHistory", newMessage.conversationId];

      // Update the cache
      queryClient.setQueryData<InfiniteData<MessageHistoryResponseDto>>(
        queryKey,
        (oldData) => {
          console.log("[ChatHub] Current cache data:", oldData);

          if (!oldData) {
            console.log("[ChatHub] No existing data, creating new cache");
            return {
              pages: [
                {
                  messages: [newMessage],
                  hasMore: false,
                  nextCursor: null,
                },
              ],
              pageParams: [null],
            };
          }

          console.log(
            "[ChatHub] Updating existing cache with",
            oldData.pages.length,
            "pages"
          );

          // Create a deep copy to avoid direct mutation
          const newData = {
            ...oldData,
            pages: [...oldData.pages],
          };

          // Add the new message to the first page (most recent)
          if (newData.pages.length > 0 && newData.pages[0]) {
            console.log(
              "[ChatHub] Adding message to first page with",
              newData.pages[0].messages?.length || 0,
              "existing messages"
            );
            newData.pages[0] = {
              ...newData.pages[0],
              messages: [newMessage, ...(newData.pages[0].messages || [])],
            };
          } else {
            console.log("[ChatHub] Creating first page with new message");
            newData.pages = [
              {
                messages: [newMessage],
                hasMore: false,
                nextCursor: null,
              },
            ];
          }

          console.log("[ChatHub] Updated cache:", newData);
          return newData;
        }
      );

      // Force invalidation to ensure UI updates
      console.log(
        "[ChatHub] Invalidating queries for conversation:",
        newMessage.conversationId
      );
      queryClient.invalidateQueries({
        queryKey: ["messageHistory", newMessage.conversationId],
      });
    },
    [queryClient]
  );

  // 2. Handle message deletion
  const handleMessageDeleted = useCallback(
    (conversationId: number, messageId: string) => {
      console.log("[ChatHub] ✅ MessageDeleted event received:", {
        conversationId,
        messageId,
      });

      const queryKey = ["messageHistory", conversationId];
      queryClient.setQueryData<InfiniteData<MessageHistoryResponseDto>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          console.log("[ChatHub] Processing message deletion for:", messageId);

          // Create a deep copy to avoid direct mutation
          const newData = {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages:
                page.messages?.map((message) => {
                  if (message.id === messageId) {
                    console.log(
                      "[ChatHub] Found and updating deleted message:",
                      messageId
                    );
                    return {
                      ...message,
                      isDeleted: true,
                      messageType: MessageType.Delete,
                      content: "[Tin nhắn đã được thu hồi]",
                      attachments: [],
                      reactions: [],
                    };
                  }
                  return message;
                }) || [],
            })),
          };

          console.log("[ChatHub] Message deletion cache updated successfully");
          return newData;
        }
      );
    },
    [queryClient]
  );

  // 3. Handle message reactions updated
  const handleMessageReactionsUpdated = useCallback(
    (messageId: string, newReactions: ReactionDto[]) => {
      console.log("[ChatHub] 🎯 MessageReactionsUpdated event received:", {
        messageId,
        reactionsCount: newReactions.length,
      });
      console.log("[ChatHub] 📊 Full reactions data:", newReactions);
      console.log("[ChatHub] 🕐 Event received at:", new Date().toISOString());

      // Update all conversation caches that might contain this message
      const messageQueries = queryClient
        .getQueryCache()
        .findAll({
          queryKey: ["messageHistory"],
          exact: false,
        })
        .filter(
          (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey.length === 2 &&
            query.queryKey[0] === "messageHistory" &&
            typeof query.queryKey[1] === "number"
        );

      // Update each conversation's cache
      messageQueries.forEach((query) => {
        const conversationId = query.queryKey[1] as number;

        queryClient.setQueryData<InfiniteData<MessageHistoryResponseDto>>(
          ["messageHistory", conversationId],
          (oldData) => {
            if (!oldData) return oldData;

            console.log(
              "[ChatHub] Processing reactions update for conversation:",
              conversationId
            );

            // Create a deep copy and update the message reactions
            const newData = {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                messages:
                  page.messages?.map((message) => {
                    if (message.id === messageId) {
                      console.log(
                        "[ChatHub] Found and updating reactions for message:",
                        messageId
                      );
                      return {
                        ...message,
                        reactions: newReactions,
                      };
                    }
                    return message;
                  }) || [],
              })),
            };

            return newData;
          }
        );
      });
    },
    [queryClient]
  );

  // 4. Handle typing events
  const handleUserIsTyping = useCallback(
    (conversationId: number, typingUser: TypingUserDto) => {
      console.log("[ChatHub] User is typing:", conversationId, typingUser);

      setTypingUsers((prev) => {
        const currentTyping = prev[conversationId] || [];
        // Check if user is already in the typing list
        const userExists = currentTyping.some(
          (user) => user.userId === typingUser.userId
        );

        if (!userExists) {
          return {
            ...prev,
            [conversationId]: [...currentTyping, typingUser],
          };
        }
        return prev;
      });
    },
    []
  );

  // 5. Handle stop typing events
  const handleUserStoppedTyping = useCallback(
    (conversationId: number, userId: string) => {
      console.log("[ChatHub] User stopped typing:", conversationId, userId);

      setTypingUsers((prev) => {
        const currentTyping = prev[conversationId] || [];
        const updatedTyping = currentTyping.filter(
          (user) => user.userId !== userId
        );

        return {
          ...prev,
          [conversationId]: updatedTyping,
        };
      });
    },
    []
  );

  // 6. Handle read receipts
  const handleMessagesReadBy = useCallback(
    (messageIds: any, reader: ReadReceiptDto) => {
      console.log("[ChatHub] 📖 Messages read by:", { messageIds, reader });
      console.log("[ChatHub] 👤 Reader details:", reader);
      console.log("[ChatHub] 🔍 MessageIds type:", typeof messageIds);
      console.log(
        "[ChatHub] 🔍 MessageIds is array:",
        Array.isArray(messageIds)
      );

      // Ensure messageIds is an array
      let messageIdArray: string[] = [];
      if (Array.isArray(messageIds)) {
        messageIdArray = messageIds;
      } else if (typeof messageIds === "string") {
        messageIdArray = [messageIds];
      } else if (messageIds && typeof messageIds === "object") {
        // Handle case where backend sends an object with messageIds property
        if (Array.isArray(messageIds.messageIds)) {
          messageIdArray = messageIds.messageIds;
        } else if (typeof messageIds.messageIds === "string") {
          messageIdArray = [messageIds.messageIds];
        }
      }

      console.log("[ChatHub] 🔧 Processed messageIds:", messageIdArray);

      if (messageIdArray.length === 0) {
        console.warn(
          "[ChatHub] ⚠️ No valid message IDs found, skipping read receipt update"
        );
        return;
      }

      try {
        // Get all query keys that start with "messageHistory"
        const queryCache = queryClient.getQueryCache();
        const messageQueries = queryCache
          .getAll()
          .filter(
            (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey[0] === "messageHistory" &&
              typeof query.queryKey[1] === "number"
          );

        // Update each conversation's cache
        messageQueries.forEach((query) => {
          const conversationId = query.queryKey[1] as number;

          queryClient.setQueryData(
            ["messageHistory", conversationId],
            (oldData: InfiniteData<MessageHistoryResponseDto>) => {
              if (!oldData) return oldData;

              console.log(
                "[ChatHub] 🔄 Updating read receipts for conversation:",
                conversationId
              );

              // Create a deep copy to avoid direct mutation
              const newData = {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  messages:
                    page.messages?.map((message) => {
                      // Check if this message should be updated
                      if (messageIdArray.includes(message.id)) {
                        console.log(
                          "[ChatHub] ✅ Adding read receipt to message:",
                          message.id
                        );

                        const currentReadBy = message.readBy || [];

                        // Check if this user has already read this message
                        const existingReceiptIndex = currentReadBy.findIndex(
                          (receipt) => receipt.userId === reader.userId
                        );

                        let newReadBy;
                        if (existingReceiptIndex >= 0) {
                          // Update existing receipt
                          newReadBy = [...currentReadBy];
                          newReadBy[existingReceiptIndex] = reader;
                        } else {
                          // Add new receipt
                          newReadBy = [...currentReadBy, reader];
                        }

                        return {
                          ...message,
                          readBy: newReadBy,
                        };
                      }
                      return message;
                    }) || [],
                })),
              };

              console.log("[ChatHub] 📖 Read receipts updated successfully");
              return newData;
            }
          );
        });
      } catch (error) {
        console.error("[ChatHub] ❌ Error updating read receipts:", error);
        console.error("[ChatHub] 📋 Original messageIds:", messageIds);
        console.error("[ChatHub] 📋 Reader data:", reader);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    // Only attempt connection for authenticated users with Customer or VIP roles
    if (
      !isAuthenticated ||
      !accessToken ||
      !user?.roles?.some((role) => role === "Customer" || role === "VIP")
    ) {
      console.log(
        "[ChatHub] Skipping connection - user not authenticated or doesn't have Customer/VIP role:",
        {
          isAuthenticated,
          hasToken: !!accessToken,
          userRoles: user?.roles,
          hasCustomerOrVipRole: user?.roles?.some(
            (role) => role === "Customer" || role === "VIP"
          ),
        }
      );
      return;
    }

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";
    const baseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    const hubUrl = `${baseUrl}/hubs/chatHub`;

    console.log(`[ChatHub] Hub URL: ${hubUrl}`);
    console.log("[ChatHub] Attempting to connect to:", hubUrl);

    // Build the connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          console.log("[ChatHub] Providing access token for authentication");
          return accessToken;
        },
        withCredentials: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const retryCount = retryContext.previousRetryCount;
          if (retryCount === 0) return 0;
          if (retryCount === 1) return 2000;
          if (retryCount === 2) return 5000;
          if (retryCount === 3) return 10000;
          if (retryCount <= 10) return 30000;
          return null;
        },
      })
      .configureLogging("Information")
      .build();

    setConnection(newConnection);

    // Start the connection
    newConnection
      .start()
      .then(() => {
        console.log("Chat Hub connected successfully");
        showThrottledSuccess(
          "Đã kết nối chat thời gian thực",
          "Sẽ nhận tin nhắn tự động"
        );
      })
      .catch((err) => {
        console.error("Chat Hub Connection Error: ", err);

        let errorMessage = "Không thể kết nối chat thời gian thực";
        let errorDescription = "Vui lòng kiểm tra kết nối mạng và thử lại";

        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();

          if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
            errorDescription = "Lỗi xác thực - vui lòng đăng nhập lại";
          } else if (
            errorMsg.includes("404") ||
            errorMsg.includes("not found")
          ) {
            errorDescription = "Endpoint chat không tồn tại trên server";
          } else if (
            errorMsg.includes("cors") ||
            errorMsg.includes("cross-origin")
          ) {
            errorDescription = "Lỗi CORS - vui lòng kiểm tra cấu hình server";
          } else if (
            errorMsg.includes("timeout") ||
            errorMsg.includes("timed out")
          ) {
            errorDescription =
              "Kết nối bị timeout - server có thể đang quá tải";
          } else if (
            errorMsg.includes("network") ||
            errorMsg.includes("offline")
          ) {
            errorDescription =
              "Lỗi kết nối mạng - vui lòng kiểm tra kết nối internet";
          }
        }

        console.error(errorMessage, {
          description: errorDescription,
          duration: 10000,
        });
      });

    // Add connection event handlers
    newConnection.onclose((error: Error | undefined) => {
      if (error) {
        console.error("[ChatHub] Connection closed with error:", error);
        console.error("Mất kết nối chat thời gian thực", {
          description: "Chat thời gian thực sẽ tạm thời không khả dụng",
        });
      } else {
        console.log("[ChatHub] Connection closed gracefully");
      }
    });

    newConnection.onreconnecting((error: Error | undefined) => {
      console.warn("[ChatHub] Reconnecting...", error);
      showThrottledConnectionStatus(
        "Đang kết nối lại...",
        "Đang khôi phục kết nối chat thời gian thực"
      );
    });

    newConnection.onreconnected((connectionId?: string) => {
      console.log("[ChatHub] Reconnected successfully with ID:", connectionId);
      showThrottledSuccess("Đã khôi phục kết nối chat thời gian thực");
    });

    // ===============================
    // SIGNALR EVENT LISTENERS - REFACTORED
    // ===============================

    // --- Register listeners ---
    newConnection.on("ReceiveMessage", handleReceiveMessage);
    newConnection.on("MessageDeleted", handleMessageDeleted);
    newConnection.on("MessageReactionsUpdated", handleMessageReactionsUpdated);
    newConnection.on("UserIsTyping", handleUserIsTyping);
    newConnection.on("UserStoppedTyping", handleUserStoppedTyping);
    newConnection.on("MessagesReadBy", handleMessagesReadBy);

    // --- Cleanup ---
    return () => {
      if (newConnection) {
        console.log("[ChatHub] Disconnecting from ChatHub...");
        newConnection.off("ReceiveMessage", handleReceiveMessage);
        newConnection.off("MessageDeleted", handleMessageDeleted);
        newConnection.off(
          "MessageReactionsUpdated",
          handleMessageReactionsUpdated
        );
        newConnection.off("UserIsTyping", handleUserIsTyping);
        newConnection.off("UserStoppedTyping", handleUserStoppedTyping);
        newConnection.off("MessagesReadBy", handleMessagesReadBy);
        newConnection.stop().catch((error: Error) => {
          console.error("[ChatHub] Error during disconnect:", error);
        });
      }
    };
  }, [
    isAuthenticated,
    accessToken,
    user,
    queryClient,
    handleReceiveMessage,
    handleMessageDeleted,
    handleMessageReactionsUpdated,
    handleUserIsTyping,
    handleUserStoppedTyping,
    handleMessagesReadBy,
  ]);

  // ===============================
  // HUB METHODS
  // ===============================

  const joinConversation = (conversationId: number) => {
    if (connection && connection.state === "Connected") {
      connection
        .invoke("JoinConversation", conversationId)
        .catch((err) => console.error("JoinConversation error:", err));
    }
  };

  const leaveConversation = (conversationId: number) => {
    if (connection && connection.state === "Connected") {
      connection
        .invoke("LeaveConversation", conversationId)
        .catch((err) => console.error("LeaveConversation error:", err));
    }
  };

  const startTyping = (conversationId: number, typingUser: TypingUserDto) => {
    if (connection && connection.state === "Connected") {
      connection
        .invoke("StartTyping", conversationId, typingUser)
        .catch((err) => console.error("StartTyping error:", err));
    }
  };

  const stopTyping = (conversationId: number) => {
    if (connection && connection.state === "Connected") {
      connection
        .invoke("StopTyping", conversationId)
        .catch((err) => console.error("StopTyping error:", err));
    }
  };

  const markMessagesAsRead = (payload: MarkAsReadDto) => {
    if (connection && connection.state === "Connected") {
      connection
        .invoke("MarkMessagesAsRead", payload)
        .catch((err) => console.error("MarkMessagesAsRead error:", err));
    }
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const value: ChatHubContextType = {
    connection,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    typingUsers,
  };

  return (
    <ChatHubContext.Provider value={value}>{children}</ChatHubContext.Provider>
  );
}

export function useChatHub() {
  const context = useContext(ChatHubContext);
  if (context === undefined) {
    throw new Error("useChatHub must be used within a ChatHubProvider");
  }
  return context;
}
