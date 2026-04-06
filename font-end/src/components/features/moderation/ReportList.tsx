"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import { GroupReportedContentDto } from "@/types/customer/moderation";
import { ReportCard } from "./ReportCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportListProps {
  reports: GroupReportedContentDto[];
  groupId: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRefetch: () => void;
}

export function ReportList({
  reports,
  groupId,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRefetch,
}: ReportListProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Auto-load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải danh sách báo cáo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."}
          </p>
          <Button onClick={onRefetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không có báo cáo nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hiện tại không có báo cáo nội dung nào cần xem xét. Đây là tin tốt!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Report Cards */}
      {reports.map((report) => (
        <ReportCard key={report.reportId} report={report} groupId={groupId} />
      ))}

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang tải thêm...</span>
            </div>
          ) : (
            <Button variant="outline" onClick={onLoadMore}>
              Tải thêm báo cáo
            </Button>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && reports.length > 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          Đã hiển thị tất cả báo cáo
        </div>
      )}
    </div>
  );
}
