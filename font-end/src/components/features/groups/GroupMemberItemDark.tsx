"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Shield, Star } from "lucide-react";
import { toast } from "sonner";

import {
  GroupMemberListDto,
  GroupRole,
  ManageMemberAction,
} from "@/types/customer/group";
import { manageMemberRole, kickMember } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface GroupMemberItemDarkProps {
  member: GroupMemberListDto;
  groupId: string;
}

export function GroupMemberItemDark({
  member,
  groupId,
}: GroupMemberItemDarkProps) {
  const queryClient = useQueryClient();
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);

  const {user} = useAuthStore();

  // Mutation for managing member role (promote/demote)
  const manageRoleMutation = useMutation({
    mutationFn: (action: ManageMemberAction) =>
      manageMemberRole(groupId, member.userId, { action }),
    onSuccess: (_, action) => {
      const actionText =
        action === ManageMemberAction.PromoteToModerator
          ? "đã được thăng cấp lên Moderator"
          : "đã được giáng cấp xuống Thành viên";
      toast.success(`${member.fullName} ${actionText}`);
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
    onError: (error: any) => {
      handleApiError(error, "Thay đổi vai trò thất bại");
    },
  });

  // Mutation for kicking member
  const kickMemberMutation = useMutation({
    mutationFn: () => kickMember(groupId, member.userId),
    onSuccess: () => {
      toast.success(`${member.fullName} đã bị xóa khỏi nhóm`);
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      setIsKickDialogOpen(false);
    },
    onError: (error: any) => {
      handleApiError(error, "Xóa thành viên thất bại");
    },
  });
  const getRoleBadgeVariant = (role: GroupRole) => {
    switch (role) {
      case GroupRole.Admin:
        return "bg-purple-600/20 text-purple-300 border-purple-500/30";
      case GroupRole.Moderator:
        return "bg-blue-600/20 text-blue-300 border-blue-500/30";
      case GroupRole.Member:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-500/30";
    }
  };
  const getMemberDisplayName = () => {
    // Check if the inviter is the current logged-in user
    if (user && member.userId === user.id) {
      return "Bạn";
    }
    return member.fullName;
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

  const getRoleDisplayName = (role: GroupRole) => {
    switch (role) {
      case GroupRole.Admin:
        return "Trưởng nhóm";
      case GroupRole.Moderator:
        return "Moderator";
      case GroupRole.Member:
        return "Thành viên";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if context menu should be shown based on API-provided permission flags
  const showMenu = member.canManageRole || member.canKick;

  const handlePromote = () => {
    manageRoleMutation.mutate(ManageMemberAction.PromoteToModerator);
  };

  const handleDemote = () => {
    manageRoleMutation.mutate(ManageMemberAction.DemoteToMember);
  };

  const handleKickClick = () => {
    setIsKickDialogOpen(true);
  };

  const handleConfirmKick = () => {
    kickMemberMutation.mutate();
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
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
            <p className="font-medium truncate text-white">{getMemberDisplayName()}</p>
            {/* Show role badge only for non-members or when it's meaningful */}
            {member.role !== GroupRole.Member && (
              <Badge
                className={cn(
                  "text-xs flex items-center gap-1 border",
                  getRoleBadgeVariant(member.role)
                )}
              >
                {getRoleIcon(member.role)}
                {getRoleDisplayName(member.role)}
              </Badge>
            )}
          </div>
          {/* For members, show role as subtitle */}
          {member.role === GroupRole.Member && (
            <p className="text-xs text-gray-400">
              {getRoleDisplayName(member.role)}
            </p>
          )}
        </div>

        {/* Actions */}
        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                disabled={
                  manageRoleMutation.isPending || kickMemberMutation.isPending
                }
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Mở menu hành động</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border-gray-700"
            >
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

      {/* Kick Confirmation Dialog */}
      <AlertDialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Xác nhận xóa thành viên
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa {member.fullName} khỏi nhóm không? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
              disabled={kickMemberMutation.isPending}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmKick}
              disabled={kickMemberMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {kickMemberMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
