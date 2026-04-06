"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
// NotificationProvider manages its own state without external store
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/customer/notifications";
import { NotificationDto } from "@/types/customer/notification";
import { PagedResult } from "@/types/api.types";
import { handleApiError } from "@/lib/utils/errorUtils";

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
}

// ===============================
// NOTIFICATION PROVIDER
// ===============================

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // ===============================
  // TANSTACK QUERY SETUP
  // ===============================

  // Infinite query for notifications
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam = 1 }) =>
        getMyNotifications({ pageParam, pageSize: 10 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pageNumber < lastPage.totalPages) {
          return lastPage.pageNumber + 1;
        }
        return undefined;
      },
      enabled: isAuthenticated && !!accessToken,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Optimistically update the notification in the cache
      queryClient.setQueryData<InfiniteData<PagedResult<NotificationDto>>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) =>
                notification.id === notificationId
                  ? { ...notification, isRead: true }
                  : notification
              ),
            })),
          };
        }
      );

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      toast.success("Đã đánh dấu thông báo là đã đọc");
    },
    onError: (error) => {
      handleApiError(error, "Không thể đánh dấu thông báo");
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Optimistically update all notifications in the cache
      queryClient.setQueryData<InfiniteData<PagedResult<NotificationDto>>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        }
      );

      // Reset unread count
      setUnreadCount(0);

      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
    onError: (error) => {
      handleApiError(error, "Không thể đánh dấu tất cả thông báo");
    },
  });

  // ===============================
  // COMPUTE NOTIFICATIONS
  // ===============================

  // Flatten all notifications from all pages
  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  // ===============================
  // INITIALIZE UNREAD COUNT
  // ===============================

  // Calculate and set unread count from fetched notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const calculatedUnreadCount = notifications.filter(
        (notification) => !notification.isRead
      ).length;

      // Only update if the count has changed to avoid unnecessary re-renders
      if (calculatedUnreadCount !== unreadCount) {
        setUnreadCount(calculatedUnreadCount);
      }
    }
  }, [notifications, unreadCount, setUnreadCount]);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const value: NotificationContextType = {
    notifications,
    unreadCount, // From Zustand store (calculated from fetched notifications)
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ===============================
// USE NOTIFICATIONS HOOK
// ===============================

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
