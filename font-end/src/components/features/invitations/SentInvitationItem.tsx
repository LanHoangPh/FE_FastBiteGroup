"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { SentGroupInvitationDto, InvitationStatus } from "@/types/customer/invitation";
import { useAuthStore } from "@/store/authStore";
import { revokeInvitation } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";

interface SentInvitationItemProps {
  invitation: SentGroupInvitationDto;
  groupId: string;
}

export function SentInvitationItem({ invitation, groupId }: SentInvitationItemProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.Pending:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Đang chờ
          </Badge>
        );
      case InvitationStatus.Accepted:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Đã chấp nhận
          </Badge>
        );
      case InvitationStatus.Declined:
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Đã từ chối
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Không xác định";
    }
  };

  const getInviterDisplayName = () => {
    // Check if the inviter is the current logged-in user
    if (user && invitation.invitedByUserId === user.id) {
      return "Bạn";
    }
    return invitation.invitedByFullName;
  };

  // Mutation for revoking invitation
  const revokeMutation = useMutation({
    mutationFn: () => revokeInvitation(groupId, invitation.invitationId),
    onSuccess: () => {
      toast.success("Lời mời đã được thu hồi thành công.");
      // Invalidate the query to refresh the list of sent invitations
      queryClient.invalidateQueries({ 
        queryKey: ["sentInvitations", groupId] 
      });
      setIsRevokeDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error, "Thu hồi lời mời thất bại");
    },
  });

  return (
    <>
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {/* Invited User Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={invitation.invitedUserAvatarUrl || undefined} 
            alt={invitation.invitedUserFullName} 
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
            {getInitials(invitation.invitedUserFullName)}
          </AvatarFallback>
        </Avatar>

        {/* Invitation Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {invitation.invitedUserFullName}
            </h4>
            {getStatusBadge(invitation.status)}
          </div>
          
          <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Được mời bởi: <span className="font-medium">{getInviterDisplayName()}</span>
            </span>
            <span>
              Thời gian: {formatDate(invitation.invitedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Revoke button for pending invitations */}
      {invitation.status === InvitationStatus.Pending && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsRevokeDialogOpen(true)}
          disabled={revokeMutation.isPending}
          className="shrink-0"
        >
          Thu hồi
        </Button>
      )}
    </div>

    {/* Revoke Confirmation Dialog */}
    <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn thu hồi lời mời này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Lời mời gửi đến{" "}
            <span className="font-medium">{invitation.invitedUserFullName}</span>{" "}
            sẽ bị thu hồi và họ sẽ không thể tham gia nhóm thông qua lời mời này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={revokeMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => revokeMutation.mutate()}
            disabled={revokeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {revokeMutation.isPending ? "Đang xử lý..." : "Thu hồi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
