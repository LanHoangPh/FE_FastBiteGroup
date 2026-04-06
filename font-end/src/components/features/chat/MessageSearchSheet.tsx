"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageDto } from "@/types/customer/user.types";
import { SearchMessagesRequestParams } from "@/types/customer/hub.types";
import { searchMessages } from "@/lib/api/customer/conversations";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface MessageSearchSheetProps {
  conversationId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageClick?: (messageId: string) => void;
}

interface SearchResultItemProps {
  message: MessageDto;
  searchQuery: string;
  onClick?: () => void;
}

function SearchResultItem({
  message,
  searchQuery,
  onClick,
}: SearchResultItemProps) {
  // Highlight search terms in message content
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <div
      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {message.sender.displayName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {message.sender.displayName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(message.sentAt)}
            </span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {highlightText(message.content, searchQuery)}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.slice(0, 3).map((reaction, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-1 py-0"
                >
                  {reaction.reactionCode}
                </Badge>
              ))}
              {message.reactions.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{message.reactions.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageSearchSheet({
  conversationId,
  isOpen,
  onOpenChange,
  onMessageClick,
}: MessageSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  // Search query
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["searchMessages", conversationId, debouncedQuery, currentPage],
    queryFn: () => {
      const params: SearchMessagesRequestParams = {
        query: debouncedQuery,
        pageNumber: currentPage,
        pageSize: 20,
      };
      console.log("[MessageSearchSheet] Searching with params:", params);
      return searchMessages(conversationId, params);
    },
    enabled: !!debouncedQuery.trim() && debouncedQuery.length >= 2 && isOpen, // Require at least 2 characters
    staleTime: 30000, // Cache for 30 seconds
  });

  const handleMessageClick = useCallback(
    (messageId: string) => {
      onMessageClick?.(messageId);
      onOpenChange(false); // Close sheet after clicking a message
    },
    [onMessageClick, onOpenChange]
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (searchResults && currentPage < searchResults.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SheetTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm tin nhắn
          </SheetTitle>
          <SheetDescription>
            Tìm kiếm tin nhắn trong cuộc trò chuyện này
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
                maxLength={100}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {!debouncedQuery.trim() ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Tìm kiếm tin nhắn
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nhập từ khóa để tìm kiếm tin nhắn trong cuộc trò chuyện này
                  </p>
                </div>
              ) : isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Lỗi tìm kiếm
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Không thể tìm kiếm tin nhắn. Vui lòng thử lại.
                  </p>
                </div>
              ) : searchResults && searchResults.items.length > 0 ? (
                <div>
                  {searchResults.items.map((message) => (
                    <SearchResultItem
                      key={message.id}
                      message={message}
                      searchQuery={debouncedQuery}
                      onClick={() => handleMessageClick(message.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Không có tin nhắn nào chứa từ khóa "{debouncedQuery}"
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Pagination */}
          {searchResults && searchResults.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Trang {currentPage} / {searchResults.totalPages}(
                  {searchResults.totalRecords} kết quả)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= searchResults.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
