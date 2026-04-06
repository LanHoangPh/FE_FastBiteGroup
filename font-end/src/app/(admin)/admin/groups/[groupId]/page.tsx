"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  FileText,
  Settings,
  RotateCcw,
  Calendar,
  Activity,
  Shield,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getAdminGroupDetail, restoreAdminGroup } from "@/lib/api/admin/groups";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { handleApiError } from "@/lib/utils/errorUtils";
import { GroupMembersTab } from "@/components/features/admin/groups/GroupMembersTab";
import { GroupPostsTab } from "@/components/features/admin/groups/GroupPostsTab";
import { GroupSettingsTab } from "@/components/features/admin/groups/GroupSettingsTab";

export default function AdminGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const groupId = params.groupId as string;

  // State for action confirmations
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  // Fetch group details
  const {
    data: groupDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group-detail", groupId],
    queryFn: () => getAdminGroupDetail(groupId),
    enabled: !!groupId,
  });

  const group = groupDetail?.data;

  // Mutations for group actions
  const restoreMutation = useMutation({
    mutationFn: () => restoreAdminGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Thành công", {
        description: "Đã khôi phục nhóm",
      });
      setIsRestoreDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi khôi phục nhóm");
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">
            Đang tải thông tin nhóm...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-destructive">
              Không thể tải thông tin nhóm
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Header */}
        <AdminPageHeader
          icon={Users}
          title={group.groupName}
          description={group.description || "Chi tiết nhóm"}
          gradientColors="from-primary/5 via-chart-1/5 to-chart-2/5"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Quay lại
            </span>
          </Button>
        </AdminPageHeader>

        {/* Hero Section */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-card/80">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side - Avatar & Basic Info */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-4 ring-primary/20">
                    <AvatarImage
                      src={group.groupAvatarUrl}
                      alt={group.groupName}
                    />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {group.groupName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {group.isDeleted && (
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-destructive">
                      Đã xóa
                    </Badge>
                  )}
                  {group.isArchived && (
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-warning">
                      Lưu trữ
                    </Badge>
                  )}
                </div>

                {/* Group Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {group.groupName}
                  </h1>
                  {group.description && (
                    <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                      {group.description}
                    </p>
                  )}
                </div>

                {/* Creator Info */}
                {group.creatorName && (
                  <div className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded-full">
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Người tạo:</span>
                    <span className="text-foreground">{group.creatorName}</span>
                  </div>
                )}
              </div>

              {/* Right Side - Stats & Actions */}
              <div className="flex-1 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {group.stats.memberCount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Thành viên
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <FileText className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {group.stats.postCount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bài viết
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {formatRelativeTime(group.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ngày tạo
                        </p>
                      </div>
                    </div>
                  </div>

                  {group.stats.lastActivityAt && (
                    <div className="bg-card p-4 rounded-xl shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <Activity className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {formatRelativeTime(group.stats.lastActivityAt)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Hoạt động cuối
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerts */}
                {group.stats.pendingReportsCount > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-semibold text-destructive">
                          🚩 {group.stats.pendingReportsCount} báo cáo đang chờ
                          xử lý
                        </p>
                        <p className="text-sm text-destructive/80">
                          Cần xem xét và xử lý các báo cáo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {group.isDeleted ? (
                    <AlertDialog
                      open={isRestoreDialogOpen}
                      onOpenChange={setIsRestoreDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="lg"
                          className="flex items-center gap-2 bg-success hover:bg-success/90"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Khôi phục nhóm
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            Khôi phục nhóm
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn khôi phục nhóm{" "}
                            <strong>"{group.groupName}"</strong> không? Nhóm sẽ
                            được khôi phục và hiển thị trở lại trong danh sách
                            chính.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => restoreMutation.mutate()}
                            disabled={restoreMutation.isPending}
                          >
                            {restoreMutation.isPending
                              ? "Đang xử lý..."
                              : "Xác nhận"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Sử dụng menu thao tác trong danh sách nhóm để lưu trữ hoặc
                      xóa nhóm.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Quản lý Nhóm</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem và quản lý thành viên, bài viết và cài đặt nhóm
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted">
                <TabsTrigger
                  value="members"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Thành viên</span>
                </TabsTrigger>
                <TabsTrigger
                  value="posts"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Bài viết</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Cài đặt</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="members" className="space-y-0">
                  <GroupMembersTab
                    groupId={groupId}
                    groupName={group.groupName}
                    isReadOnly={group.isDeleted}
                  />
                </TabsContent>

                <TabsContent value="posts" className="space-y-0">
                  <GroupPostsTab
                    groupId={groupId}
                    isReadOnly={group.isDeleted}
                  />
                </TabsContent>

                <TabsContent value="settings" className="space-y-0">
                  <GroupSettingsTab
                    groupId={groupId}
                    group={group}
                    isReadOnly={group.isDeleted}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
