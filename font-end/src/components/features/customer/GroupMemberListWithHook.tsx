"use client";

import { usePresenceStatuses } from "@/hooks/usePresenceStatuses";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface GroupMemberListWithHookProps {
  members: GroupMember[];
}

/**
 * Simplified version using the usePresenceStatuses hook.
 * This demonstrates the cleaner approach with the custom hook.
 */
export const GroupMemberListWithHook = ({
  members,
}: GroupMemberListWithHookProps) => {
  const userIds = members.map((member) => member.id);
  const { isLoading, refresh } = usePresenceStatuses(userIds, {
    onSuccess: (count) => {
      console.log("✅ Fetched statuses for", count, "users");
    },
    onError: (error) => {
      console.error("❌ Failed to fetch statuses:", error);
    },
  });

  return (
    <Card className="customer-glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="customer-gradient-text flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên nhóm ({members.length})
          </CardTitle>
          <Button
            onClick={refresh}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <UserAvatarWithStatus
                userId={member.id}
                src={member.avatarUrl}
                fallback={member.name.charAt(0).toUpperCase()}
                className="h-10 w-10"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">
                  {member.name}
                </h3>
                <p className="text-sm text-white/60 truncate">{member.email}</p>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Chưa có thành viên nào</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 text-white/60 mx-auto mb-2 animate-spin" />
            <p className="text-white/60 text-sm">Đang tải trạng thái...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
