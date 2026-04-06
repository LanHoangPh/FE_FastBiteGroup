import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ConversationListItemDTO,
  ConversationType,
} from "@/types/customer/user.types";

interface ConversationItemProps {
  conversation: ConversationListItemDTO;
  isActive?: boolean;
}

export function ConversationItem({
  conversation,
  isActive = false,
}: ConversationItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ`;
    return `${Math.floor(diffInMinutes / 1440)} ngày`;
  };

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-2xl cursor-pointer
        transition-all duration-300
        ${
          isActive
            ? "bg-[#ad46ff]/10 border border-[#ad46ff]/20 shadow-lg"
            : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md hover:border-gray-200"
        }
      `}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={conversation.avatarUrl}
          alt={conversation.displayName}
        />
        <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold">
          {getInitials(conversation.displayName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm truncate">
            {conversation.displayName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {conversation.lastMessagePreview || "Không có tin nhắn"}
        </p>
      </div>

      {conversation.unreadCount > 0 && (
        <div className="flex items-center">
          <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </div>
        </div>
      )}
    </div>
  );
}
