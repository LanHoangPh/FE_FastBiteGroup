// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth.types";
import Cookies from "js-cookie";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateUserAvatar: (newAvatarUrl: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (user, accessToken, refreshToken) => {
        set({
          isAuthenticated: true,
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken || null,
        });
      },
      logout: () => {
        // Cần xóa cả cookie khi logout
        Cookies.remove("auth_token");
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
      updateUserAvatar: (newAvatarUrl) =>
        set((state) => {
          if (state.user) {
            return { user: { ...state.user, avatarUrl: newAvatarUrl } };
          }
          return state;
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
