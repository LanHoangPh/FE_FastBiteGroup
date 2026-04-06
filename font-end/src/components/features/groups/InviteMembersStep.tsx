"use client";

import { useState, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, X, Users, UserPlus, Loader2, Check } from "lucide-react";

import { searchUsersForInvite } from "@/lib/api/customer/groups";
import { UserSearchResultDto } from "@/types/customer/user.types";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InviteMembersStepProps {
  groupId: string;
  groupName: string;
  onInviteUsers: (selectedUsers: UserSearchResultDto[]) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function InviteMembersStep({
  groupId,
  groupName,
  onInviteUsers,
  onSkip,
  isLoading,
}: InviteMembersStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResultDto[]>([]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search users with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearchLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["userSearchForInvite", groupId, debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      searchUsersForInvite({
        groupId,
        query: debouncedSearchQuery,
        pageParam: pageParam as number,
        pageSize: 20,
      }),
    enabled: debouncedSearchQuery.length >= 2,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { pageNumber, totalPages } = lastPage;
      return pageNumber < totalPages ? pageNumber + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Flatten all pages into a single array and remove duplicates
  const allUsers = useMemo(() => {
    if (!data?.pages) return [];

    const users: UserSearchResultDto[] = [];
    const seenIds = new Set<string>();

    data.pages.forEach((page) => {
      if (page?.items && Array.isArray(page.items)) {
        page.items.forEach((user: UserSearchResultDto) => {
          if (user?.userId && !seenIds.has(user.userId)) {
            seenIds.add(user.userId);
            users.push(user);
          }
        });
      }
    });

    return users;
  }, [data]);

  // Filter out already selected users from search results
  const availableUsers = useMemo(() => {
    const selectedUserIds = new Set(selectedUsers.map((u) => u.userId));
    return allUsers.filter((user) => !selectedUserIds.has(user.userId));
  }, [allUsers, selectedUsers]);

  const handleSelectUser = useCallback((user: UserSearchResultDto) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.some((u) => u.userId === user.userId);
      if (isAlreadySelected) {
        return prev.filter((u) => u.userId !== user.userId);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
  }, []);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const threshold = 100;

      if (
        scrollTop + clientHeight >= scrollHeight - threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleInvite = () => {
    onInviteUsers(selectedUsers);
  };

  return (
    <div className="space-y-4">
      {/* Group Info Header */}
      <div className="text-center pb-3 border-b">
        <h3 className="text-lg font-semibold">Mời thành viên vào nhóm</h3>
        <p className="text-sm text-muted-foreground">"{groupName}"</p>
      </div>

      {/* Search Input and Selected Users in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Tìm kiếm người dùng</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-xs text-muted-foreground">
              Nhập ít nhất 2 ký tự để tìm kiếm
            </p>
          )}
        </div>

        {/* Selected Users */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              Đã chọn ({selectedUsers.length})
            </span>
          </div>

          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {selectedUsers.map((user) => (
                <Badge
                  key={user.userId}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-2 py-1 text-xs"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-20">{user.displayName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveUser(user.userId)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 text-center">
              Chưa chọn ai
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="text-sm font-medium">Kết quả tìm kiếm</span>
        </div>

        <ScrollArea className="h-56 w-full border rounded-md">
          <div className="p-3 space-y-2" onScroll={handleScroll}>
            {/* Loading state */}
            {isSearchLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="text-center py-6">
                <p className="text-sm text-destructive">
                  Lỗi tìm kiếm: {error?.message}
                </p>
              </div>
            )}

            {/* Empty state */}
            {!isSearchLoading &&
              !isError &&
              debouncedSearchQuery.length >= 2 &&
              availableUsers.length === 0 && (
                <div className="text-center py-6">
                  <UserPlus className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </p>
                </div>
              )}

            {/* Initial state */}
            {debouncedSearchQuery.length < 2 && (
              <div className="text-center py-6">
                <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nhập để tìm kiếm người dùng
                </p>
              </div>
            )}

            {/* Search results */}
            {availableUsers.length > 0 && (
              <div className="space-y-1.5">
                {availableUsers.map((user) => {
                  const isSelected = selectedUsers.some(
                    (u) => u.userId === user.userId
                  );
                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="flex items-center">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Check className="h-3 w-3" />
                            <span className="text-xs">Đã chọn</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            Chọn
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Load more indicator */}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Đang tải thêm...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-3 border-t">
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
          className="px-6"
        >
          Bỏ qua
        </Button>

        <Button
          onClick={handleInvite}
          disabled={isLoading || selectedUsers.length === 0}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang mời...
            </>
          ) : (
            `Mời ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}`
          )}
        </Button>
      </div>
    </div>
  );
}
