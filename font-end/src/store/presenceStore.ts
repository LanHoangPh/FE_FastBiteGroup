// stores/presenceStore.ts

// =================================================================
// PRESENCE STATE MANAGEMENT
// Zustand store for managing real-time user presence statuses.
// =================================================================

import { create } from "zustand";
import { UserPresenceStatus } from "@/types/customer/models";
import { UserStatusDto } from "@/types/customer/presence.types";

interface PresenceState {
  statuses: Record<string, UserPresenceStatus>;
  
  // Actions
  updateUserStatus: (userId: string, status: UserPresenceStatus) => void;
  setStatusesBatch: (userStatuses: UserStatusDto[]) => void;
  clearAllStatuses: () => void;
  
  // Selectors
  getOnlineUserIds: () => string[];
  getOfflineUserIds: () => string[];
  getUserStatus: (userId: string) => UserPresenceStatus;
  isUserOnline: (userId: string) => boolean;
  getOnlineCount: () => number;
  getUsersByStatus: (status: UserPresenceStatus) => string[];
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  statuses: {},
  
  // Actions
  updateUserStatus: (userId, status) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [userId]: status,
      },
    })),
    
  setStatusesBatch: (userStatuses) =>
    set((state) => {
      const newStatuses = { ...state.statuses };
      userStatuses.forEach((userStatus) => {
        newStatuses[userStatus.userId] = userStatus.presenceStatus;
      });
      return { statuses: newStatuses };
    }),
    
  clearAllStatuses: () =>
    set(() => ({ statuses: {} })),
  
  // Selectors
  getOnlineUserIds: () => {
    const { statuses } = get();
    return Object.entries(statuses)
      .filter(([_, status]) => status === UserPresenceStatus.Online)
      .map(([userId, _]) => userId);
  },
  
  getOfflineUserIds: () => {
    const { statuses } = get();
    return Object.entries(statuses)
      .filter(([_, status]) => status === UserPresenceStatus.Offline)
      .map(([userId, _]) => userId);
  },
  
  getUserStatus: (userId) => {
    const { statuses } = get();
    return statuses[userId] || UserPresenceStatus.Offline;
  },
  
  isUserOnline: (userId) => {
    const { statuses } = get();
    return statuses[userId] === UserPresenceStatus.Online;
  },
  
  getOnlineCount: () => {
    const { statuses } = get();
    return Object.values(statuses).filter(
      (status) => status === UserPresenceStatus.Online
    ).length;
  },
  
  getUsersByStatus: (status) => {
    const { statuses } = get();
    return Object.entries(statuses)
      .filter(([_, userStatus]) => userStatus === status)
      .map(([userId, _]) => userId);
  },
}));
