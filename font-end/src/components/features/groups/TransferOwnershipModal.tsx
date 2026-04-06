"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Users, Crown } from "lucide-react";

import {
  getGroupMembers,
  transferOwnershipAndLeave,
} from "@/lib/api/customer/groups";
import { GroupRole, GroupMemberListDto } from "@/types/customer/group";
import { handleApiError } from "@/lib/utils/errorUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TransferOwnershipModalProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function TransferOwnershipModal({
  groupId,
  isOpen,
  onOpenChange,
}: TransferOwnershipModalProps) {
  const [selectedNewAdminId, setSelectedNewAdminId] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch group members
  const {
    data: membersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groupMembers", groupId, "transfer"],
    queryFn: () => getGroupMembers(groupId, { pageParam: 1, pageSize: 100 }),
    enabled: isOpen,
  });

  // Filter out current user and only show members who can become admin
  const eligibleMembers =
    membersData?.items?.filter((member) => member.role !== GroupRole.Admin) ||
    [];

  // Transfer ownership mutation
  const transferMutation = useMutation({
    mutationFn: () =>
      transferOwnershipAndLeave(groupId, {
        newAdminUserId: selectedNewAdminId,
      }),
    onSuccess: () => {
      toast.success("Bạn đã chuyển quyền quản trị và rời khỏi nhóm.");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      onOpenChange(false);
      router.push("/chat");
    },
    onError: (error) => {
      handleApiError(error, "Không thể chuyển quyền quản trị");
    },
  });

  const handleTransferAndLeave = () => {
    if (!selectedNewAdminId) return;
    transferMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: GroupRole) => {
    switch (role) {
      case GroupRole.Admin:
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Trưởng nhóm
          </Badge>
        );
      case GroupRole.Moderator:
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Phó nhóm
          </Badge>
        );
      default:
        return <Badge variant="secondary">Thành viên</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Chuyển quyền quản trị
          </DialogTitle>
          <DialogDescription>
            Bạn là quản trị viên cuối cùng của nhóm. Vui lòng chọn thành viên
            khác để chuyển quyền quản trị trước khi rời khỏi nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Không thể tải danh sách thành viên
              </p>
            </div>
          ) : eligibleMembers.length === 0 ? (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Không có thành viên nào khác trong nhóm
              </p>
            </div>
          ) : (
            <ScrollArea className="h-64 pr-4">
              <RadioGroup
                value={selectedNewAdminId}
                onValueChange={setSelectedNewAdminId}
              >
                <div className="space-y-2">
                  {eligibleMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center space-x-3"
                    >
                      <RadioGroupItem
                        value={member.userId}
                        id={member.userId}
                      />
                      <Label
                        htmlFor={member.userId}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white text-sm">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(member.role)}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={transferMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleTransferAndLeave}
            disabled={
              !selectedNewAdminId ||
              transferMutation.isPending ||
              eligibleMembers.length === 0
            }
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {transferMutation.isPending
              ? "Đang chuyển..."
              : "Chuyển quyền và rời nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
