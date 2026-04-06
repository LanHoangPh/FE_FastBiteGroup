"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { respondToGroupInvitation } from "@/lib/api/customer/invitations";
import {
  GroupInvitationDto,
  RespondToInvitationDto,
} from "@/types/customer/invitation";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GroupInvitationCardProps {
  invitation: GroupInvitationDto;
}

export function GroupInvitationCard({ invitation }: GroupInvitationCardProps) {
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: (variables: {
      invitationId: number;
      payload: RespondToInvitationDto;
    }) => respondToGroupInvitation(variables.invitationId, variables.payload),
    onSuccess: (_, variables) => {
      if (variables.payload.accept) {
        toast.success(`Chào mừng bạn đến với nhóm "${invitation.groupName}"!`);
        // Invalidate everything related to group membership
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      } else {
        toast.info("Đã từ chối lời mời vào nhóm.");
      }
      // Always invalidate the invitations list itself
      queryClient.invalidateQueries({ queryKey: ["pendingInvitations"] });
    },
    onError: (error) => {
      handleApiError(error, "Không thể phản hồi lời mời");
    },
  });

  const handleAccept = () => {
    respondMutation.mutate({
      invitationId: invitation.invitationId,
      payload: { accept: true },
    });
  };

  const handleDecline = () => {
    respondMutation.mutate({
      invitationId: invitation.invitationId,
      payload: { accept: false },
    });
  };

  const getGroupInitials = (groupName: string) => {
    return groupName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
      {/* Group Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={invitation.groupAvatarUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getGroupInitials(invitation.groupName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{invitation.groupName}</p>
          <p className="text-xs text-muted-foreground">
            Lời mời từ {invitation.invitedByName}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 ml-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDecline}
          disabled={respondMutation.isPending}
          className="h-8 px-3 text-xs"
        >
          Từ chối
        </Button>
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={respondMutation.isPending}
          className="h-8 px-3 text-xs"
        >
          {respondMutation.isPending ? "Đang xử lý..." : "Chấp nhận"}
        </Button>
      </div>
    </div>
  );
}
