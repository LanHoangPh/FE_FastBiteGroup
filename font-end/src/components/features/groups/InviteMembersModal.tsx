"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Search, X, Mail, Loader2, Check, Users } from "lucide-react";

import {
  searchUsersForInvite,
  sendGroupInvitations,
} from "@/lib/api/customer/groups";
import { UserSearchResultDto } from "@/types/customer/user.types";
import { useDebounce } from "@/hooks/useDebounce";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface InviteMembersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export function InviteMembersModal({
  isOpen,
  onOpenChange,
  groupId,
  groupName,
}: InviteMembersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResultDto[]>([]);
  const queryClient = useQueryClient();

  // Debounce search query
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    queryKey: ["userSearchForInvite", groupId, debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      searchUsersForInvite({
        groupId,
        query: debouncedSearchTerm,
        pageParam: pageParam as number,
        pageSize: 10,
      }),
    enabled: debouncedSearchTerm.length >= 2 && isOpen,
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

  // Send invitations mutation
  const sendInvitationsMutation = useMutation({
    mutationFn: (invitedUserIds: string[]) =>
      sendGroupInvitations(groupId, { invitedUserIds }),
    onSuccess: () => {
      toast.success("Đã gửi lời mời thành công.");
      onOpenChange(false);
      // Reset state
      setSelectedUsers([]);
      setSearchTerm("");
      // Optionally invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["groupDetails", groupId],
      });
    },
    onError: (error) => {
      handleApiError(error, "Không thể gửi lời mời");
    },
  });

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

  const handleSendInvites = () => {
    const userIds = selectedUsers.map((user) => user.userId);
    sendInvitationsMutation.mutate(userIds);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Mời thành viên
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và gửi lời mời tham gia nhóm "{groupName}" đến người dùng
            khác
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Đã chọn ({selectedUsers.length})
              </h4>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.userId}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.displayName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleRemoveUser(user.userId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người dùng để mời..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
                maxLength={50}
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-hidden">
            {debouncedSearchTerm.length < 2 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
              </div>
            ) : isSearchLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-48 text-red-500">
                <p className="text-sm">Có lỗi xảy ra khi tìm kiếm</p>
                <p className="text-xs mt-1">
                  {error?.message || "Vui lòng thử lại"}
                </p>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              <ScrollArea className="h-64" onScrollCapture={handleScroll}>
                <div className="space-y-2 pr-4">
                  {availableUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {getInitials(user.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectUser(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Mời
                      </Button>
                    </div>
                  ))}

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendInvitationsMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSendInvites}
              disabled={
                selectedUsers.length === 0 || sendInvitationsMutation.isPending
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendInvitationsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Gửi lời mời ({selectedUsers.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
