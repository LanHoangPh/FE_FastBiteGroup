"use client";

import {
  getDashboardSummary,
  getAnalyticsCharts,
} from "@/lib/api/admin/dashboard";
import { UserGrowthChart } from "@/components/features/admin/dashboard/UserGrowthChart";
import { RecentActivityLists } from "@/components/features/admin/dashboard/RecentActivityLists";
import { StatsCard } from "@/components/features/admin/dashboard/StatsCard";
import { DashboardLoadingSkeleton } from "@/components/features/admin/dashboard/DashboardSkeletons";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { SignalRDebugInfo } from "@/components/shared/SignalRDebugInfo";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import {
  Users,
  UserPlus,
  MessageCircle,
  FileText,
  Bell,
  Video,
  AlertTriangle,
  UserX,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";

// Enhanced StatsCard với design tốt hơn
function EnhancedStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const colorClasses = {
    default: "from-card to-card/50 border-border/50",
    primary: "from-primary/10 to-primary/5 border-primary/20",
    success: "from-success/10 to-success/5 border-success/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
    destructive: "from-destructive/10 to-destructive/5 border-destructive/20",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconColors[color]}`} />
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend && (
            <Badge
              variant={
                trend === "up"
                  ? "default"
                  : trend === "down"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs"
            >
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  // Note: Authentication and admin role checks are handled by middleware.ts
  // No need for client-side redirects as middleware already protects this route

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const response = await getDashboardSummary();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    // Only run query if user is authenticated and has admin role
    enabled: isAuthenticated && user?.roles?.includes("Admin"),
  });

  const {
    data: chartData,
    isLoading: isChartLoading,
    error: chartError,
  } = useQuery({
    queryKey: ["analytics-charts", "Last30Days"],
    queryFn: async () => {
      const response = await getAnalyticsCharts("Last30Days");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch chart data");
      }
      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: isAuthenticated && user?.roles?.includes("Admin"),
  });

  const isLoading = isDashboardLoading || isChartLoading;
  const error = dashboardError || chartError;

  // Middleware ensures only authenticated Admin users reach this page

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header Section */}
        <AdminPageHeader
          icon={BarChart3}
          title="Dashboard"
          description="Tổng quan hệ thống và hoạt động"
        >
          <Link href="/admin/analytics">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm">
              <TrendingUp className="h-4 w-4" />
              Xem Analytics
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" size="icon" className="bg-background/80">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </AdminPageHeader>

        {/* Welcome Message */}
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
            <Clock className="h-4 w-4" />
            Chào mừng trở lại,{" "}
            <span className="font-medium text-foreground">{user.fullName}</span>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <DashboardLoadingSkeleton />
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <ErrorDisplay
                error={error as Error}
                retry={() => {
                  refetchDashboard();
                  // Note: chartData will auto-refetch due to query key dependency
                }}
                title="Không thể tải dữ liệu dashboard"
                subtitle="Vui lòng đảm bảo bạn đã đăng nhập với tài khoản admin"
              />
            </CardContent>
          </Card>
        )}

        {dashboardData && (
          <>
            {/* Enhanced Key Statistics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Thống kê chính
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <EnhancedStatsCard
                  title="Tổng người dùng"
                  value={dashboardData.keyStats.totalUsers}
                  icon={Users}
                  color="primary"
                />
                <EnhancedStatsCard
                  title="Người dùng mới (7 ngày)"
                  value={dashboardData.keyStats.newUsersLast7Days}
                  description="So với tuần trước"
                  icon={UserPlus}
                  color="success"
                  trend="up"
                />
                <EnhancedStatsCard
                  title="Người dùng hoạt động (7 ngày)"
                  value={dashboardData.keyStats.activeUsersLast7Days}
                  description="Người dùng đã đăng nhập"
                  icon={Users}
                  color="default"
                />
                <EnhancedStatsCard
                  title="Tổng nhóm"
                  value={dashboardData.keyStats.totalGroups}
                  icon={MessageCircle}
                  color="default"
                />
                <EnhancedStatsCard
                  title="Tổng bài viết"
                  value={dashboardData.keyStats.totalPosts}
                  icon={FileText}
                  color="default"
                />
                <EnhancedStatsCard
                  title="Tổng cuộc gọi video"
                  value={dashboardData.keyStats.totalVideoCalls}
                  icon={Video}
                  color="default"
                />
              </div>
            </div>

            {/* Enhanced Moderation Statistics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h2 className="text-xl font-semibold text-foreground">
                  Quản lý nội dung
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <EnhancedStatsCard
                  title="Báo cáo chờ xử lý"
                  value={dashboardData.moderationStats.pendingReportsCount}
                  description="Cần xem xét"
                  icon={AlertTriangle}
                  color="warning"
                  trend={
                    dashboardData.moderationStats.pendingReportsCount > 0
                      ? "up"
                      : "neutral"
                  }
                />
                <EnhancedStatsCard
                  title="Người dùng bị vô hiệu hóa"
                  value={dashboardData.moderationStats.deactivatedUsersCount}
                  description="Tài khoản bị khóa"
                  icon={UserX}
                  color="destructive"
                />
              </div>
            </div>

            {/* Enhanced User Growth Chart */}
            {chartData && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-1" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Phân tích tăng trưởng
                  </h2>
                </div>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-chart-1" />
                        Tăng trưởng Người dùng (30 ngày qua)
                      </CardTitle>
                      <Badge variant="outline" className="bg-background/50">
                        30 ngày
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <UserGrowthChart data={chartData.userGrowthChartData} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Recent Activity Lists */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                  Hoạt động gần đây
                </h2>
              </div>

              <RecentActivityLists
                recentUsers={dashboardData.recentUsers}
                recentGroups={dashboardData.recentGroups}
                recentPendingReports={dashboardData.recentPendingReports}
                recentAdminActions={dashboardData.recentAdminActions}
              />
            </div>

            {/* Enhanced Technical Debug Information */}
            <Collapsible open={isDebugOpen} onOpenChange={setIsDebugOpen}>
              <Card className="border-0 bg-muted/20">
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Thông tin Gỡ lỗi Kỹ thuật
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {isDebugOpen ? "Ẩn" : "Hiển thị"}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isDebugOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                      <SignalRDebugInfo />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </>
        )}
      </div>
    </div>
  );
}
