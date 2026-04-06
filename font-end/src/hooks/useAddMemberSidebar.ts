import { create } from "zustand";

interface AddMemberSidebarState {
  isOpen: boolean;
  groupId: string | null;
  groupName: string | null;
  openSidebar: (groupId: string, groupName: string) => void;
  closeSidebar: () => void;
}

export const useAddMemberSidebar = create<AddMemberSidebarState>((set) => ({
  isOpen: false,
  groupId: null,
  groupName: null,
  openSidebar: (groupId: string, groupName: string) =>
    set({ isOpen: true, groupId, groupName }),
  closeSidebar: () => set({ isOpen: false, groupId: null, groupName: null }),
}));