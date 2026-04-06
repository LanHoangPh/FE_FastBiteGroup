"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import {
  MessageCircle,
  Users,
  UserPlus,
  AtSign,
  FileText,
  Heart,
  BarChart3,
  Video,
  Trash2,
  Shield,
  UserX,
  XCircle,
  Mail,
  UserCheck,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NotificationDto,
  NotificationType,
} from "@/types/customer/notification";
import { markNotificationAsRead } from "@/lib/api/customer/notifications";
import { handleApiError } from "@/lib/utils/errorUtils";
// NotificationItem no longer needs direct store access - uses provider context
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationDto;
  onClose?: () => void;
}

// Map notification types to icons
const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case NotificationType.NewMessage:
      return <MessageCircle className={cn(iconClass, "text-blue-500")} />;
    case NotificationType.UserAddedToGroup:
      return <UserPlus className={cn(iconClass, "text-green-500")} />;
    case NotificationType.UserMention:
      return <AtSign className={cn(iconClass, "text-purple-500")} />;
    case NotificationType.NewPostInGroup:
      return <FileText className={cn(iconClass, "text-indigo-500")} />;
    case NotificationType.NewPostComment:
      return <MessageCircle className={cn(iconClass, "text-blue-400")} />;
    case NotificationType.PostLike:
      return <Heart className={cn(iconClass, "text-red-500")} />;
    case NotificationType.NewPoll:
      return <BarChart3 className={cn(iconClass, "text-orange-500")} />;
    case NotificationType.VideoCallInvitation:
      return <Video className={cn(iconClass, "text-green-600")} />;
    case NotificationType.Deleted:
      return <Trash2 className={cn(iconClass, "text-gray-500")} />;
    case NotificationType.AdminPromotion:
      return <Shield className={cn(iconClass, "text-yellow-500")} />;
    case NotificationType.UserKickedFromGroup:
      return <UserX className={cn(iconClass, "text-red-600")} />;
    case NotificationType.PostRejected:
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case NotificationType.GroupInvitation:
      return <Mail className={cn(iconClass, "text-blue-600")} />;
    case NotificationType.AccountDeactivated:
      return <UserCheck className={cn(iconClass, "text-gray-600")} />;
    case NotificationType.SystemAnnouncement:
      return <Megaphone className={cn(iconClass, "text-indigo-600")} />;
    default:
      return <MessageCircle className={cn(iconClass, "text-gray-500")} />;
  }
};

export function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // No need for direct store access - provider handles count updates

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: () => markNotificationAsRead(notification.id),
    onSuccess: () => {
      // Invalidate notifications query to update UI and recalculate unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("[NotificationItem] Error marking as read:", error);
      // Don't show error toast for this as it's a background operation
    },
  });

  const handleClick = () => {
    // Navigate to the related content if available
    if (notification.relatedObject?.navigateUrl) {
      router.push(notification.relatedObject.navigateUrl);
    }

    // Mark as read if not already read (background operation)
    if (!notification.isRead) {
      markAsReadMutation.mutate();
    }

    // Close the notification popover
    onClose?.();
  };

  // Format the timestamp using our dateUtils
  const formatTimestamp = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  // Strip HTML tags from content preview for clean display
  const stripHtmlTags = (html: string) => {
    if (!html) return "";
    // Use regex to remove HTML tags - safer for SSR
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .trim(); // Remove leading/trailing whitespace
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
        !notification.isRead &&
          "bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-l-blue-500"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Unread indicator dot */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
        )}

        {/* Notification icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <p
            className={cn(
              "text-sm leading-relaxed break-words",
              !notification.isRead
                ? "font-semibold text-gray-900 dark:text-gray-100"
                : "font-normal text-gray-700 dark:text-gray-300"
            )}
          >
            {stripHtmlTags(notification.contentPreview)}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(notification.createdAt)}
            </span>

            {/* External link indicator */}
            {notification.relatedObject?.navigateUrl && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}
