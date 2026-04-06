"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, User, Shield, Activity } from "lucide-react";
import { getMyAdminProfile } from "@/lib/api/admin/users";
import { ProfileSummaryCard } from "@/components/features/admin/profile/ProfileSummaryCard";
import { ProfileTabs } from "@/components/features/admin/profile/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatUtcToIctString } from "@/lib/utils/dateUtils";

export default function AdminProfilePage() {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-admin-profile"],
    queryFn: getMyAdminProfile,
  });
  const formatDate = (dateString: string) => {
    return formatUtcToIctString(dateString) || "Không xác định";
  };

  const profileData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="container mx-auto p-6 space-y-8">
          {/* Enhanced Header Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-chart-1/5 to-chart-2/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
                <Clock className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right Column Skeleton */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="container mx-auto p-6 space-y-8">
          {/* Enhanced Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-chart-1/5 to-chart-2/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">
                    Hồ sơ Admin
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Quản lý thông tin cá nhân và bảo mật
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
                <Clock className="h-4 w-4" />
                Không thể tải thông tin hồ sơ
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="p-3 bg-destructive/20 rounded-xl inline-block">
                  <Shield className="h-12 w-12 text-destructive mx-auto" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-destructive">
                    Không thể tải thông tin hồ sơ
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Đã xảy ra lỗi khi tải thông tin hồ sơ. Vui lòng thử lại sau.
                  </p>
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
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-chart-1/5 to-chart-2/5 rounded-3xl blur-xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/20 rounded-xl">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Hồ sơ Admin
                </h1>
                <p className="text-lg text-muted-foreground">
                  Quản lý thông tin cá nhân và bảo mật
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
              <Clock className="h-4 w-4" />
              Xin chào, {profileData.fullName} • Cập nhật lần cuối:{" "}
              {formatDate(profileData.updateAt)}
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
          <Activity className="h-4 w-4" />
          Hồ sơ được đồng bộ với hệ thống
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20 ml-2"
          >
            Hoạt động
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Summary Card */}
          <div className="lg:col-span-1">
            <ProfileSummaryCard profileData={profileData} />
          </div>

          {/* Right Column: Tabbed Interface */}
          <div className="lg:col-span-2">
            <ProfileTabs profileData={profileData} />
          </div>
        </div>
      </div>
    </div>
  );
}
