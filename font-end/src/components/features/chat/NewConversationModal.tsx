"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { Search, MessageCircle, Loader2, User } from "lucide-react";

import { findOrCreateDirectConversation } from "@/lib/api/customer/conversations";
import { searchUsers } from "@/lib/api/customer/users";
import { UserSearchResultDto } from "@/types/customer/conversation";
import { handleApiError } from "@/lib/utils/errorUtils";
import { useDebounce } from "@/hooks/useDebounce";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface NewConversationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({
  isOpen,
  onOpenChange,
}: NewConversationModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  // Set up intersection observer for infinite scroll
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Search users with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["userSearch", debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      searchUsers({
        query: debouncedSearchTerm,
        pageParam,
        pageSize: 10,
      }),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { pageNumber, totalPages } = lastPage;
      return pageNumber < totalPages ? pageNumber + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Flatten all pages into a single array
  const users = data?.pages.flatMap((page) => page.items) ?? [];

  // Trigger fetch next page when sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Start chat mutation
  const startChatMutation = useMutation({
    mutationFn: (partnerUserId: string) =>
      findOrCreateDirectConversation({ partnerUserId }),
    onSuccess: (response) => {
      onOpenChange(false); // Close the modal
      setSearchQuery(""); // Reset search
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/conversations/${response.conversationId}`);

      // Show success message
      if (response.wasCreated) {
        toast.success("Đã tạo cuộc trò chuyện mới!");
      } else {
        toast.success("Đã tìm thấy cuộc trò chuyện!");
      }
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.errors?.[0]?.errorCode;
      if (errorCode === "MESSAGING_PRIVACY_RESTRICTION") {
        toast.error("Thao tác thất bại", {
          description: "Người dùng này đã giới hạn quyền nhận tin nhắn của họ.",
        });
      } else {
        handleApiError(error, "Không thể bắt đầu cuộc trò chuyện");
      }
    },
  });

  const handleUserSelect = (user: UserSearchResultDto) => {
    startChatMutation.mutate(user.userId);
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "?";
    }
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Tin nhắn mới
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm người dùng để bắt đầu cuộc trò chuyện
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc email người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
              maxLength={30}
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="h-80 w-full border rounded-md">
            <div className="p-3">
              {!debouncedSearchTerm || debouncedSearchTerm.length < 2 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nhập ít nhất 2 ký tự để tìm kiếm
                  </p>
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-destructive mx-auto mb-3" />
                  <p className="text-sm text-destructive">
                    Lỗi tải danh sách người dùng
                  </p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => (
                    <Button
                      key={user.userId}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleUserSelect(user)}
                      disabled={startChatMutation.isPending}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(
                              user.fullName || user.displayName || "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.fullName || user.displayName || "Người dùng"}
                          </p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                        {startChatMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </Button>
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
      </DialogContent>
    </Dialog>
  );
}
