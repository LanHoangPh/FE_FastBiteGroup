"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MutualGroupDto } from "@/types/customer/group";
import { kickMember } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MutualGroupItemProps {
  group: MutualGroupDto;
  partnerUserId: string;
  partnerFullName: string;
}

export function MutualGroupItem({
  group,
  partnerUserId,
  partnerFullName,
}: MutualGroupItemProps) {
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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

  // Kick member mutation
  const kickMutation = useMutation({
    mutationFn: () => kickMember(group.groupId, partnerUserId),
    onSuccess: () => {
      toast.success(`Đã xóa ${partnerFullName} khỏi nhóm ${group.groupName}.`);
      queryClient.invalidateQueries({
        queryKey: ["mutualGroups", partnerUserId],
      });
      setIsKickDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error, "Không thể xóa thành viên");
      setIsKickDialogOpen(false);
    },
  });

  const handleKickClick = () => {
    setIsKickDialogOpen(true);
  };

  const handleKickConfirm = () => {
    kickMutation.mutate();
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Link
          href={`/groups/${group.groupId}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={group.groupAvatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold">
              {getInitials(group.groupName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {group.groupName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhóm chung
            </p>
          </div>
        </Link>

        {group.canKickPartner && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleKickClick}
            disabled={kickMutation.isPending}
            className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:bg-red-950 dark:border-red-800"
          >
            {kickMutation.isPending ? (
              "Đang xóa..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa
              </>
            )}
          </Button>
        )}
      </div>

      {/* Kick Confirmation Dialog */}
      <AlertDialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên khỏi nhóm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{partnerFullName}</strong> khỏi
              nhóm <strong>{group.groupName}</strong>? Họ sẽ không thể xem tin
              nhắn hoặc tham gia nhóm này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKickConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={kickMutation.isPending}
            >
              {kickMutation.isPending ? "Đang xóa..." : "Xóa thành viên"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
