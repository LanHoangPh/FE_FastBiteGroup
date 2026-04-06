"use client";

import { MoreHorizontal, Shield, UserX, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GroupMemberListDto,
  GroupRole,
  ManageMemberAction,
} from "@/types/customer/group";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { manageMemberRole, kickMember } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

interface GroupMemberItemProps {
  member: GroupMemberListDto;
  groupId: string;
}

export function GroupMemberItem({ member, groupId }: GroupMemberItemProps) {
  const queryClient = useQueryClient();
  const { openDialog } = useConfirmationDialog();

  // Mutation for managing member role (promote/demote)
  const manageRoleMutation = useMutation({
    mutationFn: ({ action }: { action: ManageMemberAction }) =>
      manageMemberRole(groupId, member.userId, { action }),
    onSuccess: (_, { action }) => {
      // Invalidate both group details and members list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });

      const actionText =
        action === ManageMemberAction.PromoteToModerator
          ? "thăng cấp"
          : "giáng cấp";
      toast.success(`Đã ${actionText} ${member.fullName} thành công`);
    },
    onError: (error) => {
      handleApiError(error, "Thao tác thất bại");
    },
  });

  // Mutation for kicking a member
  const kickMemberMutation = useMutation({
    mutationFn: () => kickMember(groupId, member.userId),
    onSuccess: () => {
      // Invalidate both group details and members list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });

      toast.success(`Đã xóa ${member.fullName} khỏi nhóm`);
    },
    onError: (error) => {
      handleApiError(error, "Không thể xóa thành viên");
    },
  });

  // Handler functions
  const handlePromote = () => {
    manageRoleMutation.mutate({
      action: ManageMemberAction.PromoteToModerator,
    });
  };

  const handleDemote = () => {
    manageRoleMutation.mutate({ action: ManageMemberAction.DemoteToMember });
  };

  const handleKickClick = () => {
    openDialog(
      "Xóa thành viên",
      `Bạn có chắc chắn muốn xóa ${member.fullName} khỏi nhóm?`,
      () => kickMemberMutation.mutate(),
      undefined,
      "Xóa",
      "Hủy"
    );
  };
  const getRoleBadgeVariant = (role: GroupRole) => {
    switch (role) {
      case GroupRole.Admin:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case GroupRole.Moderator:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case GroupRole.Member:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: GroupRole) => {
    switch (role) {
      case GroupRole.Admin:
        return <Shield className="h-3 w-3" />;
      case GroupRole.Moderator:
        return <Star className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Determine if current user can manage this member
  const showMenu = member.canManageRole || member.canKick;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      {/* Avatar with Status */}
      <UserAvatarWithStatus
        userId={member.userId}
        src={member.avatarUrl || undefined}
        fallback={getInitials(member.fullName)}
        initialStatus={member.presenceStatus}
        className="h-10 w-10"
      />

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium truncate text-sm">{member.fullName}</p>
          <Badge
            className={cn(
              "text-xs flex items-center gap-1",
              getRoleBadgeVariant(member.role)
            )}
          >
            {getRoleIcon(member.role)}
            {member.role}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Tham gia {formatJoinedDate(member.joinedAt)}
        </p>
      </div>

      {/* Actions */}
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mở menu hành động</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Promote to Moderator */}
            {member.canManageRole && member.role === GroupRole.Member && (
              <DropdownMenuItem
                onSelect={handlePromote}
                disabled={manageRoleMutation.isPending}
                className="text-gray-200 focus:bg-gray-800 focus:text-white"
              >
                Thăng cấp lên Moderator
              </DropdownMenuItem>
            )}
            {/* Demote to Member */}
            {member.canManageRole && member.role === GroupRole.Moderator && (
              <DropdownMenuItem
                onSelect={handleDemote}
                disabled={manageRoleMutation.isPending}
                className="text-gray-200 focus:bg-gray-800 focus:text-white"
              >
                Giáng cấp xuống Thành viên
              </DropdownMenuItem>
            )}
            {/* Kick Member */}
            {member.canKick && (
              <DropdownMenuItem
                onSelect={handleKickClick}
                disabled={kickMemberMutation.isPending}
                className="text-red-400 focus:bg-red-900/20 focus:text-red-300"
              >
                Xóa khỏi nhóm
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
