"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { searchGroupMembers } from "@/lib/api/admin/groups";
import { GroupMemberSearchResultDto } from "@/types/admin/group.types";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface GroupMemberSearchComboboxProps {
  value: GroupMemberSearchResultDto | null; // Controlled value - the currently selected member
  onSelectUser: (member: GroupMemberSearchResultDto | null) => void; // Callback when member is selected or cleared
  searchQuery: string; // Controlled search query text
  onSearchQueryChange: (query: string) => void; // Callback when search query changes
  groupId: string; // Required group ID for searching members
  placeholder?: string; // Custom placeholder text
  className?: string; // Additional CSS classes
}

// Skeleton loader component for initial loading state
function MemberSkeletonLoader() {
  return (
    <div className="space-y-3 px-4 py-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 animate-pulse">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Error state component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 text-center">
      <Alert variant="destructive" className="border-destructive/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
        <RefreshCw className="h-3 w-3 mr-2" />
        Thử lại
      </Button>
    </div>
  );
}

export function GroupMemberSearchCombobox({
  value, // Use the controlled value prop
  onSelectUser,
  searchQuery, // Use the controlled search query prop
  onSearchQueryChange, // Use the controlled search query change callback
  groupId,
  placeholder = "Tìm kiếm thành viên nhóm...",
  className,
}: GroupMemberSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [hasInitialFocus, setHasInitialFocus] = useState(false);

  // Debounce the search query to prevent excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Determine if we should fetch data
  const shouldFetch =
    open &&
    (debouncedQuery.length >= 2 ||
      (debouncedQuery.length === 0 && hasInitialFocus));

  // Infinite query for paginated results
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
    queryKey: ["group-member-search", groupId, debouncedQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        searchTerm: debouncedQuery,
        pageNumber: pageParam as number,
        pageSize: debouncedQuery.length >= 2 ? 20 : 5, // Smaller initial results
      };
      return searchGroupMembers(groupId, params);
    },
    enabled: shouldFetch,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return undefined;
      const { pageNumber, totalPages } = lastPage.data;
      return pageNumber < totalPages ? pageNumber + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Combine all pages of results and remove duplicates
  const allMembers = useMemo(() => {
    if (!data?.pages) return [];

    const members: GroupMemberSearchResultDto[] = [];
    const seenIds = new Set<string>();

    data.pages.forEach((page) => {
      if (page?.data?.items && Array.isArray(page.data.items)) {
        page.data.items.forEach((member: GroupMemberSearchResultDto) => {
          if (member?.userId && !seenIds.has(member.userId)) {
            seenIds.add(member.userId);
            members.push(member);
          }
        });
      }
    });

    return members;
  }, [data]);

  // Handle initial focus to trigger initial data fetch
  const handlePopoverOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen && !hasInitialFocus) {
        setHasInitialFocus(true);
      }
    },
    [hasInitialFocus]
  );

  // Handle member selection
  const handleSelectMember = useCallback(
    (member: GroupMemberSearchResultDto) => {
      setOpen(false);
      onSelectUser(member);
    },
    [onSelectUser]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      // Update parent's search query state
      onSearchQueryChange(value);
      if (!value) {
        // Clear the selected member in parent when input is cleared
        onSelectUser(null);
      }
    },
    [onSearchQueryChange, onSelectUser]
  );

  // Handle scroll to bottom for infinite loading
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const threshold = 100; // pixels from bottom

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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Don't clear searchQuery here - let parent handle it
      // Don't clear selectedMember here - let parent handle it
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Tìm kiếm thành viên nhóm"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground", // Use value prop instead of selectedMember
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? ( // Use value prop instead of selectedMember
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={value.avatarUrl} alt={value.fullName} />
                  <AvatarFallback className="text-xs">
                    {value.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{value.fullName}</span>
                <Badge variant="secondary" className="text-xs">
                  {value.roleInGroup}
                </Badge>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>{placeholder}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        {/* 
          CRITICAL: shouldFilter={false} is required because:
          1. Shadcn/UI Command performs client-side filtering by comparing search input against CommandItem value props
          2. Our CommandItem values are user IDs (GUIDs) which can't match user-typed names
          3. This causes all search results to be hidden even though the API successfully fetches them
          4. By disabling internal filtering, we rely entirely on backend API search results
        */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            maxLength={50} // Limit input length
            value={searchQuery} // Use controlled searchQuery prop
            onValueChange={handleInputChange} // Use controlled onSearchQueryChange callback
            className="h-9"
            aria-label="Nhập để tìm kiếm thành viên nhóm"
          />

          <CommandList
            className="max-h-[300px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {/* Initial Loading State */}
            {isLoading && !data && <MemberSkeletonLoader />}

            {/* Error State */}
            {isError && <ErrorState onRetry={() => refetch()} />}

            {/* Empty State */}
            {!isLoading &&
              !isError &&
              allMembers.length === 0 &&
              debouncedQuery && (
                <CommandEmpty>
                  <div className="flex flex-col items-center py-6 text-center">
                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy thành viên nào
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                </CommandEmpty>
              )}

            {/* Initial State Guidance */}
            {!isLoading &&
              !isError &&
              allMembers.length === 0 &&
              !debouncedQuery &&
              hasInitialFocus && (
                <div className="flex flex-col items-center py-6 text-center">
                  <User className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Bắt đầu nhập để tìm kiếm thành viên nhóm
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tìm kiếm theo tên thành viên
                  </p>
                </div>
              )}

            {/* Member Results */}
            {allMembers.length > 0 && (
              <CommandGroup>
                {allMembers.map((member) => (
                  <CommandItem
                    key={member.userId}
                    value={member.userId} // Note: This is used for internal Command component logic, not for filtering
                    onSelect={() => handleSelectMember(member)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50"
                    aria-label={`Chọn ${member.fullName} (${member.roleInGroup})`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.avatarUrl}
                        alt={member.fullName}
                      />
                      <AvatarFallback className="text-sm">
                        {member.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {member.fullName}
                      </span>
                      <Badge variant="outline" className="w-fit text-xs">
                        {member.roleInGroup}
                      </Badge>
                    </div>

                    {value?.userId === member.userId && ( // Use value prop instead of selectedMember
                      <Check
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </CommandItem>
                ))}

                {/* Loading More Indicator */}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải thêm...
                  </div>
                )}

                {/* End of Results */}
                {!hasNextPage && allMembers.length > 0 && (
                  <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t">
                    Đã hiển thị tất cả kết quả
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
