"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ArrowLeft, Users, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getGroupDetailsPreview } from "@/lib/api/customer/groups";
import { GroupType } from "@/types/customer/group";
import { JoinGroupButton } from "@/components/features/groups/JoinGroupButton";
import Link from "next/link";
import Image from "next/image";

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const {
    data: group,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => getGroupDetailsPreview(groupId),
    enabled: !!groupId,
  });

  const getGroupTypeColor = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Private:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case GroupType.Community:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case GroupType.Public:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getGroupTypeLabel = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Private:
        return "Nhóm riêng tư";
      case GroupType.Community:
        return "Cộng đồng";
      case GroupType.Public:
        return "Nhóm công khai";
      default:
        return groupType;
    }
  };

  const getImageSrc = () => {
    const placeholder = "/images/group-placeholder.svg";

    if (!group?.groupAvatarUrl) {
      return placeholder;
    }

    // Skip Cloudinary URLs entirely since they're returning 404s
    const isCloudinaryUrl = group.groupAvatarUrl.includes("cloudinary.com");
    if (isCloudinaryUrl) {
      return placeholder;
    }

    // Check if it's a valid URL or relative path
    const isValidUrl =
      group.groupAvatarUrl.startsWith("http://") ||
      group.groupAvatarUrl.startsWith("https://") ||
      group.groupAvatarUrl.startsWith("/");

    const isValidValue =
      group.groupAvatarUrl !== "string" &&
      group.groupAvatarUrl.trim() !== "" &&
      group.groupAvatarUrl !== "null" &&
      group.groupAvatarUrl !== "undefined";

    return isValidUrl && isValidValue ? group.groupAvatarUrl : placeholder;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-64 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Không tìm thấy nhóm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nhóm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/discover">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại khám phá
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/discover">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại khám phá
          </Button>
        </Link>
      </div>

      {/* Group Details Card */}
      <Card>
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
            <Image
              src={getImageSrc()}
              alt={group.groupName}
              fill
              className="object-cover"
            />
          </AspectRatio>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {group.groupName}
                </h1>
                <Badge className={getGroupTypeColor(group.groupType)}>
                  {getGroupTypeLabel(group.groupType)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount.toLocaleString()} thành viên</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Nhóm chat</span>
                </div>
              </div>
            </div>

            {/* Join Group Button */}
            <div className="flex-shrink-0 flex gap-2">
              <JoinGroupButton group={group} />
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Mô tả
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {group.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
