"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  CheckCheck,
  Bell,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { NotificationItem } from "./NotificationItem";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
} from "@/lib/api/customer/notifications";
import { NotificationDto } from "@/types/customer/notification";
import { handleApiError } from "@/lib/utils/errorUtils";
// NotificationList uses provider context instead of direct store access

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const queryClient = useQueryClient();
  // No need for direct store access - provider handles count updates

  // Fetch notifications with infinite scroll
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
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
    staleTime: 30000, // Cache for 30 seconds
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications - this will recalculate unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
    onError: (error) => {
      console.error("[NotificationList] Error marking all as read:", error);
      handleApiError(error, "Không thể đánh dấu tất cả thông báo là đã đọc");
    },
  });

  // Get all notifications from all pages
  const allNotifications = data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = allNotifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Show only first 5 notifications in the popover
  const displayedNotifications = allNotifications.slice(0, 5);
  const hasMoreNotifications = allNotifications.length > 5;

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllAsReadMutation.mutate();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="w-96 h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-96 h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
          <Bell className="h-8 w-8" />
          <p className="text-sm text-center">
            Không thể tải thông báo
            <br />
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["notifications"] })
              }
              className="p-0 h-auto text-blue-500 hover:text-blue-600"
            >
              Thử lại
            </Button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 max-h-[500px] flex flex-col">
      {/* Mark All as Read Button - Only show if there are unread notifications */}
      {unreadCount > 0 && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 justify-center"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}

      {/* Notification List */}
      <ScrollArea className="flex-1">
        {allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Bạn chưa có thông báo nào
            </p>
          </div>
        ) : (
          <div>
            {/* Display only first 5 notifications */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={onClose}
                />
              ))}
            </div>

            {/* View All Notifications Link */}
            {(hasMoreNotifications || allNotifications.length > 0) && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <Link
                  href="/notifications"
                  onClick={onClose}
                  className="block w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full h-12 justify-between text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-none font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Xem tất cả thông báo
                      {hasMoreNotifications && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          (+{allNotifications.length - 5} thông báo khác)
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
