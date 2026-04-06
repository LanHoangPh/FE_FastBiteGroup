"use client";

import { useEffect, useRef, createContext, useContext } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import { toast } from "sonner";
import { throttle } from "lodash-es";

import { useAuthStore } from "@/store/authStore";
import {
  NotificationDto,
  NotificationType,
} from "@/types/customer/notification";
import { PagedResult } from "@/types/api.types";
import { CustomNotificationToast } from "@/components/features/notifications/CustomNotificationToast";

// Context for sharing the SignalR connection
interface NotificationsHubContextType {
  connection: HubConnection | null;
  isConnected: boolean;
}

const NotificationsHubContext = createContext<NotificationsHubContextType>({
  connection: null,
  isConnected: false,
});

// Custom hook to use the NotificationsHub connection
export function useNotificationsHub() {
  const context = useContext(NotificationsHubContext);
  if (!context) {
    throw new Error(
      "useNotificationsHub must be used within a NotificationsHubProvider"
    );
  }
  return context;
}

interface NotificationsHubProviderProps {
  children: React.ReactNode;
}

export function NotificationsHubProvider({
  children,
}: NotificationsHubProviderProps) {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const connectionRef = useRef<HubConnection | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  // Throttled toast notifications to prevent spam
  const showThrottledNotification = throttle(
    (notification: NotificationDto) => {
      toast(<CustomNotificationToast notification={notification} />, {
        duration: 5000,
        position: "top-right",
        className: "w-96",
      });
    },
    2000,
    { leading: true, trailing: false }
  );

  const showThrottledConnectionStatus = throttle(
    (message: string, description?: string) => {
      toast.info(message, {
        description: description,
        duration: 3000,
      });
    },
    10000,
    { leading: true, trailing: false }
  );

  const showThrottledSuccess = throttle(
    (message: string, description?: string) => {
      toast.success(message, {
        description: description,
        duration: 3000,
      });
    },
    10000,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    // Only connect for authenticated users with Customer or VIP roles
    if (
      !isAuthenticated ||
      !accessToken ||
      !user?.roles?.some((role) => role === "Customer" || role === "VIP")
    ) {
      console.log(
        "[NotificationsHub] Skipping connection - user not authenticated or doesn't have Customer/VIP role:",
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

    // Get API URL from environment variables with fallback
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";
    const baseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    const hubUrl = `${baseUrl}/hubs/notifications`;

    console.log(`[NotificationsHub] Hub URL: ${hubUrl}`);
    console.log("[NotificationsHub] Attempting to connect to:", hubUrl);

    // Build the connection
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          console.log(
            "[NotificationsHub] Providing access token for authentication"
          );
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

    connectionRef.current = connection;

    // ===============================
    // SIGNALR EVENT LISTENERS
    // ===============================

    // 1. Handle unread count updates
    connection.on("UpdateUnreadCount", (count: number) => {
      console.log("[NotificationsHub] 📊 Unread count updated:", count);
      // Invalidate notifications query to trigger recalculation
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    // 2. Handle new notification received
    connection.on(
      "ReceiveNewNotification",
      (newNotification: NotificationDto) => {
        console.log(
          "[NotificationsHub] 🔔 New notification received:",
          newNotification
        );

        // --- EXISTING LOGIC: UPDATE CACHE ---
        // Optimistically add the new notification to the top of the list in the cache
        queryClient.setQueryData<InfiniteData<PagedResult<NotificationDto>>>(
          ["notifications"],
          (oldData) => {
            if (!oldData) return oldData;

            const firstPage = oldData.pages[0];
            if (!firstPage) return oldData;

            const updatedFirstPage = {
              ...firstPage,
              items: [newNotification, ...firstPage.items],
              totalRecords: firstPage.totalRecords + 1,
            };

            console.log(
              "[NotificationsHub] ✅ Added new notification to cache:",
              newNotification.id
            );

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          }
        );

        // --- SELECTIVE QUERY INVALIDATION BASED ON NOTIFICATION TYPE ---
        // Only invalidate specific queries based on notification content
        if (
          newNotification.type === NotificationType.GroupInvitation ||
          newNotification.contentPreview?.includes("lời mời") ||
          newNotification.contentPreview?.includes("mời bạn tham gia")
        ) {
          console.log(
            "[NotificationsHub] 🔄 Invalidating invitations queries for group invitation"
          );
          queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
        }

        if (
          newNotification.type === NotificationType.NewMessage ||
          newNotification.contentPreview?.includes("tin nhắn") ||
          newNotification.contentPreview?.includes("message")
        ) {
          console.log(
            "[NotificationsHub] 🔄 Invalidating conversations queries for new message"
          );
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }

        if (
          newNotification.type === NotificationType.VideoCallInvitation ||
          newNotification.contentPreview?.includes("cuộc gọi") ||
          newNotification.contentPreview?.includes("call")
        ) {
          console.log(
            "[NotificationsHub] 🔄 Invalidating call history queries"
          );
          queryClient.invalidateQueries({ queryKey: ["callHistory"] });
        }

        // Community/Group related notifications
        if (
          newNotification.type === NotificationType.UserAddedToGroup ||
          newNotification.type === NotificationType.NewPostInGroup ||
          newNotification.type === NotificationType.NewPostComment ||
          newNotification.type === NotificationType.PostLike ||
          newNotification.type === NotificationType.NewPoll ||
          newNotification.type === NotificationType.AdminPromotion ||
          newNotification.type === NotificationType.UserKickedFromGroup ||
          newNotification.type === NotificationType.PostRejected ||
          newNotification.contentPreview?.includes("cộng đồng") ||
          newNotification.contentPreview?.includes("nhóm") ||
          newNotification.contentPreview?.includes("bài viết") ||
          newNotification.contentPreview?.includes("community") ||
          newNotification.contentPreview?.includes("group") ||
          newNotification.contentPreview?.includes("post")
        ) {
          console.log(
            "[NotificationsHub] 🔄 Invalidating community-related queries"
          );

          // Invalidate community sidebar (my groups list)
          queryClient.invalidateQueries({ queryKey: ["myGroups"] });

          // Invalidate group details for all groups
          queryClient.invalidateQueries({ queryKey: ["groupDetails"] });

          // Invalidate group posts for all groups
          queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
        }

        // --- TRIGGER THE CUSTOM TOAST ---
        showThrottledNotification(newNotification);
        // -----------------------------------------
      }
    );

    // 3. Handle conversations refresh signal
    connection.on("ConversationsShouldRefresh", () => {
      console.log(
        "[NotificationsHub] 🔄 Conversations should refresh signal received"
      );
      console.log(
        `[NotificationsHub] 🔄 Signal received for group: User_${user?.id}`
      );

      // Invalidate all conversation-related queries to trigger refresh
      console.log(
        "[NotificationsHub] 🔄 Invalidating all conversation queries"
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Also invalidate call history queries as conversations might affect call history
      queryClient.invalidateQueries({ queryKey: ["callHistory"] });
    });

    // Test connection by trying to invoke a method (if available)
    console.log("[NotificationsHub] 🔍 Testing connection capabilities...");

    // ===============================
    // CONNECTION EVENT HANDLERS
    // ===============================

    connection.onclose((error: Error | undefined) => {
      if (error) {
        console.error(
          "[NotificationsHub] Connection closed with error:",
          error
        );
        toast.error("Mất kết nối thông báo thời gian thực", {
          description: "Thông báo tự động sẽ tạm thời không khả dụng",
        });
      } else {
        console.log("[NotificationsHub] Connection closed gracefully");
      }
    });

    connection.onreconnecting((error: Error | undefined) => {
      console.warn("[NotificationsHub] Reconnecting...", error);
      // showThrottledConnectionStatus(
      //   "Đang kết nối lại...",
      //   "Đang khôi phục kết nối thông báo thời gian thực"
      // );
    });

    connection.onreconnected((connectionId?: string) => {
      console.log(
        "[NotificationsHub] Reconnected successfully with ID:",
        connectionId
      );
      console.log(
        `[NotificationsHub] 👥 Automatically rejoined group: User_${user?.id}`
      );
      // showThrottledSuccess("Đã khôi phục kết nối thông báo thời gian thực");
    });

    // Start the connection
    connection
      .start()
      .then(() => {
        console.log("[NotificationsHub] ✅ Connected successfully");
        console.log(
          "[NotificationsHub] 🔗 Connection ID:",
          connection.connectionId
        );
        console.log("[NotificationsHub] 👤 User ID from auth:", user?.id);
        console.log("[NotificationsHub] 🎧 Event listeners registered:");
        console.log("  - UpdateUnreadCount");
        console.log("  - ReceiveNewNotification");
        console.log("  - ConversationsShouldRefresh");

        // The backend automatically adds this connection to User_{userId} group
        // in the OnConnectedAsync method, so no additional action needed here
        console.log(
          `[NotificationsHub] 👥 Automatically joined group: User_${user?.id}`
        );

        isConnectedRef.current = true;
        // showThrottledSuccess(
        //   "Đã kết nối thông báo thời gian thực",
        //   "Sẽ nhận thông báo tự động"
        // );
      })
      .catch((err) => {
        console.error("[NotificationsHub] ❌ Connection Error:", err);

        let errorMessage = "Không thể kết nối thông báo thời gian thực";
        let errorDescription = "Vui lòng kiểm tra kết nối mạng và thử lại";

        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();

          if (errorMsg.includes("unauthorized") || errorMsg.includes("401")) {
            errorMessage = "Lỗi xác thực thông báo thời gian thực";
            errorDescription = "Vui lòng đăng nhập lại";
          } else if (
            errorMsg.includes("network") ||
            errorMsg.includes("fetch")
          ) {
            errorMessage = "Lỗi kết nối mạng";
            errorDescription = "Kiểm tra kết nối internet của bạn";
          }
        }

        // toast.error(errorMessage, {
        //   description: errorDescription,
        //   duration: 5000,
        // });
      });

    // Cleanup function
    return () => {
      if (connectionRef.current) {
        console.log("[NotificationsHub] Cleaning up connection...");
        isConnectedRef.current = false;
        connectionRef.current
          .stop()
          .then(() => {
            console.log("[NotificationsHub] Connection stopped successfully");
          })
          .catch((err) => {
            console.error("[NotificationsHub] Error stopping connection:", err);
          });
      }
    };
  }, [
    accessToken,
    isAuthenticated,
    user?.roles,
    queryClient,
    showThrottledNotification,
    showThrottledConnectionStatus,
    showThrottledSuccess,
  ]);

  // Context value
  const contextValue: NotificationsHubContextType = {
    connection: connectionRef.current,
    isConnected: isConnectedRef.current,
  };

  return (
    <NotificationsHubContext.Provider value={contextValue}>
      {children}
    </NotificationsHubContext.Provider>
  );
}
