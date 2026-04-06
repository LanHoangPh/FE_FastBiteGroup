// src/components/features/groups/GroupCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Users, Crown, Shield, Globe, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PublicGroupDto, GroupType, EnumGroupPrivacy } from "@/types/customer/group";
import { UserGroupDto } from "@/types/group";

interface GroupCardProps {
  group: PublicGroupDto | UserGroupDto;
}

export function GroupCard({ group }: GroupCardProps) {
  // Type guard to check if group is UserGroupDto
  const isUserGroup = (group: PublicGroupDto | UserGroupDto): group is UserGroupDto => {
    return 'isOwner' in group;
  };

  // Helper function to get avatar URL based on group type
  const getAvatarUrl = () => {
    if (isUserGroup(group)) {
      return group.avatarUrl;
    } else {
      return group.groupAvatarUrl;
    }
  };

  const getGroupTypeColor = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Chat:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case GroupType.Community:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getGroupTypeLabel = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Chat:
        return "Nhóm chat";
      case GroupType.Community:
        return "Cộng đồng";
      default:
        return groupType;
    }
  };

  // Validate and get the image source
  const getImageSrc = () => {
    const placeholder = "/images/group-placeholder.svg";
    const avatarUrl = getAvatarUrl();

    if (!avatarUrl) {
      return placeholder;
    }

    // Check if it's a valid URL (starts with http/https) or a valid relative path (starts with /)
    const isValidUrl =
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://") ||
      avatarUrl.startsWith("/");

    // Check if it's not just the string "string" or other invalid values
    const isValidValue =
      avatarUrl !== "string" &&
      avatarUrl.trim() !== "" &&
      avatarUrl !== "null" &&
      avatarUrl !== "undefined";

    // Skip Cloudinary URLs entirely since they're returning 404s
    const isCloudinaryUrl = avatarUrl.includes("cloudinary.com");

    if (isCloudinaryUrl) {
      // Use placeholder for all Cloudinary URLs to avoid 404 errors
      return placeholder;
    }

    return isValidUrl && isValidValue ? avatarUrl : placeholder;
  };

  // Handle image load errors
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/group-placeholder.svg";
  };

  return (
    <Link href={`/groups/${group.groupId}`} className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <CardHeader className="p-0 relative">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
            <Image
              src={getImageSrc()}
              alt={group.groupName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          </AspectRatio>
          
          {/* Privacy Badge - Top Right Corner */}
          {isUserGroup(group) && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant={group.privacy === EnumGroupPrivacy.Private ? "secondary" : "outline"}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm"
              >
                {group.privacy === EnumGroupPrivacy.Private ? (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    Riêng tư
                  </>
                ) : (
                  <>
                    <Globe className="mr-1 h-3 w-3" />
                    Công khai
                  </>
                )}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 mr-2">
              {group.groupName}
            </CardTitle>
            
            {/* Role Indicator */}
            {isUserGroup(group) && (
              <div className="flex-shrink-0">
                {group.isOwner ? (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400">
                    <Crown className="mr-1 h-3 w-3" />
                    Chủ sở hữu
                  </Badge>
                ) : group.isAdmin ? (
                  <Badge variant="outline" className="text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400">
                    <Shield className="mr-1 h-3 w-3" />
                    Quản trị viên
                  </Badge>
                ) : null}
              </div>
            )}
          </div>

          {group.description && (
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {group.description}
            </CardDescription>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          {/* Member Count */}
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{group.memberCount.toLocaleString()} thành viên</span>
          </div>

          {/* Group Type Badge */}
          <Badge
            variant="secondary"
            className={getGroupTypeColor(group.groupType)}
          >
            {getGroupTypeLabel(group.groupType)}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
