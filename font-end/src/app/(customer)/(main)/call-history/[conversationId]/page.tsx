"use client";

import { useParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getCallHistory } from "@/lib/api/customer/calls";
import {
  formatUtcToIctString,
  formatUtcToIctRelative,
} from "@/lib/utils/dateUtils";
import { CallHistoryItemDto } from "@/types/customer/call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Phone, Clock, Users, User } from "lucide-react";

export default function CallHistoryPage() {
  const params = useParams();
  const conversationId = parseInt(params.conversationId as string);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["callHistory", conversationId],
    queryFn: ({ pageParam = 1 }) =>
      getCallHistory({
        conversationId,
        pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !isNaN(conversationId),
  });

  const callHistory = data?.pages.flatMap((page) => page.items) ?? [];

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) {
      return "< 1 phút";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes} phút`;
  };

  const formatDateTime = (dateString: string): string => {
    const formattedDate = formatUtcToIctString(dateString);
    const relativeTime = formatUtcToIctRelative(dateString);

    // If the relative time is "Vừa xong" (Just now), show only the exact time
    if (relativeTime === "Vừa xong") {
      return formattedDate;
    }

    return `${formattedDate} (${relativeTime})`;
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isNaN(conversationId)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-lg">
          {/* Icon with gradient background */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 mx-auto transform hover:scale-105 transition-transform duration-300">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            ID cuộc trò chuyện không hợp lệ
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Vui lòng chọn một cuộc trò chuyện hợp lệ từ danh sách bên trái.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="h-full bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-700/60 shadow-xl shadow-slate-200/20 dark:shadow-gray-900/40 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-2xl" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex space-x-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-lg">
          {/* Icon with gradient background */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 mx-auto transform hover:scale-105 transition-transform duration-300">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Không thể tải lịch sử cuộc gọi
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {error?.message ||
              "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="h-full bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-gray-700/60 shadow-xl shadow-slate-200/20 dark:shadow-gray-900/40 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Phone className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Lịch sử cuộc gọi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tất cả cuộc gọi video đã diễn ra trong cuộc trò chuyện này
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {callHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              {/* Icon with gradient background and animation */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 shadow-2xl">
                  <Phone className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-3">
                Chưa có cuộc gọi nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Lịch sử cuộc gọi video sẽ hiển thị tại đây khi có cuộc gọi đầu
                tiên.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-200/40 dark:border-gray-700/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:bg-indigo-500/10 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30">
                      <TableHead className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Người khởi tạo
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Thời gian bắt đầu
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Thời lượng
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Số người tham gia
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callHistory.map((call: CallHistoryItemDto) => (
                      <TableRow
                        key={call.videoCallSessionId}
                        className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium">
                          {call.initiatorName}
                        </TableCell>
                        <TableCell className="text-nowrap">
                          {formatDateTime(call.startedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                call.endedAt ? "bg-green-500" : "bg-yellow-500"
                              }`}
                            />
                            {formatDuration(call.durationInMinutes)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {call.participantCount}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
                  </Button>
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hiển thị {callHistory.length} cuộc gọi
                  {hasNextPage && " (có thêm cuộc gọi khác)"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
