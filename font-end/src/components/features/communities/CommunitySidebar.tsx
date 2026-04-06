"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  Loader2,
  AlertCircle,
  Sparkles,
  Hash,
  Crown,
  Shield,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyAssociatedGroups } from "@/lib/api/customer/me";
import { MyGroupFilterType, UserGroupDto } from "@/types/group";
import { GroupType, GroupPrivacy } from "@/types/customer/group";
import { CreateCommunityModal } from "./CreateCommunityModal";
import { cn } from "@/lib/utils";

export function CommunitySidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pathname = usePathname();

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "myGroups",
      {
        filterType: MyGroupFilterType.Community,
        searchTerm: debouncedSearchTerm,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      getMyAssociatedGroups({
        pageParam,
        pageSize: 20,
        filterType: MyGroupFilterType.Community, // Hardcoded to only fetch Community-type groups
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

  const communities =
    data?.pages.flatMap((page) => page.items).filter(Boolean) ?? [];

  // Get current community ID from URL
  const getCurrentCommunityId = () => {
    const match = pathname.match(/\/communities\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const currentCommunityId = getCurrentCommunityId();

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getGroupIcon = (group: UserGroupDto) => {
    if (group.isOwner) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    if (group.isAdmin) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    return <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  };

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
              placeholder="Tìm kiếm cộng đồng..."
              value={searchTerm}
              maxLength={30}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Header Title */}
        <div className="mt-6 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              <h2 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Cộng đồng của tôi
              </h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-8 w-8 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-full"
            >
              <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Các cộng đồng bạn đã tham gia
          </p>
        </div>

        {/* Create Community Button
        <div className="mt-4">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo cộng đồng mới
          </Button>
        </div> */}
      </div>

      {/* Community List */}
      <div className="flex-1 overflow-y-auto p-3 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-10" />

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : communities.length > 0 ? (
          <div className="space-y-2">
            {communities.map((community) => {
              if (!community || typeof community.groupId === "undefined") {
                console.warn("Invalid community object:", community);
                return null;
              }

              const isActive = currentCommunityId === community.groupId;

              return (
                <Link
                  href={`/communities/${community.groupId}`}
                  key={community.groupId}
                  className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 shadow-lg text-white"
                        : "bg-white/60 dark:bg-gray-800/60 border-gray-200/40 dark:border-gray-700/40 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Community Avatar */}
                      <div className="relative flex-shrink-0">
                        {community.avatarUrl ? (
                          <img
                            src={community.avatarUrl}
                            alt={community.groupName}
                            className="h-12 w-12 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div
                            className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center border-2",
                              isActive
                                ? "bg-white/20 border-white/30"
                                : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border-indigo-200/40 dark:border-indigo-700/40"
                            )}
                          >
                            <Users
                              className={cn(
                                "h-6 w-6",
                                isActive
                                  ? "text-white"
                                  : "text-indigo-600 dark:text-indigo-400"
                              )}
                            />
                          </div>
                        )}

                        {/* Role indicator */}
                        <div className="absolute -top-1 -right-1">
                          {getGroupIcon(community)}
                        </div>
                      </div>

                      {/* Community Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={cn(
                              "font-semibold text-sm truncate",
                              isActive
                                ? "text-white"
                                : "text-gray-900 dark:text-gray-100"
                            )}
                          >
                            {community.groupName}
                          </h3>
                        </div>

                        {community.description && (
                          <p
                            className={cn(
                              "text-xs truncate leading-relaxed",
                              isActive
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {community.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              "text-xs",
                              isActive
                                ? "text-white/70"
                                : "text-gray-400 dark:text-gray-500"
                            )}
                          >
                            {community.memberCount || 0} thành viên
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={cn(
                              "text-xs",
                              isActive
                                ? "text-white/70 border-white/20"
                                : "text-gray-400 dark:text-gray-500"
                            )}
                          >
                            {community.privacy === GroupPrivacy.Public
                              ? "Công khai"
                              : "Riêng tư"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
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

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
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
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
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
        Không thể tải danh sách cộng đồng. Vui lòng thử lại sau.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 shadow-2xl">
          <Users className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-bounce delay-300" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse" />
      </div>

      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-3">
        Chưa tham gia cộng đồng nào
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
        Khám phá và tham gia các cộng đồng thú vị để bắt đầu kết nối với mọi
        người
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
