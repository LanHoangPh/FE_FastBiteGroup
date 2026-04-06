// components/shared/NotificationDropdown.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/admin/notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NotificationItem } from "./NotificationItem";
import { Bell, Check, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Enhanced loading skeleton for notifications
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg">
      <Skeleton className="h-5 w-5 rounded-full mt-0.5 bg-muted/60" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-full bg-muted/60" />
        <Skeleton className="h-3 w-3/4 bg-muted/40" />
        <Skeleton className="h-3 w-1/2 bg-muted/30" />
      </div>
      <Skeleton className="h-2 w-2 rounded-full mt-2 bg-primary/40" />
    </div>
  );
}

// Enhanced error display
function ErrorDisplay({ error }: { error: Error | unknown }) {
  return (
    <div className="p-6 text-center space-y-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full blur-xl transform scale-150" />
        <AlertCircle className="relative h-10 w-10 text-destructive/70 mx-auto" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-destructive">
          Không thể tải thông báo
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định"}
        </p>
      </div>
    </div>
  );
}

// Enhanced empty state
function EmptyState() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 rounded-full blur-2xl transform scale-150" />
        <Bell className="relative h-12 w-12 text-muted-foreground/60 mx-auto" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Không có thông báo mới
        </p>
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          Bạn sẽ nhận được thông báo khi có hoạt động mới
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications-dropdown"],
    queryFn: async () => {
      const response = await getRecentNotifications(1, 10);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch notifications");
      }
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
    },
    onError: (error: any) => {
      toast.error("Không thể đánh dấu thông báo đã đọc", {
        description:
          error?.response?.data?.message || "Đã xảy ra lỗi không xác định",
      });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
    onError: (error: any) => {
      toast.error("Không thể đánh dấu tất cả thông báo", {
        description:
          error?.response?.data?.message || "Đã xảy ra lỗi không xác định",
      });
    },
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Calculate unread count
  const unreadCount =
    data?.items?.filter((notification) => !notification.isRead).length || 0;
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-accent hover:text-accent-foreground transition-colors duration-200 border-border/60 bg-background/80 backdrop-blur-sm"
        >
          <Bell className="h-5 w-5" />

          {/* Enhanced unread notification indicator */}
          {hasUnreadNotifications && (
            <>
              {/* Animated ping effect */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-sm"></span>
              </span>

              {/* Count badge for multiple notifications */}
              {unreadCount > 1 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-primary text-primary-foreground border-0"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </>
          )}

          <span className="sr-only">
            Thông báo {hasUnreadNotifications && `(${unreadCount} chưa đọc)`}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 shadow-xl border-border/50 bg-card/95 backdrop-blur-sm"
        align="end"
        sideOffset={8}
      >
        {/* Enhanced Header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-chart-1/5" />
          <div className="relative flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-foreground" />
                {hasUnreadNotifications && (
                  <Zap className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Thông báo
                </h3>
                {hasUnreadNotifications && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} thông báo chưa đọc
                  </p>
                )}
              </div>
            </div>

            {hasUnreadNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="h-8 bg-background/50 hover:bg-background/80 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                {markAllAsReadMutation.isPending
                  ? "Đang xử lý..."
                  : "Đánh dấu tất cả"}
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/20">
          {isLoading && (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          )}

          {error && <ErrorDisplay error={error} />}

          {data && data.items.length === 0 && <EmptyState />}

          {data && data.items.length > 0 && (
            <div className="p-2 space-y-1">
              {data.items.map((notification, index) => (
                <div
                  key={notification.id}
                  className="relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        {data && data.items.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-muted/10 to-transparent" />
            <div className="relative p-3 border-t border-border/50">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-accent/50 group transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/admin/notifications">
                  <span className="text-sm font-medium">
                    Xem tất cả thông báo
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </Button>

              {data.totalRecords > 10 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  và {data.totalRecords - 10} thông báo khác
                </p>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
