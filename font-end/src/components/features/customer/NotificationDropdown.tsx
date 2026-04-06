"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/providers/NotificationProvider";
import { NotificationDTO } from "@/types/customer/notification.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// ===============================
// NOTIFICATION ITEM COMPONENT
// ===============================

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead: boolean;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to the link if provided
    if (notification.linkTo) {
      window.location.href = notification.linkTo;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NewMessage":
        return "💬";
      case "GroupInvitation":
        return "👥";
      case "GroupUpdate":
        return "📝";
      case "UserMention":
        return "👤";
      case "SystemAnnouncement":
        return "📢";
      case "FriendRequest":
        return "👋";
      case "FriendAccepted":
        return "✅";
      case "GroupRoleChanged":
        return "🔑";
      case "MessageReaction":
        return "❤️";
      case "FileShared":
        return "📎";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`group relative p-4 transition-all duration-300 cursor-pointer border-l-4 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 ${
        !notification.isRead
          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/5 border-blue-500 hover:border-blue-600"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Enhanced Icon */}
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md transition-all duration-300 group-hover:scale-110 ${
              !notification.isRead
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/25"
                : "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/25"
            }`}
          >
            <span className="filter drop-shadow-sm">
              {getNotificationIcon(notification.notificationType)}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Enhanced Title */}
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-medium leading-tight ${
                    !notification.isRead
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="relative">
                    <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Enhanced Message */}
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {notification.message}
              </p>

              {/* Enhanced Metadata */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
                {notification.triggeredByUserName && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="font-medium">
                      bởi {notification.triggeredByUserName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Mark as Read Button */}
            {!notification.isRead && (
              <div className="flex-shrink-0 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  disabled={isMarkingAsRead}
                >
                  {isMarkingAsRead ? (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  ) : (
                    <Check className="h-3 w-3 text-blue-500" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/20 rounded-lg transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}

// ===============================
// NOTIFICATION DROPDOWN COMPONENT
// ===============================

interface NotificationDropdownProps {
  variant?: "sidebar" | "header";
}

export function NotificationDropdown({
  variant = "header",
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {variant === "sidebar" ? (
          <div className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-white/80 dark:text-slate-400 hover:text-white dark:hover:text-white hover:from-blue-500/20 hover:to-purple-500/20 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <Bell className="h-5 w-5 transition-transform duration-300 group-hover:animate-pulse" />
            {unreadCount > 0 && (
              <>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse z-10 shadow-lg border-2 border-white dark:border-gray-800">
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="group relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Bell className="h-5 w-5 transition-transform duration-300 group-hover:animate-pulse" />
            {unreadCount > 0 && (
              <>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse z-10 shadow-lg border border-white dark:border-gray-800">
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-2xl overflow-hidden"
        align={variant === "sidebar" ? "start" : "end"}
        side={variant === "sidebar" ? "right" : "bottom"}
      >
        {/* Enhanced Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b border-white/10 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Thông báo
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-blue-500">
                      {unreadCount}
                    </span>{" "}
                    chưa đọc
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-8 px-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Đánh dấu tất cả
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Đang tải thông báo...
                </span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Chưa có thông báo nào
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bạn sẽ nhận được thông báo khi có hoạt động mới
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10 dark:divide-gray-700/30">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  isMarkingAsRead={isMarkingAsRead}
                />
              ))}

              {hasNextPage && (
                <div className="p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <Button
                    variant="ghost"
                    className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                          <span className="text-blue-600 dark:text-blue-400">
                            Đang tải thêm...
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          Tải thêm thông báo
                        </span>
                        <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200">
                          →
                        </div>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
