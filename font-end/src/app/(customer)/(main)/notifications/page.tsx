"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/providers/NotificationProvider";
import { NotificationBell } from "@/components/features/notifications/NotificationBell";
import { NotificationItem } from "@/components/features/notifications/NotificationItem";
import { Loader2, Bell, Check, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
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

  const readCount = notifications.length - unreadCount;

  return (
    <div className="customer-bg-gradient min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500/10 via-blue-500/8 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-500/8 via-purple-500/5 to-pink-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent text-4xl font-bold">
                        Thông báo
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Quản lý và xem tất cả thông báo của bạn
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-blue-500">
                          {unreadCount}
                        </span>{" "}
                        chưa đọc
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-green-500">
                          {readCount}
                        </span>{" "}
                        đã đọc
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-purple-500">
                          {notifications.length}
                        </span>{" "}
                        tổng cộng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <NotificationBell />
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      onClick={markAllAsRead}
                      disabled={isMarkingAllAsRead}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isMarkingAllAsRead ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCheck className="h-4 w-4 mr-2" />
                      )}
                      Đánh dấu tất cả đã đọc
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group">
              <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Tổng thông báo
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {notifications.length}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bell className="h-7 w-7 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{
                        width: notifications.length > 0 ? "100%" : "0%",
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="group">
              <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 transform hover:scale-105 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Chưa đọc
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-red-500">
                          {unreadCount}
                        </p>
                        {unreadCount > 0 && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-3 h-3 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Badge
                        variant="destructive"
                        className="text-lg px-3 py-2 animate-pulse"
                      >
                        {unreadCount}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          notifications.length > 0
                            ? `${(unreadCount / notifications.length) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="group">
              <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-105 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Đã đọc
                      </p>
                      <p className="text-3xl font-bold text-green-500">
                        {readCount}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-7 w-7 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          notifications.length > 0
                            ? `${(readCount / notifications.length) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Notifications List */}
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    Tất cả thông báo
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Danh sách tất cả thông báo của bạn, sắp xếp theo thời gian
                    mới nhất
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/20 dark:bg-gray-800/20 px-4 py-2 rounded-full">
                    Hiển thị {notifications.length} thông báo
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                        style={{
                          animationDirection: "reverse",
                          animationDuration: "1.5s",
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      Đang tải thông báo...
                    </span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <Bell className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                      Chưa có thông báo nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Bạn sẽ nhận được thông báo khi có hoạt động mới từ nhóm,
                      tin nhắn hoặc hệ thống
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/10 dark:divide-gray-700/30">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-2">
                      <NotificationItem 
                        notification={notification}
                      />
                    </div>
                  ))}

                  {/* Load More Section */}
                  {hasNextPage && (
                    <div className="p-8 text-center bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                      <Button
                        onClick={fetchNextPage}
                        disabled={isFetchingNextPage}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Đang tải thêm...</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span>Tải thêm thông báo</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
