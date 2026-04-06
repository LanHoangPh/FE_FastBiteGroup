// Utility functions for presence system

import { UserPresenceStatus } from "@/types/customer/models";

/**
 * Get display text for presence status in Vietnamese
 */
export function getPresenceStatusText(status: UserPresenceStatus): string {
  switch (status) {
    case UserPresenceStatus.Online:
      return "Đang hoạt động";
    case UserPresenceStatus.Busy:
      return "Đang bận";
    case UserPresenceStatus.Absent:
      return "Vắng mặt";
    case UserPresenceStatus.Offline:
    default:
      return "Ngoại tuyến";
  }
}

/**
 * Get CSS color classes for presence status
 */
export function getPresenceStatusColor(status: UserPresenceStatus): {
  text: string;
  bg: string;
  dot: string;
} {
  switch (status) {
    case UserPresenceStatus.Online:
      return {
        text: "text-green-600",
        bg: "bg-green-100",
        dot: "bg-green-500",
      };
    case UserPresenceStatus.Busy:
      return {
        text: "text-red-600",
        bg: "bg-red-100",
        dot: "bg-red-500",
      };
    case UserPresenceStatus.Absent:
      return {
        text: "text-yellow-600",
        bg: "bg-yellow-100",
        dot: "bg-yellow-500",
      };
    case UserPresenceStatus.Offline:
    default:
      return {
        text: "text-gray-500",
        bg: "bg-gray-100",
        dot: "bg-gray-400",
      };
  }
}

/**
 * Get icon name for presence status (for Lucide React icons)
 */
export function getPresenceStatusIcon(status: UserPresenceStatus): string {
  switch (status) {
    case UserPresenceStatus.Online:
      return "Circle";
    case UserPresenceStatus.Busy:
      return "Minus";
    case UserPresenceStatus.Absent:
      return "Clock";
    case UserPresenceStatus.Offline:
    default:
      return "CircleDot";
  }
}

/**
 * Check if a status indicates the user is available for communication
 */
export function isUserAvailable(status: UserPresenceStatus): boolean {
  return status === UserPresenceStatus.Online;
}

/**
 * Get priority order for sorting users by presence status
 * Lower numbers = higher priority
 */
export function getPresenceStatusPriority(status: UserPresenceStatus): number {
  switch (status) {
    case UserPresenceStatus.Online:
      return 1;
    case UserPresenceStatus.Absent:
      return 2;
    case UserPresenceStatus.Busy:
      return 3;
    case UserPresenceStatus.Offline:
    default:
      return 4;
  }
}

/**
 * Sort users by presence status (online first, offline last)
 */
export function sortUsersByPresence<T extends { userId: string }>(
  users: T[],
  userStatuses: Record<string, UserPresenceStatus>
): T[] {
  return [...users].sort((a, b) => {
    const statusA = userStatuses[a.userId] || UserPresenceStatus.Offline;
    const statusB = userStatuses[b.userId] || UserPresenceStatus.Offline;
    
    const priorityA = getPresenceStatusPriority(statusA);
    const priorityB = getPresenceStatusPriority(statusB);
    
    return priorityA - priorityB;
  });
}

/**
 * Filter users by presence status
 */
export function filterUsersByPresence<T extends { userId: string }>(
  users: T[],
  userStatuses: Record<string, UserPresenceStatus>,
  targetStatus: UserPresenceStatus
): T[] {
  return users.filter(user => {
    const status = userStatuses[user.userId] || UserPresenceStatus.Offline;
    return status === targetStatus;
  });
}

/**
 * Get online users from a list
 */
export function getOnlineUsers<T extends { userId: string }>(
  users: T[],
  userStatuses: Record<string, UserPresenceStatus>
): T[] {
  return filterUsersByPresence(users, userStatuses, UserPresenceStatus.Online);
}

/**
 * Get count of users by status
 */
export function getUserCountByStatus(
  userStatuses: Record<string, UserPresenceStatus>,
  targetStatus: UserPresenceStatus
): number {
  return Object.values(userStatuses).filter(status => status === targetStatus).length;
}

/**
 * Format last seen time for offline users
 */
export function formatLastSeen(lastSeenAt: Date | string | null): string {
  if (!lastSeenAt) {
    return "Chưa từng hoạt động";
  }

  const date = typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Vừa mới hoạt động";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

/**
 * Debounce function for presence status changes
 */
export function debouncePresenceUpdate<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 1000
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Validate presence status
 */
export function isValidPresenceStatus(status: any): status is UserPresenceStatus {
  return Object.values(UserPresenceStatus).includes(status);
}

/**
 * Get presence status from string (with fallback)
 */
export function parsePresenceStatus(status: string): UserPresenceStatus {
  if (isValidPresenceStatus(status)) {
    return status;
  }
  return UserPresenceStatus.Offline;
}
