"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

import { getGroupDetails } from "@/lib/api/customer/groups";
import { GroupRole } from "@/types/customer/group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Simplified Community Management Dashboard for Content Review
 */
export default function CommunityManagePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [activeTab, setActiveTab] = useState("moderation");

  // Fetch group details to check permissions and get basic info
  const {
    data: groupDetails,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });

  // Check if user has management permissions
  const hasManagementAccess =
    groupDetails?.canEdit === true || groupDetails?.canEdit === undefined;

  const handleGoBack = () => {
    router.back();
  };

  const handleNavigateToModeration = () => {
    router.push(`/groups/${groupId}/moderation`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error or no access
  if (isError || !groupDetails || !hasManagementAccess) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn không có quyền quản lý cộng đồng này. Chỉ Admin và Moderator mới
            có thể truy cập trang này.
          </p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={handleGoBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
            >
              {groupDetails.currentUserRole === GroupRole.Admin
                ? "Admin"
                : "Moderator"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kiểm duyệt Cộng đồng
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {groupDetails.groupName} • {groupDetails.memberCount} thành viên
            </p>
          </div>
        </div>
      </div>

      {/* Management Tabs - Simplified to only content review */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="moderation">Kiểm duyệt Nội dung</TabsTrigger>
        </TabsList>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Kiểm duyệt Nội dung
              </CardTitle>
              <CardDescription>
                Xem xét và xử lý các báo cáo nội dung từ thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Báo cáo chờ xử lý
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Có các báo cáo cần được xem xét và xử lý
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleNavigateToModeration}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
