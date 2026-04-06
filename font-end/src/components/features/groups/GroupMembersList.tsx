"use client";

import React, { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Users, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { getGroupMembers } from "@/lib/api/customer/groups";
import { GroupMemberListDto, GroupRole } from "@/types/customer/group";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupMemberItem } from "./GroupMemberItem";

interface GroupMembersListProps {
  groupId: string;
}

export function GroupMembersList({ groupId }: GroupMembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Set up intersection observer for infinite scroll
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Fetch group members with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["groupMembers", groupId, { searchTerm: debouncedSearchTerm }],
    queryFn: ({ pageParam = 1 }) =>
      getGroupMembers(groupId, {
        pageParam,
        pageSize: 20,
        searchTerm: debouncedSearchTerm,
      }),
    enabled: !!groupId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { pageNumber, totalPages } = lastPage;
      return pageNumber < totalPages ? pageNumber + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Flatten all pages into a single array and remove duplicates
  const allMembers = useMemo(() => {
    if (!data?.pages) return [];

    const members: GroupMemberListDto[] = [];
    const seenIds = new Set<string>();

    data.pages.forEach((page) => {
      if (page?.items && Array.isArray(page.items)) {
        page.items.forEach((member: GroupMemberListDto) => {
          if (member?.userId && !seenIds.has(member.userId)) {
            seenIds.add(member.userId);
            members.push(member);
          }
        });
      }
    });

    return members;
  }, [data]);

  // Trigger fetch next page when sentinel is in view
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm thành viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          maxLength={30}
        />
      </div>

      {/* Members List */}
      <ScrollArea className="h-96 w-full border rounded-md">
        <div className="p-3 space-y-2">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-destructive">
                Lỗi tải danh sách thành viên: {error?.message}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            !isError &&
            allMembers.length === 0 &&
            debouncedSearchTerm && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy thành viên nào
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            )}

          {/* Initial Empty State */}
          {!isLoading &&
            !isError &&
            allMembers.length === 0 &&
            !debouncedSearchTerm && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Chưa có thành viên nào trong nhóm
                </p>
              </div>
            )}

          {/* Members List */}
          {allMembers.length > 0 && (
            <div className="space-y-1">
              {allMembers.map((member) => (
                <GroupMemberItem
                  key={member.userId}
                  member={member}
                  groupId={groupId}
                />
              ))}

              {/* Infinite Scroll Sentinel */}
              <div
                ref={sentinelRef}
                className="h-4 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Đang tải thêm...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
