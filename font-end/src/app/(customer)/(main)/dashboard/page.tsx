"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { useMyPresence } from "@/hooks/useUserPresence";
import { UserPresenceStatus } from "@/types/customer/models";
import { RealTimeClock } from "@/components/ui/RealTimeClock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Users,
  Compass,
  Bell,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Calendar,
  Globe,
  Send,
  UserPlus,
  Plus,
  Search,
  Coffee,
  Smile,
} from "lucide-react";
import { getMyConversations } from "@/lib/api/customer/conversations";
import { getDashboardStats } from "@/lib/api/customer/me";
import { ConversationListItemDTO } from "@/types/customer/user.types";
import { UserDashboardStatsDto } from "@/types/customer/user.types";
import { formatUtcToIctRelative } from "@/lib/utils/dateUtils";

export default function UserDashboard() {
  const router = useRouter();
  const { changeMyStatus } = useMyPresence();
  const [recentConversations, setRecentConversations] = useState<
    ConversationListItemDTO[]
  >([]);
  const [dashboardStats, setDashboardStats] =
    useState<UserDashboardStatsDto | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real conversation data
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await getMyConversations({
          pageParam: 1,
          pageSize: 3, // Only fetch 3 conversations
        });
        setRecentConversations(response.items.slice(0, 3)); // Ensure we only show max 3
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getDashboardStats();
        setDashboardStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const quickActions = [
    {
      title: "Tin nhắn mới",
      icon: Send,
      color: "from-blue-500 to-cyan-500",
      action: "Gửi tin nhắn cho ai đó",
      onClick: () => router.push("/chat"),
    },
    {
      title: "Tạo nhóm",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      action: "Tạo nhóm cộng đồng mới",
      onClick: () => router.push("/communities"),
    },
    {
      title: "Tìm bạn bè",
      icon: Search,
      color: "from-purple-500 to-pink-500",
      action: "Kết nối với người mới",
      onClick: () => router.push("/chat"),
    },
  ];

  const todayStats = [
    {
      label: "Tin nhắn hôm nay",
      value: dashboardStats
        ? dashboardStats.messagesTodayCount.toString()
        : "0",
      icon: MessageCircle,
      isLoading: loadingStats,
    },
    {
      label: "Nhóm hoạt động",
      value: dashboardStats ? dashboardStats.joinedGroupsCount.toString() : "0",
      icon: Users,
      isLoading: loadingStats,
    },
    {
      label: "Bạn bè đã liên lạc",
      value: dashboardStats
        ? dashboardStats.uniqueDirectChatPartnersCount.toString()
        : "0",
      icon: Heart,
      isLoading: loadingStats,
    },
  ];

  // Function to handle conversation click
  const handleConversationClick = (
    conversationId: number,
    conversationType: string
  ) => {
    if (conversationType === "Group") {
      router.push(`/chat/conversations/${conversationId}`);
    } else {
      router.push(`/chat/conversations/${conversationId}`);
    }
  };

  // Function to format time
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    return formatUtcToIctRelative(dateString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Xin chào! 👋
              </h1>
              <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                Hôm nay là {new Date().toLocaleDateString("vi-VN")},{" "}
                <RealTimeClock />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {todayStats.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {stat.label}
                        </p>
                        {stat.isLoading ? (
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        ) : (
                          <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            {stat.value}
                          </p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Conversations */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">
                    Trò chuyện gần đây
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => router.push("/chat")}
                  >
                    Xem tất cả
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentConversations.map((chat) => (
                  <div
                    key={chat.conversationId}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() =>
                      handleConversationClick(
                        chat.conversationId,
                        chat.conversationType
                      )
                    }
                  >
                    <UserAvatarWithStatus
                      userId={chat.conversationId.toString()}
                      src={chat.avatarUrl || "/api/placeholder/40/40"}
                      fallback={chat.displayName.charAt(0)}
                      className="h-12 w-12"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-800 dark:text-white truncate">
                          {chat.displayName}
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatTime(chat.lastMessageTimestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {chat.lastMessagePreview}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white min-w-[1.5rem] h-6 rounded-full">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
                  Hành động nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    className={`w-full justify-start bg-gradient-to-r ${action.color} hover:scale-[1.02] transition-all duration-200 text-white shadow-lg`}
                    onClick={action.onClick}
                  >
                    <action.icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-white/80">
                        {action.action}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Daily Tips */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
                    Mẹo hôm nay
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        Phím tắt hữu ích
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Nhấn Ctrl + K để tìm kiếm nhanh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smile className="w-5 h-5 text-pink-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        Emoji reaction
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Hover vào tin nhắn và thả emoji
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
                  Trạng thái của bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Đang hoạt động
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeMyStatus(UserPresenceStatus.Busy)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Bận
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeMyStatus(UserPresenceStatus.Absent)}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    Vắng mặt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                Bắt đầu trò chuyện ngay! 💬
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Kết nối với bạn bè hoặc tạo nhóm mới để cộng tác hiệu quả
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/chat">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Bắt đầu chat
                  </Button>
                </Link>
                <Link href="/communities">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo nhóm cộng đồng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
