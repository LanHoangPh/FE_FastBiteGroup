"use client";

import Link from "next/link";
import {
  NotificationDto,
  NotificationType,
} from "@/types/customer/notification";
import {
  Bell,
  MessageSquare,
  Users,
  ThumbsUp,
  UserPlus,
  AtSign,
  FileText,
  BarChart3,
  Video,
  Shield,
  UserX,
  XCircle,
  Mail,
  UserCheck,
  Megaphone,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { cn } from "@/lib/utils";

// Helper to map notification type to an icon component
const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case NotificationType.NewMessage:
      return <MessageSquare className={cn(iconClass, "text-blue-600")} />;
    case NotificationType.UserAddedToGroup:
      return <UserPlus className={cn(iconClass, "text-green-600")} />;
    case NotificationType.UserMention:
      return <AtSign className={cn(iconClass, "text-purple-600")} />;
    case NotificationType.NewPostInGroup:
      return <FileText className={cn(iconClass, "text-indigo-600")} />;
    case NotificationType.NewPostComment:
      return <MessageSquare className={cn(iconClass, "text-blue-500")} />;
    case NotificationType.PostLike:
      return <ThumbsUp className={cn(iconClass, "text-pink-500")} />;
    case NotificationType.NewPoll:
      return <BarChart3 className={cn(iconClass, "text-orange-600")} />;
    case NotificationType.VideoCallInvitation:
      return <Video className={cn(iconClass, "text-green-500")} />;
    case NotificationType.AdminPromotion:
      return <Shield className={cn(iconClass, "text-yellow-600")} />;
    case NotificationType.UserKickedFromGroup:
      return <UserX className={cn(iconClass, "text-red-600")} />;
    case NotificationType.PostRejected:
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case NotificationType.GroupInvitation:
      return <Users className={cn(iconClass, "text-green-500")} />;
    case NotificationType.AccountDeactivated:
      return <Mail className={cn(iconClass, "text-gray-600")} />;
    case NotificationType.SystemAnnouncement:
      return <Megaphone className={cn(iconClass, "text-indigo-600")} />;
    default:
      return <Bell className={cn(iconClass, "text-gray-500")} />;
  }
};

// Strip HTML tags from content preview for clean display
const stripHtmlTags = (html: string) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim(); // Remove leading/trailing whitespace
};

interface Props {
  notification: NotificationDto;
}

export function CustomNotificationToast({ notification }: Props) {
  const cleanContent = stripHtmlTags(notification.contentPreview);

  // If there's no navigation URL, render a non-clickable version
  if (!notification.relatedObject?.navigateUrl) {
    return (
      <div className="flex items-start gap-3 p-1">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
            {cleanContent}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    // <Link
    //   href={notification.relatedObject.navigateUrl}
    //   className="block w-full hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors"
    // >
    <div className="flex items-start gap-3 p-1">
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
          {cleanContent}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(notification.createdAt)}
          </p>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Nhấn để xem
          </span>
        </div>
      </div>
    </div>
    // </Link>
  );
}
