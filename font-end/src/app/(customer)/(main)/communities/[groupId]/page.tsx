"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Info, Users, MessageSquare, Settings, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostList } from "@/components/features/posts/PostList";
import { GroupDetailsSheet } from "@/components/features/groups/GroupDetailsSheet";
import { getGroupDetails } from "@/lib/api/customer/groups";
import { toast } from "sonner";

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  // Fetch group details for header information
  const { data: groupDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });

  const handleManageClick = () => {
    router.push(`/communities/${groupId}/manage`);
  };
  const handleSharePost = () => {
    toast.info("Chức năng chia sẻ sẽ được cập nhật trong phiên bản tới");
  };

  return (
    <div className="flex h-full">
      {/* Center Column - Post Feed */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Group Avatar */}
              <div className="relative">
                {groupDetails?.groupAvatarUrl ? (
                  <img
                    src={groupDetails.groupAvatarUrl}
                    alt={groupDetails.groupName}
                    className="h-16 w-16 rounded-full object-cover border-4 border-white/50 dark:border-gray-800/50 shadow-lg"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white/50 dark:border-gray-800/50 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                    {isLoadingDetails
                      ? "Đang tải..."
                      : groupDetails?.groupName || "Cộng đồng"}
                  </h1>
                  {groupDetails?.privacy && (
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    >
                      {groupDetails.privacy === "Public"
                        ? "Công khai"
                        : "Riêng tư"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{groupDetails?.memberCount || 0} thành viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Bài viết cộng đồng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSharePost}
                className="hidden md:flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              >
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsSheetOpen(true)}
                className="flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Thông tin</span>
              </Button>

              {groupDetails?.canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageClick}
                  className="hidden lg:flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                >
                  <Settings className="h-4 w-4" />
                  Quản lý
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Post List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="w-full lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto">
            {/* Limit to narrower than full width and center; slightly larger on desktop */}
            <div className="w-full lg:w-3/4 xl:w-4/5 mx-auto">
              <PostList groupId={groupId} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (On-demand) - Group Details Sheet */}
      <GroupDetailsSheet
        groupId={groupId}
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </div>
  );
}
