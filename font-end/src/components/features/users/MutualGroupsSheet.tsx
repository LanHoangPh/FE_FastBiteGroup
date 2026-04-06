"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { getMutualGroups } from "@/lib/api/customer/users";
import { MutualGroupItem } from "./MutualGroupItem";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface MutualGroupsSheetProps {
  partnerUserId: string;
  partnerFullName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function MutualGroupsSheet({
  partnerUserId,
  partnerFullName,
  isOpen,
  onOpenChange,
}: MutualGroupsSheetProps) {
  const {
    data: mutualGroups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mutualGroups", partnerUserId],
    queryFn: () => getMutualGroups(partnerUserId),
    enabled: isOpen && !!partnerUserId, // Only fetch when sheet is open
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-center text-lg font-semibold">
            Nhóm chung
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-4 px-6 pb-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <ErrorState />
          ) : !mutualGroups || mutualGroups.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {mutualGroups.map((group) => (
                <MutualGroupItem
                  key={group.groupId}
                  group={group}
                  partnerUserId={partnerUserId}
                  partnerFullName={partnerFullName}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Có lỗi xảy ra
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Không thể tải danh sách nhóm chung
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-[#ad46ff]/20 to-[#1447e6]/20 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-[#ad46ff]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Không có nhóm chung
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Bạn không có nhóm chung nào với người này
      </p>
    </div>
  );
}
