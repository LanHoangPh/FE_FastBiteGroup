"use client";

import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { usePresence } from "@/providers/PresenceProvider";
import { UserPresenceStatus } from "@/types/customer/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Demo component showing how to use the presence system.
 * This component demonstrates:
 * - Displaying user avatars with status indicators
 * - Changing your own presence status
 */
export const PresenceDemo = () => {
  const { changeMyStatus } = usePresence();

  const handleStatusChange = async (status: UserPresenceStatus) => {
    await changeMyStatus(status);
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="customer-glass-card">
        <CardHeader>
          <CardTitle className="customer-gradient-text">
            Presence System Demo
          </CardTitle>
          <CardDescription>
            This demo shows how the real-time presence system works.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example user avatars with different statuses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Avatars with Status</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <UserAvatarWithStatus
                  userId="user1"
                  src="/api/placeholder/40/40"
                  fallback="JD"
                  className="h-12 w-12"
                />
                <p className="text-sm mt-2">John Doe</p>
              </div>
              <div className="text-center">
                <UserAvatarWithStatus
                  userId="user2"
                  src="/api/placeholder/40/40"
                  fallback="AS"
                  className="h-12 w-12"
                />
                <p className="text-sm mt-2">Alice Smith</p>
              </div>
              <div className="text-center">
                <UserAvatarWithStatus
                  userId="user3"
                  src="/api/placeholder/40/40"
                  fallback="BJ"
                  className="h-12 w-12"
                />
                <p className="text-sm mt-2">Bob Johnson</p>
              </div>
            </div>
          </div>

          {/* Status change controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Your Status</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleStatusChange(UserPresenceStatus.Online)}
                className="bg-green-600 hover:bg-green-700"
              >
                Online
              </Button>
              <Button
                onClick={() => handleStatusChange(UserPresenceStatus.Busy)}
                className="bg-red-600 hover:bg-red-700"
              >
                Busy
              </Button>
              <Button
                onClick={() => handleStatusChange(UserPresenceStatus.Absent)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Absent
              </Button>
              <Button
                onClick={() => handleStatusChange(UserPresenceStatus.Offline)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Offline
              </Button>
            </div>
          </div>

          {/* Status legend */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Status Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Busy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Offline</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
