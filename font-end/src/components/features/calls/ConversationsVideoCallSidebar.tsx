"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyConversations } from "@/lib/api/customer/conversations";
import { ConversationListItemDTO } from "@/types/customer/user.types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Phone, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ConversationsVideoCallSidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["conversations", "video-call-sidebar", searchTerm],
    queryFn: ({ pageParam = 1 }) =>
      getMyConversations({
        pageParam,
        pageSize: 20,
        searchTerm: searchTerm || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const conversations = data?.pages.flatMap((page) => page.items) ?? [];

  // Extract current conversation ID from pathname
  const currentConversationId = pathname.split("/call-history/")[1];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

        {/* Header with Search */}
        <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-indigo-50/30 to-purple-50/20 dark:from-gray-900/95 dark:via-indigo-950/30 dark:to-purple-950/20 backdrop-blur-xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 z-10" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Lịch sử cuộc gọi
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Chọn cuộc trò chuyện để xem lịch sử cuộc gọi
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

        {/* Header with Search */}
        <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-indigo-50/30 to-purple-50/20 dark:from-gray-900/95 dark:via-indigo-950/30 dark:to-purple-950/20 backdrop-blur-xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 z-10" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Lịch sử cuộc gọi
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Chọn cuộc trò chuyện để xem lịch sử cuộc gọi
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Không thể tải danh sách cuộc trò chuyện
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {error?.message || "Đã xảy ra lỗi"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

      {/* Header with Search */}
      <div className="relative z-10 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-indigo-50/30 to-purple-50/20 dark:from-gray-900/95 dark:via-indigo-950/30 dark:to-purple-950/20 backdrop-blur-xl">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 z-10" />
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
            <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
              Lịch sử cuộc gọi
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Chọn cuộc trò chuyện để xem lịch sử cuộc gọi
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-3 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />

        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Không tìm thấy cuộc trò chuyện nào"
                  : "Chưa có cuộc trò chuyện nào"}
              </p>
            </div>
          ) : (
            <>
              {conversations.map((conversation: ConversationListItemDTO) => {
                const isActive =
                  currentConversationId ===
                  conversation.conversationId.toString();

                return (
                  <Link
                    key={conversation.conversationId}
                    href={`/call-history/${conversation.conversationId}`}
                    className="block mb-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div
                      className={`p-4 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm shadow-lg"
                          : "bg-white/60 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/60"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={conversation.avatarUrl}
                              alt={conversation.displayName}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm">
                              {conversation.displayName
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {isActive && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conversation.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.conversationType === "Group"
                              ? "Nhóm"
                              : "Trò chuyện riêng"}
                          </p>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="w-full rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
