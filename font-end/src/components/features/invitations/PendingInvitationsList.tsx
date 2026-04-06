"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Loader2 } from "lucide-react";

import { getMyPendingInvitations } from "@/lib/api/customer/invitations";
import { GroupInvitationCard } from "@/components/features/invitations/GroupInvitationCard";
import { Skeleton } from "@/components/ui/skeleton";

export function PendingInvitationsList() {
  const {
    data: invitations,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pendingInvitations"],
    queryFn: getMyPendingInvitations,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">Lời mời vào nhóm</h3>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="text-center py-6">
        <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-destructive">
          Lỗi tải danh sách lời mời: {error?.message}
        </p>
      </div>
    );
  }

  // Empty State
  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-6">
        <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Bạn không có lời mời nào đang chờ.
        </p>
      </div>
    );
  }

  // Success State with Data
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium">
          Lời mời vào nhóm ({invitations.length})
        </h3>
      </div>

      {invitations.map((invitation) => (
        <GroupInvitationCard
          key={invitation.invitationId}
          invitation={invitation}
        />
      ))}
    </div>
  );
}
