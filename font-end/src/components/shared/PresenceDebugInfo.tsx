"use client";

import { usePresence } from "@/providers/PresenceProvider";
import { usePresenceStore } from "@/store/presenceStore";
import { UserPresenceStatus } from "@/types/customer/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PresenceDebugInfo = () => {
  const { changeMyStatus } = usePresence();
  const { statuses, updateUserStatus } = usePresenceStore();

  const testStatusChange = async (status: UserPresenceStatus) => {
    console.log("Testing status change to:", status);
    await changeMyStatus(status);
  };

  const testDirectStoreUpdate = (status: UserPresenceStatus) => {
    console.log("🧪 Testing direct store update for user1 to:", status);
    updateUserStatus("user1", status);
  };

  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="text-yellow-800 dark:text-yellow-200">
          🔧 Presence Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Current Statuses:
          </h4>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            {Object.keys(statuses).length === 0 ? (
              <p>No statuses loaded yet</p>
            ) : (
              <pre className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(statuses, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Test Status Changes (via SignalR):
          </h4>
          <div className="flex gap-2 flex-wrap mb-4">
            <Button
              size="sm"
              onClick={() => testStatusChange(UserPresenceStatus.Online)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Online
            </Button>
            <Button
              size="sm"
              onClick={() => testStatusChange(UserPresenceStatus.Busy)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Busy
            </Button>
            <Button
              size="sm"
              onClick={() => testStatusChange(UserPresenceStatus.Absent)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Absent
            </Button>
            <Button
              size="sm"
              onClick={() => testStatusChange(UserPresenceStatus.Offline)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Offline
            </Button>
          </div>

          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Test Direct Store Update (user1):
          </h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => testDirectStoreUpdate(UserPresenceStatus.Online)}
              className="bg-green-400 hover:bg-green-500 text-white"
            >
              Direct Online
            </Button>
            <Button
              size="sm"
              onClick={() => testDirectStoreUpdate(UserPresenceStatus.Busy)}
              className="bg-red-400 hover:bg-red-500 text-white"
            >
              Direct Busy
            </Button>
            <Button
              size="sm"
              onClick={() => testDirectStoreUpdate(UserPresenceStatus.Absent)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white"
            >
              Direct Absent
            </Button>
            <Button
              size="sm"
              onClick={() => testDirectStoreUpdate(UserPresenceStatus.Offline)}
              className="bg-gray-400 hover:bg-gray-500 text-white"
            >
              Direct Offline
            </Button>
          </div>
        </div>

        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          <p>Check browser console for detailed logs</p>
          <p>
            Make sure your backend SignalR hub is running on:{" "}
            {process.env.NEXT_PUBLIC_API_URL}/hubs/presence
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
