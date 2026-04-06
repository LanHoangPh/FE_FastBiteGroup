"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";
import { UserStatusChangedDto } from "@/types/customer/realtime";
import { UserPresenceStatus } from "@/types/customer/models";

interface PresenceContextType {
  // Connection state
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  
  // Online users data
  onlineUserIds: string[];
  allUserStatuses: Record<string, UserPresenceStatus>;
  
  // Actions
  changeMyStatus: (status: UserPresenceStatus) => Promise<void>;
  
  // Helper functions
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => UserPresenceStatus;
  getOnlineUsersCount: () => number;
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const { statuses, updateUserStatus } = usePresenceStore();

  // Add a ref to track if we've already set the initial status
  const hasSetInitialStatus = useRef(false);

  useEffect(() => {
    if (accessToken) {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/presence`, {
          accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);

      newConnection
        .start()
        .then(() => {
          console.log("[PresenceHub] Connected successfully");
          setIsConnected(true);
          
          // Set default status to Online when user logs in
          const currentUser = useAuthStore.getState().user;
          if (currentUser && !hasSetInitialStatus.current) {
            console.log("[PresenceHub] Setting initial status to Online");
            updateUserStatus(currentUser.id, UserPresenceStatus.Online);
            // Also notify the server about the online status
            newConnection
              .invoke("ChangeMyStatus", UserPresenceStatus.Online)
              .then(() => {
                console.log("[PresenceHub] Initial status set successfully");
                hasSetInitialStatus.current = true;
              })
              .catch((err) => {
                console.error("[PresenceHub] Failed to set initial status:", err);
              });
          }
        })
        .catch((err) => {
          console.error("[PresenceHub] Connection Error: ", err);
          setIsConnected(false);
        });

      newConnection.on("UserStatusChanged", (data: UserStatusChangedDto) => {
        console.log("[PresenceHub] ✅ UserStatusChanged:", {
          userId: data.userId,
          status: data.presenceStatus,
          timestamp: new Date().toISOString(),
          isCurrentUser: data.userId === useAuthStore.getState().user?.id
        });
        updateUserStatus(data.userId, data.presenceStatus);
      });

      // Listen for user disconnection events (if backend sends them)
      newConnection.on("UserDisconnected", (userId: string) => {
        console.log("[PresenceHub] 🔴 UserDisconnected:", {
          userId,
          timestamp: new Date().toISOString()
        });
        updateUserStatus(userId, UserPresenceStatus.Offline);
      });

      // Listen for user connection events (if backend sends them)
      newConnection.on("UserConnected", (userId: string) => {
        console.log("[PresenceHub] 🟢 UserConnected:", {
          userId,
          timestamp: new Date().toISOString()
        });
        updateUserStatus(userId, UserPresenceStatus.Online);
      });

      // Add debugging for all SignalR events (optional)
      newConnection.on("ReceiveMessage", (message) => {
        console.log("[PresenceHub] 📨 Received message:", message);
      });

      // Add connection state change logging
      newConnection.onclose((error) => {
        console.log("[PresenceHub] Connection closed:", error);
        setIsConnected(false);
      });

      newConnection.onreconnecting((error) => {
        console.log("[PresenceHub] Reconnecting:", error);
        setIsConnected(false);
      });

      newConnection.onreconnected((connectionId) => {
        console.log("[PresenceHub] Reconnected:", connectionId);
        setIsConnected(true);
        
        // Re-set online status after reconnection
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          newConnection
            .invoke("ChangeMyStatus", UserPresenceStatus.Online)
            .then(() => {
              console.log("[PresenceHub] Status restored after reconnection");
              // Update local state
              updateUserStatus(currentUser.id, UserPresenceStatus.Online);
            })
            .catch((err) => {
              console.error("[PresenceHub] Failed to restore status after reconnection:", err);
            });
        }
      });

      return () => {
        console.log("[PresenceHub] Cleaning up connection...");
        
        // Set user to offline when disconnecting
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          console.log("[PresenceHub] Setting current user offline:", currentUser.id);
          updateUserStatus(currentUser.id, UserPresenceStatus.Offline);
          
          // Notify server about going offline (if still connected)
          if (newConnection.state === signalR.HubConnectionState.Connected) {
            console.log("[PresenceHub] Notifying server about offline status");
            newConnection
              .invoke("ChangeMyStatus", UserPresenceStatus.Offline)
              .then(() => {
                console.log("[PresenceHub] Successfully notified server about offline status");
              })
              .catch((err) => {
                console.warn("[PresenceHub] Failed to set offline status:", err);
              });
          } else {
            console.log("[PresenceHub] Connection not available for offline notification, state:", newConnection.state);
          }
        }

        // Only stop if connection is not already stopped
        if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
          newConnection.stop().then(() => {
            console.log("[PresenceHub] Connection stopped successfully");
            setIsConnected(false);
          }).catch((error) => {
            console.warn("[PresenceHub] Error stopping connection:", error);
            setIsConnected(false);
          });
        }
      };
    } else {
      // Clean up connection when user logs out
      if (connection) {
        console.log("[PresenceHub] User logged out - cleaning up connection");
        setIsConnected(false);
        setConnection(null);
      }
    }
  }, [accessToken, isAuthenticated, updateUserStatus]);

  // Cleanup on unmount - this is the CRITICAL part for automatic disconnection
  useEffect(() => {
    return () => {
      if (
        connection &&
        connection.state !== signalR.HubConnectionState.Disconnected
      ) {
        console.log("[PresenceHub] Component unmounting - stopping connection");
        
        // Set offline status before disconnecting
        const currentUser = useAuthStore.getState().user;
        if (currentUser && connection.state === signalR.HubConnectionState.Connected) {
          console.log("[PresenceHub] Unmount: Setting offline status before disconnect");
          connection
            .invoke("ChangeMyStatus", UserPresenceStatus.Offline)
            .then(() => {
              console.log("[PresenceHub] Unmount: Successfully set offline status");
            })
            .catch((err) => {
              console.warn("[PresenceHub] Unmount: Failed to set offline status:", err);
            })
            .finally(() => {
              connection.stop().catch((error) => {
                console.warn("[PresenceHub] Error stopping connection on unmount:", error);
              });
            });
        } else {
          console.log("[PresenceHub] Unmount: Stopping connection without offline notification, state:", connection.state);
          connection.stop().catch((error) => {
            console.warn("[PresenceHub] Error stopping connection on unmount:", error);
          });
        }
        
        setIsConnected(false);
      }
    };
  }, [connection]);

  // Memoized computed values for better performance
  const onlineUserIds = useMemo(() => {
    return Object.entries(statuses)
      .filter(([_, status]) => status === UserPresenceStatus.Online)
      .map(([userId, _]) => userId);
  }, [statuses]);

  // Helper functions
  const isUserOnline = (userId: string): boolean => {
    return statuses[userId] === UserPresenceStatus.Online;
  };

  const getUserStatus = (userId: string): UserPresenceStatus => {
    return statuses[userId] || UserPresenceStatus.Offline;
  };

  const getOnlineUsersCount = (): number => {
    return onlineUserIds.length;
  };

  const changeMyStatus = async (status: UserPresenceStatus) => {
    if (!connection) {
      console.warn("[PresenceHub] Connection not initialized");
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(
        `[PresenceHub] Connection not connected. Current state: ${connection.state}`
      );
      return;
    }

    // Log when Busy status is being set to help with debugging
    if (status === UserPresenceStatus.Busy) {
      console.log("[PresenceHub] Busy status change requested", {
        stack: new Error().stack,
        hasSetInitialStatus: hasSetInitialStatus.current,
        timestamp: new Date().toISOString()
      });
    }

    // Prevent automatic status changes to Busy immediately after connection
    if (status === UserPresenceStatus.Busy && !hasSetInitialStatus.current) {
      console.warn("[PresenceHub] Ignoring automatic Busy status change during initial connection");
      return;
    }

    try {
      console.log("[PresenceHub] Changing status to:", status);
      await connection.invoke("ChangeMyStatus", status);
      console.log("[PresenceHub] Status changed successfully");
      
      // Update local state immediately for better UX
      if (user) {
        console.log("[PresenceHub] Updating local status immediately:", {
          userId: user.id,
          status,
          timestamp: new Date().toISOString()
        });
        updateUserStatus(user.id, status);
        
        // Mark that we've successfully set a status after initial connection
        if (!hasSetInitialStatus.current) {
          hasSetInitialStatus.current = true;
        }
      }
    } catch (err) {
      console.error("[PresenceHub] Failed to invoke ChangeMyStatus:", err);
      console.error("[PresenceHub] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        connectionState: connection.state,
      });
    }
  };

  // Context value with all the data and functions components need
  const contextValue: PresenceContextType = {
    // Connection state
    connection,
    isConnected,
    
    // Online users data
    onlineUserIds,
    allUserStatuses: statuses,
    
    // Actions
    changeMyStatus,
    
    // Helper functions
    isUserOnline,
    getUserStatus,
    getOnlineUsersCount,
  };

  return (
    <PresenceContext.Provider value={contextValue}>
      {children}
    </PresenceContext.Provider>
  );
};

/**
 * Custom hook for easy access to presence data and functions.
 * Must be used within a PresenceProvider.
 * 
 * @returns PresenceContextType with all presence data and helper functions
 */
export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};

/**
 * Convenience hook to check if a specific user is online.
 * 
 * @param userId - The ID of the user to check
 * @returns boolean indicating if the user is online
 */
export const useIsUserOnline = (userId: string): boolean => {
  const { isUserOnline } = usePresence();
  return isUserOnline(userId);
};

/**
 * Convenience hook to get a user's current status.
 * 
 * @param userId - The ID of the user
 * @returns UserPresenceStatus of the user (defaults to Offline if not found)
 */
export const useUserStatus = (userId: string): UserPresenceStatus => {
  const { getUserStatus } = usePresence();
  return getUserStatus(userId);
};

/**
 * Convenience hook to get the list of online user IDs.
 * 
 * @returns Array of user IDs who are currently online
 */
export const useOnlineUsers = (): string[] => {
  const { onlineUserIds } = usePresence();
  return onlineUserIds;
};
