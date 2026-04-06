"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getPendingReports } from "@/lib/api/customer/groups";
import { ReportedContentType } from "@/types/customer/moderation";
import { FilterControls } from "@/components/features/moderation/FilterControls";
import { ReportList } from "@/components/features/moderation/ReportList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Content Moderation Page for Group Admins and Moderators
 * Allows viewing, filtering, and taking action on reported content
 */
export function ModerationPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  // Filter states
  const [contentType, setContentType] = useState<ReportedContentType | null>(null);
  const [authorSearch, setAuthorSearch] = useState("");
  const [reporterSearch, setReporterSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Fetch pending reports with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "pendingReports",
      groupId,
      contentType,
      authorSearch,
      reporterSearch,
      sortBy,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getPendingReports(groupId, {
        pageParam,
        pageSize: 20,
        contentType,
        authorId: authorSearch || null,
        reporterId: reporterSearch || null,
        sortBy,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
  const handleGoBack = () => {
    router.back();
  };

  // Flatten the paginated data
  const reports = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kiểm duyệt Nội dung
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xem xét và xử lý các báo cáo nội dung từ thành viên trong nhóm
        </p>
        <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
      </div>

      {/* Filter Controls */}
      <FilterControls
        contentType={contentType}
        onContentTypeChange={setContentType}
        authorSearch={authorSearch}
        onAuthorSearchChange={setAuthorSearch}
        reporterSearch={reporterSearch}
        onReporterSearchChange={setReporterSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Report List */}
      <ReportList
        reports={reports}
        groupId={groupId}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onRefetch={refetch}
      />
    </div>
  );
}

export default ModerationPage;
