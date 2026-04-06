"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecentNotifications } from "@/lib/api/admin/notifications";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { DashboardLoadingSkeleton } from "@/components/features/admin/dashboard/DashboardSkeletons";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  RefreshCw,
  Users,
  AlertTriangle,
  Layers,
  Zap,
  Megaphone,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { AdminNotificationType } from "@/types/admin/notification.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/admin/notifications";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";

// Notification type filter options with icons
const notificationTypeOptions: {
  value: AdminNotificationType | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "all", label: "Tất cả loại", icon: Bell },
  { value: "NewUserRegistered", label: "Người dùng mới", icon: Users },
  { value: "ContentReported", label: "Nội dung báo cáo", icon: AlertTriangle },
  { value: "NewGroupCreated", label: "Nhóm mới", icon: Layers },
  { value: "BackgroundJobFailed", label: "Lỗi hệ thống", icon: Zap },
  { value: "GeneralAnnouncement", label: "Thông báo chung", icon: Megaphone },
];

export default function AdminNotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterType, setFilterType] = useState<AdminNotificationType | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "unread">("all");

  const queryClient = useQueryClient();

  // Fetch notifications with pagination and filters
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "admin-notifications",
      { page: currentPage, pageSize, statusFilter, typeFilter: filterType },
    ],
    queryFn: async () => {
      const response = await getRecentNotifications(
        currentPage,
        pageSize,
        filterType,
        statusFilter
      );
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
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
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

  // Calculate unread count from the current data
  const unreadCount = data?.items?.filter((n) => !n.isRead).length || 0;
  const hasUnreadNotifications = unreadCount > 0;

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!data || data.totalPages <= 1) return [];

    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(data.totalPages, startPage + maxVisiblePages - 1);

    // Add first page if not visible
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last page if not visible
    if (endPage < data.totalPages) {
      if (endPage < data.totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={data.totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(data.totalPages);
            }}
          >
            {data.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const currentTypeOption = notificationTypeOptions.find(
    (opt) => opt.value === filterType
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section - Enhanced with gradient and better typography */}
        <AdminPageHeader
          icon={Bell}
          title="Thông báo quản trị"
          description="Quản lý và theo dõi các thông báo hệ thống"
          gradientColors="from-primary/5 to-chart-1/5"
        >
          <Button
            variant="outline"
            size="default"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={
              !hasUnreadNotifications || markAllAsReadMutation.isPending
            }
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        </AdminPageHeader>

        {/* Statistics Cards - Improved design with gradients */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-chart-1/10 to-chart-1/5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng thông báo
              </CardTitle>
              <Bell className="h-5 w-5 text-chart-1" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {data?.totalRecords || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-warning/10 to-warning/5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chưa đọc
              </CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-warning">
                {unreadCount}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-chart-2/10 to-chart-2/5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trang hiện tại
              </CardTitle>
              {currentTypeOption && (
                <currentTypeOption.icon className="h-5 w-5 text-chart-2" />
              )}
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {data?.pageNumber || currentPage}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-chart-3/10 to-chart-3/5 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng trang
              </CardTitle>
              <Layers className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-foreground">
                {data?.totalPages || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Enhanced with better spacing and styling */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Status Filter Tabs */}
              <Tabs
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | "unread")
                }
              >
                <TabsList className="bg-secondary/80 p-1">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Chưa đọc
                    {unreadCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-warning/20 text-warning border-warning/30"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-4">
                {/* Type Filter */}
                <Select
                  value={filterType}
                  onValueChange={(value) =>
                    setFilterType(value as AdminNotificationType | "all")
                  }
                >
                  <SelectTrigger className="w-64 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      {currentTypeOption && (
                        <currentTypeOption.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Số lượng/trang:
                  </label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-20 bg-background/80 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List - Enhanced with better spacing */}
        <Card className="border-0 shadow-sm min-h-96">
          <CardContent className="p-6">
            {isLoading && <DashboardLoadingSkeleton />}

            {error && (
              <div className="py-12">
                <ErrorDisplay
                  error={error as Error}
                  retry={() => refetch()}
                  title="Không thể tải danh sách thông báo"
                />
              </div>
            )}

            {data && data.items.length === 0 && (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 rounded-full blur-3xl transform scale-150" />
                  <Bell className="relative h-16 w-16 text-muted-foreground/60 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-3">
                  Không có thông báo nào
                </h3>
                <p className="text-base text-muted-foreground/80 max-w-md mx-auto">
                  {filterType !== "all" || statusFilter === "unread"
                    ? "Không có thông báo nào phù hợp với bộ lọc hiện tại"
                    : "Bạn chưa có thông báo nào"}
                </p>
              </div>
            )}

            {data && data.items.length > 0 && (
              <div className="space-y-3">
                {data.items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination - Enhanced design */}
        {data && data.totalPages > 1 && (
          <Card className="border-0 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  <span className="font-medium">
                    Trang {data.pageNumber} của {data.totalPages}
                  </span>
                  {" • "}
                  <span>
                    Hiển thị {(data.pageNumber - 1) * data.pageSize + 1} đến{" "}
                    {Math.min(
                      data.pageNumber * data.pageSize,
                      data.totalRecords
                    )}
                  </span>{" "}
                  <span>trong tổng số {data.totalRecords} thông báo</span>
                </div>

                <Pagination className="order-1 sm:order-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.max(1, data.pageNumber - 1));
                        }}
                        className={
                          data.pageNumber === 1
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      />
                    </PaginationItem>

                    {generatePaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(
                            Math.min(data.totalPages, data.pageNumber + 1)
                          );
                        }}
                        className={
                          data.pageNumber >= data.totalPages
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
