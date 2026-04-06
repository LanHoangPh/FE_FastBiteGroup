"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Search, Loader2, AlertCircle, Mail } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSentInvitationsForGroup } from "@/lib/api/customer/groups";
import { InvitationStatus } from "@/types/customer/invitation";
import { SentInvitationItem } from "./SentInvitationItem";
import { cn } from "@/lib/utils";

interface SentInvitationsModalProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SentInvitationsModal({
  groupId,
  isOpen,
  onOpenChange,
}: SentInvitationsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState<InvitationStatus | null>(null);

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Dynamic query key incorporating groupId, status filter, and search term
  const queryKey = [
    "sentInvitations",
    groupId,
    { status: activeStatus, searchTerm: debouncedSearchTerm },
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const result = await getSentInvitationsForGroup(groupId, {
          pageParam,
          pageSize: 20,
          status: activeStatus || undefined,
          searchTerm: debouncedSearchTerm || undefined,
        });
        
        console.log('[SentInvitationsModal] API Response:', result);
        
        // Validate the response structure more specifically
        if (!result || typeof result !== 'object') {
          console.error('[SentInvitationsModal] Invalid result type:', typeof result, result);
          throw new Error(`Invalid response format: expected object, got ${typeof result}`);
        }
        
        // Check for required PagedResult properties and provide fallbacks
        const normalizedResult = {
          pageNumber: typeof result.pageNumber === 'number' ? result.pageNumber : pageParam,
          totalPages: typeof result.totalPages === 'number' ? result.totalPages : 1,
          totalRecords: typeof result.totalRecords === 'number' ? result.totalRecords : 0,
          items: Array.isArray(result.items) ? result.items : [],
        };
        
        // Log warnings for missing properties
        if (typeof result.pageNumber !== 'number') {
          console.warn('[SentInvitationsModal] Missing pageNumber, using fallback:', pageParam);
        }
        if (typeof result.totalPages !== 'number') {
          console.warn('[SentInvitationsModal] Missing totalPages, using fallback: 1');
        }
        if (!Array.isArray(result.items)) {
          console.warn('[SentInvitationsModal] Missing items array, using empty array');
        }
        
        return normalizedResult;
      } catch (error) {
        console.error('[SentInvitationsModal] API Error:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      // Handle case where lastPage might be null or undefined
      if (!lastPage || typeof lastPage.pageNumber !== 'number' || typeof lastPage.totalPages !== 'number') {
        return undefined;
      }
      
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: isOpen && !!groupId, // Only fetch when modal is open and groupId exists
    retry: (failureCount, error) => {
      // Don't retry on 404 or 403 errors
      const axiosError = error as any;
      if (axiosError?.response?.status === 404 || axiosError?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const invitations =
    data?.pages
      ?.filter((page) => page && Array.isArray(page.items))
      ?.flatMap((page) => page.items)
      ?.filter(Boolean) ?? [];

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Status filter options
  const statusFilters = [
    { label: "Tất cả", value: null },
    { label: "Đang chờ", value: InvitationStatus.Pending },
    { label: "Đã chấp nhận", value: InvitationStatus.Accepted },
    { label: "Đã từ chối", value: InvitationStatus.Declined },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lời mời đã gửi</DialogTitle>
          <DialogDescription>
            Xem danh sách tất cả lời mời tham gia nhóm đã được gửi đi
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên người được mời..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <Button
                key={filter.label}
                variant={activeStatus === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus(filter.value)}
                className={cn(
                  "text-xs",
                  activeStatus === filter.value &&
                    "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Invitations List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <ErrorState error={error} />
            ) : invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <SentInvitationItem
                    key={invitation.invitationId}
                    invitation={invitation}
                    groupId={groupId}
                  />
                ))}

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="h-4">
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 animate-ping" />
                        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState searchTerm={debouncedSearchTerm} activeStatus={activeStatus} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }: { error: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Có lỗi xảy ra
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Không thể tải danh sách lời mời đã gửi. Vui lòng thử lại sau.
      </p>
      {error?.message && (
        <p className="text-xs text-red-500 mt-2">
          {error.message}
        </p>
      )}
    </div>
  );
}

function EmptyState({ 
  searchTerm, 
  activeStatus 
}: { 
  searchTerm: string; 
  activeStatus: InvitationStatus | null; 
}) {
  const getEmptyMessage = () => {
    if (searchTerm) {
      return `Không tìm thấy lời mời nào với từ khóa "${searchTerm}"`;
    }
    if (activeStatus) {
      const statusText = activeStatus === InvitationStatus.Pending 
        ? "đang chờ" 
        : activeStatus === InvitationStatus.Accepted 
        ? "đã chấp nhận" 
        : "đã từ chối";
      return `Không có lời mời nào ${statusText}`;
    }
    return "Chưa có lời mời nào được gửi cho nhóm này";
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Không có lời mời
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {getEmptyMessage()}
      </p>
    </div>
  );
}
