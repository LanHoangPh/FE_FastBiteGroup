"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/api/customer/me";
import {
  ProfileHeader,
  BioCard,
  MyGroupsCard,
  RecentPostsCard,
  ProfilePageSkeleton,
} from "@/components/features/profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: profileResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  if (isLoading) return <ProfilePageSkeleton />;

  if (isError || !profileResponse?.success) {
    return (
      <div className="space-y-6">
        {/* Enhanced Error Display */}
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <Alert
            variant="destructive"
            className="max-w-md mx-auto backdrop-blur-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Lỗi</AlertTitle>
            <AlertDescription className="mt-2">
              Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const profile = profileResponse.data;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
            Hồ sơ cá nhân
          </span>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
          Chào mừng trở lại, {profile.firstName}!
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Quản lý thông tin cá nhân, xem các nhóm và bài đăng gần đây của bạn
        </p>
      </div>

      <div className="space-y-6">
        <ProfileHeader profile={profile} />
        <BioCard bio={profile.bio} />
        <MyGroupsCard groups={profile.groups} />
        <RecentPostsCard posts={profile.recentPosts} />
      </div>
    </div>
  );
}
