"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageDto } from "@/types/customer/user.types";
import { SearchMessagesRequestParams } from "@/types/customer/hub.types";
import { searchMessages } from "@/lib/api/customer/conversations";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchResultsListProps {
  conversationId: number;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onJumpToMessage: (messageId: string) => void;
  isJumping?: boolean;
}

interface SearchResultItemProps {
  message: MessageDto;
  searchTerm: string;
  onJumpToMessage: (messageId: string) => void;
  isJumping?: boolean;
}

function SearchResultItem({
  message,
  searchTerm,
  onJumpToMessage,
  isJumping,
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
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium"
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
      className={cn(
        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-all duration-200 group",
        isJumping && "opacity-50 pointer-events-none"
      )}
      onClick={() => !isJumping && onJumpToMessage(message.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {message.sender.displayName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {message.sender.displayName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(message.sentAt)}
            </span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
            {highlightText(message.content, searchTerm)}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mb-2">
              {message.reactions.slice(0, 3).map((reaction, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5"
                >
                  {reaction.reactionCode}
                </Badge>
              ))}
              {message.reactions.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  +{message.reactions.length - 3}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Nhấp để xem trong ngữ cảnh
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsList({
  conversationId,
  searchTerm,
  onSearchTermChange,
  onJumpToMessage,
  isJumping = false,
}: SearchResultsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset page when search term changes
  const handleSearchTermChange = (term: string) => {
    onSearchTermChange(term);
    setCurrentPage(1);
  };

  // Search query
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "searchMessages",
      conversationId,
      debouncedSearchTerm,
      currentPage,
    ],
    queryFn: () => {
      const params: SearchMessagesRequestParams = {
        query: debouncedSearchTerm,
        pageNumber: currentPage,
        pageSize: 20,
      };
      return searchMessages(conversationId, params);
    },
    enabled: !!debouncedSearchTerm.trim(),
    staleTime: 30000, // Cache for 30 seconds
  });

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <Search className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Tìm kiếm tin nhắn
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            className="pl-10"
            autoFocus
            maxLength={100}
          />
        </div>
        {debouncedSearchTerm && searchResults && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Tìm thấy {searchResults.totalRecords} kết quả cho "
            {debouncedSearchTerm}"
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {!debouncedSearchTerm.trim() ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                Tìm kiếm tin nhắn
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Nhập từ khóa để tìm kiếm tin nhắn trong cuộc trò chuyện này.
                Nhấp vào kết quả để xem tin nhắn trong ngữ cảnh.
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex gap-3 p-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-8 rounded-full" />
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                Lỗi tìm kiếm
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Không thể tìm kiếm tin nhắn. Vui lòng thử lại sau.
              </p>
            </div>
          ) : searchResults && searchResults.items.length > 0 ? (
            <div>
              {searchResults.items.map((message) => (
                <SearchResultItem
                  key={message.id}
                  message={message}
                  searchTerm={debouncedSearchTerm}
                  onJumpToMessage={onJumpToMessage}
                  isJumping={isJumping}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Không có tin nhắn nào chứa từ khóa "{debouncedSearchTerm}". Thử
                sử dụng từ khóa khác.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Pagination */}
      {searchResults && searchResults.items.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {searchResults.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isJumping}
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= searchResults.totalPages || isJumping}
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isJumping && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-950/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                Đang chuyển đến tin nhắn...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
