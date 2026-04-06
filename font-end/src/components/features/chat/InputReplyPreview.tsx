"use client";

import { X } from "lucide-react";
import { MessageDto } from "@/types/customer/user.types";
import { Button } from "@/components/ui/button";

interface ReplyPreviewProps {
  replyToMessage: MessageDto;
  onCancel: () => void;
}

export function InputReplyPreview({
  replyToMessage,
  onCancel,
}: ReplyPreviewProps) {
  return (
    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Đang trả lời {replyToMessage.sender.displayName}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                {replyToMessage.content}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
