"use client";

import { useEffect, useState } from "react";
import { usePresenceStore } from "@/store/presenceStore";
import { getUserStatuses } from "@/lib/api/presence";
import { handleApiError } from "@/lib/utils/errorUtils";
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

interface GroupMemberListProps {
  members: GroupMember[];
  groupId?: string;
}

/**
 * Example component demonstrating how to use the getUserStatuses API service
 * to fetch initial presence statuses for multiple users.
 */
export const GroupMemberList = ({ members, groupId }: GroupMemberListProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setStatusesBatch } = usePresenceStore();

  // Extract user IDs from members
  const userIdsToFetch = members.map((member) => member.id);

  // Fetch initial presence statuses when component mounts or members change
  useEffect(() => {
    const fetchInitialStatuses = async () => {
      if (userIdsToFetch.length === 0) return;

      setIsLoading(true);
      try {
        const response = await getUserStatuses(userIdsToFetch);

        if (response.success && response.data) {
          // Use the batch update action in the Zustand store
          setStatusesBatch(response.data);
          console.log(
            "✅ Fetched initial statuses for",
            response.data.length,
            "users"
          );
        }
      } catch (error) {
        // Use the standard error handling utility
        handleApiError(error, "Failed to fetch member statuses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialStatuses();
  }, [userIdsToFetch, setStatusesBatch]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (userIdsToFetch.length === 0) return;

    setIsLoading(true);
    try {
      const response = await getUserStatuses(userIdsToFetch);

      if (response.success && response.data) {
        setStatusesBatch(response.data);
        console.log("✅ Refreshed statuses for", response.data.length, "users");
      }
    } catch (error) {
      handleApiError(error, "Failed to refresh member statuses");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="customer-glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="customer-gradient-text flex items-center gap-2">
            <Users className="h-5 w-5" />
            Thành viên nhóm ({members.length})
          </CardTitle>
          <Button
            onClick={handleRefresh}
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
