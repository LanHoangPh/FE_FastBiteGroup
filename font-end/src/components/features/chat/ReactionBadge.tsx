"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ReactionDto } from "@/types/customer/user.types";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface ReactionBadgeProps {
  reactionCode: string;
  reactors: ReactionDto[];
  messageId: string;
  conversationId: number;
  onReactionToggle: (reactionCode: string) => void;
  disabled?: boolean;
}

export function ReactionBadge({
  reactionCode,
  reactors,
  messageId,
  conversationId,
  onReactionToggle,
  disabled = false,
}: ReactionBadgeProps) {
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const currentUserReacted =
    currentUserId && reactors.some((r) => r.userId === currentUserId);

  // Create tooltip content with user full names
  const tooltipContent = (
    <div className="max-w-[200px]">
      <p className="font-medium text-sm mb-1">
        {reactors.length} {reactors.length === 1 ? "người" : "người"} đã phản
        ứng
      </p>
      <div className="text-xs space-y-0.5">
        {reactors.map((reactor, index) => (
          <div key={reactor.userId} className="flex items-center gap-1.5">
            {reactor.avatarUrl ? (
              <img
                src={reactor.avatarUrl}
                alt={reactor.fullName}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-[8px] font-medium text-gray-600">
                  {reactor.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span
              className={cn(
                "truncate",
                reactor.userId === currentUserId &&
                  "font-medium text-blue-600 dark:text-blue-400"
              )}
            >
              {reactor.userId === currentUserId ? "Bạn" : reactor.fullName}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Phản ứng với {reactionCode}
      </p>
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={currentUserReacted ? "default" : "secondary"}
            className={cn(
              "h-6 px-2 text-xs rounded-full transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95",
              currentUserReacted
                ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && onReactionToggle(reactionCode)}
          >
            <span className="mr-1 text-sm">{reactionCode}</span>
            <span
              className={cn(
                "font-medium",
                currentUserReacted && "text-blue-600 dark:text-blue-400"
              )}
            >
              {reactors.length}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900/95 dark:bg-gray-100/95 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
