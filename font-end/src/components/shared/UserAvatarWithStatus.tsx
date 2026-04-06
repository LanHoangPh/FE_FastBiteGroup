"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePresenceStore } from "@/store/presenceStore";
import { UserPresenceStatus } from "@/types/customer/models";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  src?: string;
  fallback: string;
  className?: string;
  initialStatus?: UserPresenceStatus;
}

const statusColorMap: Record<UserPresenceStatus, string> = {
  [UserPresenceStatus.Online]: "bg-green-500",
  [UserPresenceStatus.Offline]: "bg-gray-400",
  [UserPresenceStatus.Busy]: "bg-red-500",
  [UserPresenceStatus.Absent]: "bg-yellow-500",
};

export const UserAvatarWithStatus = ({
  userId,
  src,
  fallback,
  className,
  initialStatus,
}: Props) => {
  const userStatus = usePresenceStore((state) => state.statuses[userId]);
  // Prioritize the live status, but fall back to the initial status from the API,
  // and finally default to Offline.
  const status = userStatus ?? initialStatus ?? UserPresenceStatus.Offline;

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <Avatar className={className}>
        <AvatarImage src={src} alt={fallback} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
          statusColorMap[status]
        )}
      />
    </div>
  );
};
