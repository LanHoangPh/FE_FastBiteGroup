"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Search, Users, MessageSquare, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupCard } from "@/components/features/groups/GroupCard";
import { getPublicGroups } from "@/lib/api/customer/groups";
import { GroupFilterType } from "@/types/customer/group";
import { useDebounce } from "@/hooks/useDebounce";

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<GroupFilterType>(
    GroupFilterType.All
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "publicGroups",
      { searchTerm: debouncedSearchTerm, filter: activeFilter },
    ],
    queryFn: ({ pageParam = 1 }) =>
      getPublicGroups({
        pageParam,
        searchTerm: debouncedSearchTerm,
        filterType: activeFilter,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Trigger infinite scroll when the sentinel element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allGroups = data?.pages.flatMap((page) => page.items) ?? [];
  const totalGroups = data?.pages[0]?.totalRecords ?? 0;

  const handleFilterChange = (filter: GroupFilterType) => {
    setActiveFilter(filter);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Không thể tải danh sách nhóm
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi tải danh sách nhóm"}
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        size="sm"
      >
        Thử lại
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Không tìm thấy nhóm nào
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {debouncedSearchTerm
          ? `Không có nhóm nào phù hợp với "${debouncedSearchTerm}"`
          : "Hiện tại chưa có nhóm công khai nào"}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Khám phá nhóm
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tìm và tham gia các nhóm chat và cộng đồng thú vị
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-6">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            maxLength={50}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={activeFilter}
          onValueChange={(value) =>
            handleFilterChange(value as GroupFilterType)
          }
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger
              value={GroupFilterType.All}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value={GroupFilterType.Chat}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Nhóm chat
            </TabsTrigger>
            <TabsTrigger
              value={GroupFilterType.Community}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Cộng đồng
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results Count */}
        {!isLoading && !isError && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalGroups > 0 ? (
              <>
                Hiển thị {allGroups.length} trong tổng số{" "}
                {totalGroups.toLocaleString()} nhóm
              </>
            ) : (
              "Không có nhóm nào"
            )}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState />
        ) : allGroups.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allGroups
                .filter((group) => group && group.groupId)
                .map((group) => (
                  <GroupCard key={group.groupId} group={group} />
                ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-4 mt-8">
              {isFetchingNextPage && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    Đang tải thêm...
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
