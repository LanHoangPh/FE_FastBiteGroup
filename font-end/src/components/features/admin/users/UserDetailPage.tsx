"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  Users,
  FileText,
  Activity,
  ExternalLink,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
} from "lucide-react";

import {
  getAdminUserDetails,
  getUserActivity,
  assignRoleToUser,
  removeRoleFromUser,
  removeUserAvatar,
  removeUserBio,
} from "@/lib/api/admin/users";
import { getAllRoles } from "@/lib/api/admin/roles";
import {
  GetUserActivityParams,
  RoleAssignmentDto,
} from "@/types/admin/user.types";
import { formatDate } from "@/lib/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils/errorUtils";
import { useAuthStore } from "@/store/authStore";

interface UserDetailPageProps {
  userId: string;
}

const ACTIVITY_PAGE_SIZE = 10;

export default function UserDetailPage({ userId }: UserDetailPageProps) {
  const [activityFilters, setActivityFilters] = useState<GetUserActivityParams>(
    {
      pageNumber: 1,
      pageSize: ACTIVITY_PAGE_SIZE,
    }
  );
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRemoveAvatarDialogOpen, setIsRemoveAvatarDialogOpen] =
    useState(false);
  const [isRemoveBioDialogOpen, setIsRemoveBioDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Check if this is the current user
  const isCurrentUser = currentUser?.id === userId;

  // Fetch user details
  const { data: userDetailsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getAdminUserDetails(userId),
    enabled: !!userId && !isCurrentUser, // Don't fetch if it's the current user
  });

  // Fetch user activity
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["user-activity", userId, activityFilters],
    queryFn: () => getUserActivity(userId, activityFilters),
    enabled: !!userId && !isCurrentUser, // Don't fetch if it's the current user
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });

  // Remove avatar mutation
  const removeAvatarMutation = useMutation({
    mutationFn: () => removeUserAvatar(userId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa ảnh đại diện của người dùng.",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail", userId],
      });
      setIsRemoveAvatarDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Remove bio mutation
  const removeBioMutation = useMutation({
    mutationFn: () => removeUserBio(userId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa tiểu sử của người dùng.",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail", userId],
      });
      setIsRemoveBioDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: (roleData: RoleAssignmentDto) =>
      assignRoleToUser(userId, roleData),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: `Đã gán vai trò "${selectedRole}" cho người dùng.`,
        variant: "success",
      });
      setSelectedRole("");
      // Invalidate user details to refresh roles
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail", userId],
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: (roleName: string) =>
      removeRoleFromUser(userId, {
        roleName,
        rowVersion: userDetailsData?.data?.rowVersion || "",
      }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: `Đã xóa vai trò "${roleToDelete}" khỏi người dùng.`,
        variant: "success",
      });
      setRoleToDelete("");
      // Invalidate user details to refresh roles
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail", userId],
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  const user = userDetailsData?.data;
  const activities = activityData?.data?.items || [];
  const totalActivityPages = activityData?.data?.totalPages || 0;
  const roles = rolesData?.data || [];

  // Handle activity page change
  const handleActivityPageChange = (pageNumber: number) => {
    setActivityFilters((prev) => ({ ...prev, pageNumber }));
  };

  // Handle activity filter change
  const handleActivityFilterChange = (
    key: keyof GetUserActivityParams,
    value: string | undefined
  ) => {
    setActivityFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1,
    }));
  };

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!selectedRole || !userId) return;

    const roleData: RoleAssignmentDto = {
      roleName: selectedRole,
      rowVersion: userDetailsData?.data?.rowVersion || "",
    };
    assignRoleMutation.mutate(roleData);
  };

  // Handle role removal
  const handleRemoveRole = (roleName: string) => {
    setRoleToDelete(roleName);
  };

  // Confirm role removal
  const confirmRemoveRole = () => {
    if (roleToDelete) {
      removeRoleMutation.mutate(roleToDelete);
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = () => {
    removeAvatarMutation.mutate();
  };

  // Handle bio removal
  const handleRemoveBio = () => {
    removeBioMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get activity type label
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "Post":
        return "Bài viết";
      case "Comment":
        return "Bình luận";
      case "PostLike":
        return "Thích bài viết";
      default:
        return type;
    }
  };

  // Get activity type icon
  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "Post":
        return <FileText className="h-4 w-4" />;
      case "Comment":
        return <Activity className="h-4 w-4" />;
      case "PostLike":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="bg-card rounded-lg p-8 border border-destructive/20 max-w-md mx-auto">
              <div className="text-destructive mb-4 text-lg font-medium">
                Không thể tải thông tin người dùng.
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-destructive/20 hover:bg-destructive/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If this is the current user, show access denied
  if (isCurrentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
          <AdminPageHeader
            icon={User}
            title="Truy cập bị từ chối"
            description="Bạn không thể xem chi tiết tài khoản của chính mình"
            gradientColors="from-destructive/5 via-warning/5 to-destructive/5"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </AdminPageHeader>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold text-destructive">
                  Không thể xem chi tiết tài khoản
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Bạn không thể xem chi tiết tài khoản của chính mình. Để quản
                  lý thông tin cá nhân, vui lòng sử dụng trang Hồ sơ cá nhân.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/profile")}
                    className="border-destructive/20 hover:bg-destructive/10"
                  >
                    Đi đến Hồ sơ cá nhân
                  </Button>
                  <Button variant="ghost" onClick={() => router.back()}>
                    Quay lại
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Header */}
        <AdminPageHeader
          icon={User}
          title={user.fullName}
          description={`${user.email} • Tham gia: ${formatDate(
            user.createdAt
          )}`}
          gradientColors="from-primary/5 via-chart-1/5 to-chart-2/5"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </AdminPageHeader>

        {/* User Profile Card */}
        <Card className="border border-border shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-4 ring-primary/20">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-semibold">
                      {getUserInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-primary h-8 w-8 rounded-full border-4 border-background flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                {user.avatarUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsRemoveAvatarDialogOpen(true)}
                    disabled={removeAvatarMutation.isPending}
                    className="text-xs"
                  >
                    {removeAvatarMutation.isPending
                      ? "Đang xóa..."
                      : "Xóa ảnh đại diện"}
                  </Button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-6">
                {/* Status and Join Date */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    {user.isDeleted ? (
                      <Badge variant="destructive">Xóa mềm</Badge>
                    ) : user.isActive ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Vô hiệu hóa</Badge>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {user.stats.groupMembershipCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Số nhóm tham gia
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-4 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <FileText className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {user.stats.totalPostsCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng bài viết
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-lg p-1">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                Hoạt động
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Vai trò
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bio Section */}
            {user.bio && (
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-foreground">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    Tiểu sử cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-border">
                    <p className="text-foreground leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsRemoveBioDialogOpen(true)}
                    disabled={removeBioMutation.isPending}
                  >
                    {removeBioMutation.isPending
                      ? "Đang xóa..."
                      : "Xóa tiểu sử"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Group Memberships */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Thành viên nhóm ({user.groupMemberships.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user.groupMemberships.length > 0 ? (
                  <div className="space-y-3">
                    {user.groupMemberships.map((membership) => (
                      <div
                        key={membership.groupId}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-border/60 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {membership.groupName}
                          </div>
                          <Badge variant="secondary">
                            {membership.userRoleInGroup}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/admin/groups/${membership.groupId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Xem nhóm
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Người dùng chưa tham gia nhóm nào.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Bài viết gần đây ({user.recentPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user.recentPosts.length > 0 ? (
                  <div className="space-y-3">
                    {user.recentPosts.map((post) => (
                      <div
                        key={post.postId}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-border/60 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="font-semibold text-foreground">
                            {post.title || `Bài viết #${post.postId}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{post.groupName}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.isDeleted && (
                            <Badge variant="destructive" className="text-xs">
                              Đã xóa
                            </Badge>
                          )}
                          {/* <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/admin/groups/${post.groupId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Xem bài viết
                            </a>
                          </Button> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Người dùng chưa có bài viết nào.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity History Tab */}
          <TabsContent value="activity" className="space-y-6">
            {/* Activity Filters */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Bộ lọc hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    value={activityFilters.activityType || "all"}
                    onValueChange={(value) =>
                      handleActivityFilterChange(
                        "activityType",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Tất cả loại hoạt động" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại hoạt động</SelectItem>
                      <SelectItem value="Post">Bài viết</SelectItem>
                      <SelectItem value="Comment">Bình luận</SelectItem>
                      <SelectItem value="PostLike">Thích bài viết</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="ID nhóm (tùy chọn)"
                    value={activityFilters.groupId || ""}
                    onChange={(e) =>
                      handleActivityFilterChange(
                        "groupId",
                        e.target.value || undefined
                      )
                    }
                    className="flex-1"
                    maxLength={50}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity Table */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Lịch sử hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingActivity ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
                  </div>
                ) : activities.length > 0 ? (
                  <>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-medium text-foreground">
                              Loại
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                              Nội dung
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                              Nhóm
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                              Thời gian
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((activity, index) => (
                            <TableRow
                              key={`${activity.activityType}-${activity.postId}-${activity.createdAt}`}
                              className={`hover:bg-muted/50 ${
                                index % 2 === 0
                                  ? "bg-background"
                                  : "bg-muted/30"
                              }`}
                            >
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  {getActivityTypeIcon(activity.activityType)}
                                  {getActivityTypeLabel(activity.activityType)}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[300px] truncate">
                                {activity.contentPreview}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {activity.groupName}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(activity.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={activity.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Xem
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Activity Pagination */}
                    {totalActivityPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <div className="bg-card rounded-lg p-2 border border-border">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handleActivityPageChange(
                                      Math.max(
                                        1,
                                        (activityFilters.pageNumber || 1) - 1
                                      )
                                    );
                                  }}
                                  className={
                                    (activityFilters.pageNumber || 1) <= 1
                                      ? "pointer-events-none opacity-50"
                                      : "hover:bg-muted/50"
                                  }
                                />
                              </PaginationItem>

                              {Array.from(
                                { length: totalActivityPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e: React.MouseEvent) => {
                                      e.preventDefault();
                                      handleActivityPageChange(page);
                                    }}
                                    isActive={
                                      page === (activityFilters.pageNumber || 1)
                                    }
                                    className={
                                      page === (activityFilters.pageNumber || 1)
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "hover:bg-muted/50"
                                    }
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}

                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handleActivityPageChange(
                                      Math.min(
                                        totalActivityPages,
                                        (activityFilters.pageNumber || 1) + 1
                                      )
                                    );
                                  }}
                                  className={
                                    (activityFilters.pageNumber || 1) >=
                                    totalActivityPages
                                      ? "pointer-events-none opacity-50"
                                      : "hover:bg-muted/50"
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Không có hoạt động nào được tìm thấy.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles" className="space-y-6">
            {/* Current Roles */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Vai trò hiện tại ({user.roles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium flex items-center gap-2 border-border"
                      >
                        <Shield className="h-3 w-3" />
                        {role}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                          onClick={() => handleRemoveRole(role)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Người dùng chưa có vai trò nào.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assign New Role */}
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  Gán vai trò mới
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignRole}
                    disabled={
                      !selectedRole ||
                      user.roles.includes(selectedRole) ||
                      assignRoleMutation.isPending
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {assignRoleMutation.isPending
                      ? "Đang gán..."
                      : "Gán vai trò"}
                  </Button>
                </div>
                {selectedRole && user.roles.includes(selectedRole) && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Người dùng đã có vai trò này.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog
        open={isRemoveAvatarDialogOpen}
        onOpenChange={setIsRemoveAvatarDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Xóa ảnh đại diện
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ảnh đại diện của người dùng này? Hành
              động này sẽ khôi phục ảnh đại diện mặc định.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa ảnh đại diện
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Bio Confirmation Dialog */}
      <AlertDialog
        open={isRemoveBioDialogOpen}
        onOpenChange={setIsRemoveBioDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xóa tiểu sử</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tiểu sử của người dùng này? Hành động
              này sẽ xóa vĩnh viễn tiểu sử của người dùng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveBio}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa tiểu sử
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Role Confirmation Dialog */}
      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xóa vai trò
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò{" "}
              <strong>&quot;{roleToDelete}&quot;</strong> khỏi người dùng này?
              Hành động này sẽ xóa vĩnh viễn vai trò khỏi người dùng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveRole}
              disabled={removeRoleMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRoleMutation.isPending ? "Đang xóa..." : "Xóa vai trò"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
