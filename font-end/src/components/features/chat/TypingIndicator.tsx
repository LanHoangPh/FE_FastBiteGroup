"use client";

import { useChatHub } from "@/providers/ChatHubProvider";
import { useMemo } from "react";

interface TypingIndicatorProps {
  conversationId: number;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const { typingUsers } = useChatHub();
  const currentTypingUsers = typingUsers[conversationId] || [];

  const typingText = useMemo(() => {
    const names = currentTypingUsers.map((u) => u.fullName);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} đang nhập...`;
    if (names.length === 2) return `${names[0]} và ${names[1]} đang nhập...`;
    return `${names[0]} và ${names.length - 1} người khác đang nhập...`;
  }, [currentTypingUsers]);

  if (!typingText) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span>{typingText}</span>
        <div className="flex space-x-1">
          <div
            className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
