"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Search, X, UserPlus, Loader2, Check } from "lucide-react";

import {
  searchUsersForInvite,
  addMemberToGroup,
} from "@/lib/api/customer/groups";
import { UserSearchResultDto } from "@/types/customer/user.types";
import { useDebounce } from "@/hooks/useDebounce";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export function AddMemberModal({
  isOpen,
  onClose,
  groupId,
  groupName,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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
    enabled: debouncedSearchQuery.length >= 2 && isOpen,
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

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ userIdToAdd }: { userIdToAdd: string }) =>
      addMemberToGroup(groupId, { userIdToAdd }),
    onSuccess: (_, variables) => {
      const user = allUsers.find((u) => u.userId === variables.userIdToAdd);
      if (user) {
        toast.success(`${user.displayName} đã được thêm vào nhóm.`);
        setAddedUserIds((prev) => new Set([...prev, variables.userIdToAdd]));

        // Invalidate queries to refresh the member list and member count
        queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
        queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
        queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      }
    },
    onError: (error) => {
      handleApiError(error, "Không thể thêm thành viên");
    },
  });

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

  const handleAddUser = useCallback(
    (user: UserSearchResultDto) => {
      addMemberMutation.mutate({ userIdToAdd: user.userId });
    },
    [addMemberMutation]
  );

  const handleClose = () => {
    setSearchQuery("");
    setAddedUserIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm thành viên vào nhóm</DialogTitle>
          <DialogDescription>
            Tìm kiếm và thêm thành viên mới vào nhóm "{groupName}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
                maxLength={100}
              />
            </div>

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="text-xs text-muted-foreground">
                Nhập ít nhất 2 ký tự để tìm kiếm
              </p>
            )}
          </div>

          {/* Search Results */}
          <div className="space-y-3 flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm font-medium">Kết quả tìm kiếm</span>
            </div>

            <ScrollArea className="h-80 w-full border rounded-md">
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
                  allUsers.length === 0 && (
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
                {allUsers.length > 0 && (
                  <div className="space-y-1.5">
                    {allUsers.map((user) => {
                      const isAdded = addedUserIds.has(user.userId);
                      const isAdding =
                        addMemberMutation.isPending &&
                        addMemberMutation.variables?.userIdToAdd ===
                          user.userId;

                      return (
                        <div
                          key={user.userId}
                          className="flex items-center gap-3 p-2.5 rounded-lg border"
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
                            {isAdded ? (
                              <div className="flex items-center gap-1.5 text-green-600">
                                <Check className="h-3 w-3" />
                                <span className="text-xs">Đã thêm</span>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={isAdding}
                                onClick={() => handleAddUser(user)}
                              >
                                {isAdding ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Đang thêm...
                                  </>
                                ) : (
                                  "Thêm"
                                )}
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
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
