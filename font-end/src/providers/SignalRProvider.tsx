"use client";

import { useEffect, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { throttle } from "lodash-es";
import { PagedResult } from "@/types/api.types";
import {
  AdminNotificationDto,
  RealtimeNotificationPayload,
} from "@/types/admin/notification.types";

// Define the missing type
interface BulkActionCompletedPayload {
  message: string;
}
// OneSignal is now used directly for web push; local push provider removed
import { notificationPolling } from "@/lib/notification-polling";
import { Button } from "@/components/ui/button";

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Create a ref to hold the connection object to prevent race conditions in Strict Mode
  const connectionRef = useRef<HubConnection | null>(null);

  // Create throttled toast functions to prevent notification spam
  // Regular notifications: Allow one every 2 seconds - Blue color (Info)
  const showThrottledNotification = throttle(
    (title: string, message: string, duration?: number) => {
      toast.info(title, {
        description: message,
        duration: duration || 5000,
      });
    },
    2000,
    { leading: true, trailing: false }
  );

  // Critical notifications: Allow one every 5 seconds - Yellow color (Warning)
  const showThrottledCriticalNotification = throttle(
    (title: string, message: string, duration?: number) => {
      toast.warning(title, {
        description: message,
        duration: duration || 10000,
      });
    },
    5000,
    { leading: true, trailing: false }
  );

  // Connection status notifications: Allow one every 10 seconds - Blue color (Info)
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

  // Success notifications: Allow one every 10 seconds - Green color (Success)
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
    // Add a guard clause: If a connection is already established or in progress, do nothing
    if (connectionRef.current) {
      console.log(
        "[SignalR] Connection already exists, skipping initialization"
      );
      return;
    }

    let isComponentMounted = true;
    let connectionAttemptInProgress = false;

    // Only attempt connection for authenticated admin users
    if (!isAuthenticated || !accessToken || !user?.roles?.includes("Admin")) {
      console.log(
        "[SignalR] Skipping connection - user not authenticated admin:",
        {
          isAuthenticated,
          hasToken: !!accessToken,
          isAdmin: user?.roles?.includes("Admin"),
        }
      );
      return;
    }

    // Temporarily disable SignalR for development if backend is not running

    const connectToHub = async () => {
      // Prevent multiple simultaneous connection attempts
      if (connectionAttemptInProgress) {
        console.log(
          "[SignalR] Connection attempt already in progress, skipping"
        );
        return;
      }

      connectionAttemptInProgress = true;

      try {
        // Get API URL from environment variables with fallback
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";

        // Ensure the URL doesn't have a trailing slash before adding the hub path
        const baseUrl = apiBaseUrl.endsWith("/")
          ? apiBaseUrl.slice(0, -1)
          : apiBaseUrl;
        const hubUrl = `${baseUrl}/hubs/admin`;

        // Log the connection URL for debugging
        console.log(`[SignalR] Hub URL: ${hubUrl}`);
        console.log("[SignalR] Attempting to connect to:", hubUrl);

        // 1. Build the connection with enhanced configuration
        let connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            // 2. Provide the JWT token for authentication
            accessTokenFactory: () => {
              console.log(
                "[SignalR] Providing access token for authentication"
              );
              return accessToken;
            },
            // 3. Add additional options for better compatibility
            //skipNegotiation: true, // Skip negotiation for WebSockets
            withCredentials: true, // Include credentials like cookies, authorization headers
            transport: HttpTransportType.WebSockets,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              // Improved exponential backoff with more attempts
              const retryCount = retryContext.previousRetryCount;
              // First retry immediately, then gradually increase delay
              if (retryCount === 0) return 0;
              if (retryCount === 1) return 2000;
              if (retryCount === 2) return 5000;
              if (retryCount === 3) return 10000;
              if (retryCount === 4) return 15000;
              if (retryCount <= 10) return 30000; // Up to 10 retries with 30s delay
              return null; // Stop retrying after 10 attempts
            },
          })
          .configureLogging("Information") // Enable detailed logging for debugging
          .build();

        // Store the created connection in the ref
        connectionRef.current = connection;

        // 4. Add connection event handlers
        connection.onclose((error: Error | undefined) => {
          if (error) {
            console.error("[SignalR] Connection closed with error:", error);
            // Red color (Destructive) for connection errors
            toast.error("Mất kết nối thời gian thực", {
              description: "Thông báo tự động sẽ tạm thời không khả dụng",
            });
          } else {
            console.log("[SignalR] Connection closed gracefully");
          }
        });

        connection.onreconnecting((error: Error | undefined) => {
          console.warn("[SignalR] Reconnecting...", error);
          showThrottledConnectionStatus(
            "Đang kết nối lại...",
            "Đang khôi phục kết nối thời gian thực"
          );
        });

        connection.onreconnected((connectionId?: string) => {
          console.log(
            "[SignalR] Reconnected successfully with ID:",
            connectionId
          );
          // Green color (Success) for successful reconnection
          showThrottledSuccess("Đã khôi phục kết nối thời gian thực");
        });

        // 5. Start the connection with fallback mechanism
        try {
          console.log(
            "[SignalR] Attempting to start connection with WebSockets..."
          );
          await connection.start();
        } catch (startError) {
          console.error("[SignalR] WebSocket connection failed:", startError);

          // If component unmounted during connection attempt, don't proceed
          if (!isComponentMounted) {
            console.log(
              "[SignalR] Component unmounted during connection, closing..."
            );
            await connection.stop();
            return;
          }

          // Try again with different transport options
          console.log("[SignalR] Retrying with fallback transport options...");

          // Create a new connection with different options
          const fallbackConnection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
              accessTokenFactory: () => accessToken,
              skipNegotiation: false, // Enable negotiation for fallback
              withCredentials: true,
              transport:
                HttpTransportType.WebSockets |
                HttpTransportType.ServerSentEvents, // Ưu tiên WebSocket hoặc SSE
              // Let SignalR choose the best available transport
            })
            .withAutomaticReconnect({
              nextRetryDelayInMilliseconds: (retryContext) => {
                const retryCount = retryContext.previousRetryCount;
                if (retryCount === 0) return 0;
                if (retryCount === 1) return 2000;
                if (retryCount === 2) return 5000;
                if (retryCount <= 10) return 10000;
                return null;
              },
            })
            .configureLogging("Information")
            .build();

          // Copy event handlers to the new connection
          fallbackConnection.onclose = connection.onclose;
          fallbackConnection.onreconnecting = connection.onreconnecting;
          fallbackConnection.onreconnected = connection.onreconnected;

          // Try to start with the fallback connection
          await fallbackConnection.start();

          // If successful, replace the connection reference
          connectionRef.current = fallbackConnection;
          connection = fallbackConnection;
        }

        if (!isComponentMounted) {
          console.log(
            "[SignalR] Component unmounted during connection, closing..."
          );
          await connection.stop();
          return;
        }

        console.log("[SignalR] Successfully connected to AdminHub");
        // Green color (Success) for successful connection
        showThrottledSuccess(
          "Đã kết nối thời gian thực",
          "Sẽ nhận thông báo tự động"
        );

        // 6. Listen for the "NewAdminNotification" event
        connection.on(
          "NewAdminNotification",
          async (
            payload: RealtimeNotificationPayload & { isCritical?: boolean }
          ) => {
            console.log("New notification received:", payload);

            // Determine if this is a critical alert
            const isCritical =
              payload.isCritical ||
              payload.message.toLowerCase().includes("critical") ||
              payload.message.toLowerCase().includes("emergency") ||
              payload.message.toLowerCase().includes("urgent");

            // Show throttled toast notification to prevent spam
            if (isCritical) {
              // Yellow color (Warning) for critical notifications
              showThrottledCriticalNotification(
                "🚨 Cảnh báo quan trọng!",
                payload.message,
                10000
              );
            } else {
              // Blue color (Info) for regular notifications
              showThrottledNotification(
                "Thông báo mới!",
                payload.message,
                5000
              );
            }

            // Web push delivery is handled by OneSignal backend integration

            // Update the TanStack Query cache
            queryClient.setQueryData<PagedResult<AdminNotificationDto>>(
              ["notifications-dropdown"],
              (oldData) => {
                if (!oldData) return oldData;

                // Create a full DTO from the partial payload
                const newNotification: AdminNotificationDto = {
                  ...payload,
                  isRead: false,
                  notificationType: "GeneralAnnouncement", // Default type for realtime notifications
                  triggeredByUserId: undefined,
                  triggeredByUserName: undefined,
                };

                // Add the new notification to the top of the list
                const updatedItems = [newNotification, ...oldData.items];

                return {
                  ...oldData,
                  items: updatedItems,
                  totalRecords: oldData.totalRecords + 1,
                };
              }
            );

            // Also invalidate the query to ensure UI consistency
            queryClient.invalidateQueries({
              queryKey: ["notifications-dropdown"],
            });
            queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
          }
        );

        // 7. Listen for the "BulkActionCompleted" event
        connection.on(
          "BulkActionCompleted",
          (payload: BulkActionCompletedPayload) => {
            console.log("Bulk action completed event received:", payload);

            // 1. Show the final, detailed success toast from the backend
            toast.success("Hành động hàng loạt hoàn tất", {
              description: payload.message,
              duration: 5000, // Show for a bit longer
            });

            // 2. Invalidate all relevant list queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
          }
        );

        // 8. Listen for the "ExportCompleted" event
        connection.on(
          "ExportCompleted",
          (payload: { message: string; url: string }) => {
            console.log("Export completed event received:", payload);

            // Show success toast with download link
            toast.success(payload.message, {
              action: (
                <a
                  href={payload.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm">Tải xuống</Button>
                </a>
              ),
              duration: 10000, // Show longer so user has time to click
            });
          }
        );

        // 9. Listen for the "ExportFailed" event
        connection.on("ExportFailed", (payload: { message: string }) => {
          console.log("Export failed event received:", payload);

          // Show error toast
          toast.error("Xuất dữ liệu thất bại", {
            description: payload.message,
            duration: 8000,
          });
        });
      } catch (error) {
        console.error("[SignalR] Connection failed:", error);

        let errorMessage = "Không thể kết nối thời gian thực";
        let errorDescription = "Vui lòng kiểm tra kết nối mạng và thử lại";
        let retryInterval = 30000; // Default retry interval: 30 seconds

        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();

          // More detailed error diagnostics
          if (errorMsg.includes("websocket") || errorMsg.includes("aborted")) {
            errorDescription =
              "Lỗi WebSocket - có thể do proxy hoặc firewall chặn";
            retryInterval = 45000; // Longer retry for network issues
          } else if (errorMsg.includes("serversentevents")) {
            errorDescription =
              "Lỗi Server-Sent Events - có thể do kết nối bị từ chối";
            retryInterval = 45000;
          } else if (
            errorMsg.includes("401") ||
            errorMsg.includes("unauthorized") ||
            errorMsg.includes("authentication")
          ) {
            errorDescription = "Lỗi xác thực - vui lòng đăng nhập lại";
            // Don't retry on auth errors - user needs to log in again
            retryInterval = 0;
          } else if (
            errorMsg.includes("404") ||
            errorMsg.includes("not found")
          ) {
            errorDescription = "Endpoint SignalR không tồn tại trên server";
            // Shorter retry for potential temporary server issues
            retryInterval = 60000;
          } else if (
            errorMsg.includes("cors") ||
            errorMsg.includes("cross-origin")
          ) {
            errorDescription = "Lỗi CORS - vui lòng kiểm tra cấu hình server";
            // Don't retry on CORS errors - needs server config fix
            retryInterval = 0;
          } else if (
            errorMsg.includes("timeout") ||
            errorMsg.includes("timed out")
          ) {
            errorDescription =
              "Kết nối bị timeout - server có thể đang quá tải";
            retryInterval = 60000;
          } else if (
            errorMsg.includes("network") ||
            errorMsg.includes("offline")
          ) {
            errorDescription =
              "Lỗi kết nối mạng - vui lòng kiểm tra kết nối internet";
            // Check network status more frequently
            retryInterval = 15000;
          }
        }

        // Show error toast with appropriate message - Red color (Destructive)
        toast.error(errorMessage, {
          description: errorDescription,
          duration: 10000, // Show longer for errors
        });

        // Start polling fallback if appropriate
        if (retryInterval > 0) {
          console.log(
            `[SignalR] Starting polling fallback due to connection failure (interval: ${retryInterval}ms)`
          );
          notificationPolling.startPolling(queryClient, retryInterval);
        } else {
          console.log(
            "[SignalR] Not starting polling fallback due to critical error"
          );
        }

        // Reset the ref on failure so a retry can be attempted on next render
        connectionRef.current = null;

        // Attempt to reconnect after a delay if not a critical error
        if (
          retryInterval > 0 &&
          isComponentMounted &&
          !connectionAttemptInProgress
        ) {
          console.log(
            `[SignalR] Will attempt reconnection in ${Math.floor(
              retryInterval / 1000
            )} seconds`
          );
          setTimeout(() => {
            if (isComponentMounted && !connectionRef.current) {
              console.log("[SignalR] Attempting reconnection after error...");
              connectToHub();
            }
          }, retryInterval);
        }
      } finally {
        connectionAttemptInProgress = false;
      }
    };

    // Start the connection with a small delay to prevent rapid reconnection attempts
    const timeoutId = setTimeout(() => {
      connectToHub();
    }, 100);

    // 7. Cleanup: Ensure the connection is closed when the component unmounts
    return () => {
      isComponentMounted = false;
      connectionAttemptInProgress = false;
      clearTimeout(timeoutId);

      if (connectionRef.current) {
        console.log("[SignalR] Disconnecting from AdminHub...");
        connectionRef.current.stop().catch((error: Error) => {
          console.error("[SignalR] Error during disconnect:", error);
        });
        connectionRef.current = null; // Clear the ref on unmount
      }
      // Stop polling fallback
      notificationPolling.stopPolling();
    };
  }, [isAuthenticated, accessToken, user, queryClient]);

  return <>{children}</>;
}
