"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  User,
  Loader2,
  MessageCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConversationItem } from "./ConversationItem";
import { CreateGroupModal } from "../groups/CreateGroupModal";
import { NewConversationModal } from "./NewConversationModal";
import { ConversationTypeModal } from "./ConversationTypeModal";
import { getMyConversations } from "@/lib/api/customer/conversations";
import { useNotificationsHub } from "@/providers/NotificationsHubProvider";

interface ConversationSidebarProps {
  defaultFilter?: "direct" | "group" | null;
}

export function ConversationSidebar({
  defaultFilter = null,
}: ConversationSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"direct" | "group" | null>(
    defaultFilter
  );
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showConversationType, setShowConversationType] = useState(false);
  const pathname = usePathname();

  // Get query client and notifications hub connection for real-time updates
  const queryClient = useQueryClient();
  const { connection: notificationsConnection } = useNotificationsHub();

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filter when defaultFilter changes
  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  // The dynamic query key for the conversation list
  const queryKey = [
    "conversations",
    { filter, searchTerm: debouncedSearchTerm },
  ];

  // --- REAL-TIME REFRESH LOGIC ---
  useEffect(() => {
    console.log("[ConversationSidebar] Setting up real-time refresh logic...");
    console.log(
      "[ConversationSidebar] Connection available:",
      !!notificationsConnection
    );
    console.log("[ConversationSidebar] Query key:", queryKey);

    if (!notificationsConnection) {
      console.log("[ConversationSidebar] ❌ No SignalR connection available");
      return;
    }

    console.log(
      "[ConversationSidebar] ✅ Setting up ConversationsShouldRefresh listener"
    );

    // Define the handler function that will be called by the hub
    const handleRefresh = () => {
      console.log(
        "[ConversationSidebar] 🔄 Received signal to refresh conversations list!"
      );
      console.log(
        "[ConversationSidebar] 🔄 Invalidating query with key:",
        queryKey
      );
      // Invalidate the query to force TanStack Query to refetch the data
      queryClient.invalidateQueries({ queryKey });
    };

    // Register the listener for the event
    notificationsConnection.on("ConversationsShouldRefresh", handleRefresh);
    console.log(
      "[ConversationSidebar] 🎧 Event listener registered for ConversationsShouldRefresh"
    );

    // Cleanup function: remove the listener when the component unmounts
    // or its dependencies change, to prevent memory leaks.
    return () => {
      console.log(
        "[ConversationSidebar] 🧹 Cleaning up ConversationsShouldRefresh listener"
      );
      notificationsConnection.off("ConversationsShouldRefresh", handleRefresh);
    };
  }, [notificationsConnection, queryClient, queryKey]); // Dependencies are crucial

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getMyConversations({
        pageParam,
        pageSize: 20,
        filter: filter || undefined,
        searchTerm: debouncedSearchTerm || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const conversations =
    data?.pages.flatMap((page) => page.items).filter(Boolean) ?? [];

  // Filter conversations based on search term and current conversation
  const displayConversations = conversations;

  // Get current conversation ID from URL
  const getCurrentConversationId = () => {
    const match = pathname.match(/\/chat\/conversations\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const currentConversationId = getCurrentConversationId();

  // Handle create button click based on filter
  const handleCreateClick = () => {
    if (defaultFilter === "direct") {
      setShowNewConversation(true);
    } else if (defaultFilter === "group") {
      setShowCreateGroup(true);
    } else {
      setShowConversationType(true);
    }
  };

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
              maxLength={30}
              className="pl-12 pr-14 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={handleCreateClick}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs or Header */}
        {defaultFilter ? (
          <div className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                {defaultFilter === "direct"
                  ? "Tin nhắn trực tiếp"
                  : "Nhóm chat"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {defaultFilter === "direct"
                ? "Cuộc trò chuyện 1-1 với bạn bè"
                : "Các nhóm chat bạn tham gia"}
            </p>
          </div>
        ) : (
          <div className="flex gap-2 mt-6">
            <Button
              variant={filter === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(null)}
              className={`text-xs rounded-xl transition-all duration-200 ${
                filter === null
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
              }`}
            >
              Tất cả
            </Button>
            <Button
              variant={filter === "direct" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("direct")}
              className={`text-xs rounded-xl transition-all duration-200 ${
                filter === "direct"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
              }`}
            >
              Trực tiếp
            </Button>
            <Button
              variant={filter === "group" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("group")}
              className={`text-xs rounded-xl transition-all duration-200 ${
                filter === "group"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
              }`}
            >
              Nhóm
            </Button>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : displayConversations.length > 0 ? (
          <div className="space-y-2">
            {displayConversations.map((conversation) => {
              // Defensive check to ensure conversation has required properties
              if (
                !conversation ||
                typeof conversation.conversationId === "undefined"
              ) {
                console.warn("Invalid conversation object:", conversation);
                return null;
              }

              // Determine active conversation based on URL
              const isActive =
                pathname ===
                `/chat/conversations/${conversation.conversationId}`;

              return (
                <Link
                  href={`/chat/conversations/${conversation.conversationId}`}
                  key={conversation.conversationId}
                  className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <ConversationItem
                    conversation={conversation}
                    isActive={isActive}
                  />
                </Link>
              );
            })}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="h-4">
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 animate-ping" />
                    <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Modal Components */}
      <NewConversationModal
        isOpen={showNewConversation}
        onOpenChange={setShowNewConversation}
      />

      <ConversationTypeModal
        isOpen={showConversationType}
        onOpenChange={setShowConversationType}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm animate-pulse"
        >
          <div className="relative">
            <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-60 animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-3/4" />
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg w-1/2" />
          </div>
          <div
            className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      {/* Error icon with animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-200/30 dark:border-red-800/30">
          <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-60 animate-bounce" />
      </div>

      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-red-600 dark:from-gray-100 dark:to-red-400 bg-clip-text text-transparent mb-3">
        Có lỗi xảy ra
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
        Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại sau.
      </p>

      {/* Decorative elements */}
      <div className="flex gap-2 mt-6 opacity-40">
        <div
          className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      {/* Icon with gradient background and animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 shadow-2xl">
          <MessageCircle className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-bounce delay-300" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse" />
      </div>

      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-3">
        Chưa có cuộc trò chuyện nào
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
        Bắt đầu trò chuyện mới bằng cách nhấn nút{" "}
        <span className="text-indigo-500 font-medium">+</span> để kết nối với
        bạn bè
      </p>

      {/* Decorative animated dots */}
      <div className="flex gap-2 mt-6">
        <div
          className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
}
