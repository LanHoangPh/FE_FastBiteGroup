// components/shared/UserCustomerNavSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { logoutUser } from "@/lib/api/auth";
import { LogOut, User, Settings, Bell, Heart, Crown } from "lucide-react";

export function UserCustomerNavSidebar() {
  const { isAuthenticated, user } = useAuthStore();
  const [avatarKey, setAvatarKey] = useState(0);

  // Force re-render when avatar changes
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarKey((prev: number) => prev + 1);
    }
  }, [user?.avatarUrl]);

  // Logout mutation logic
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logoutFromStore = useAuthStore((state) => state.logout);

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        return;
      }
      await logoutUser(refreshToken);
      return;
    },
    onSettled: () => {
      Cookies.remove("auth_token");
      logoutFromStore();
      toast.success("Bạn đã đăng xuất thành công.");
      window.location.href = "/";
    },
  });

  if (!isAuthenticated || !user) {
    // If not authenticated, show a simple user icon
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 cursor-pointer transition-all duration-200">
        <User className="h-5 w-5" />
      </div>
    );
  }

  // If authenticated, show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/50 hover:scale-105 transition-all duration-200 group"
        >
          <div className="relative">
            <Avatar
              className="h-8 w-8 ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-200"
              key={avatarKey}
            >
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-semibold">
                {user.firstName?.charAt(0).toUpperCase() ||
                  user.fullName?.charAt(0).toUpperCase() ||
                  "U"}
                {user.lastName?.charAt(0).toUpperCase() ||
                  user.fullName?.split(" ")[1]?.charAt(0).toUpperCase() ||
                  ""}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-2 shadow-xl"
        align="end"
        forceMount
      >
        {/* User Header */}
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-cyan-400/30">
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-semibold">
                {user.firstName?.charAt(0).toUpperCase() ||
                  user.fullName?.charAt(0).toUpperCase() ||
                  "U"}
                {user.lastName?.charAt(0).toUpperCase() ||
                  user.fullName?.split(" ")[1]?.charAt(0).toUpperCase() ||
                  ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-slate-900 dark:text-white text-sm font-semibold leading-none">
                  {user.fullName}
                </p>
                <Crown className="h-3 w-3 text-yellow-500" />
              </div>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-none">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem
            asChild
            className="hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg mx-1"
          >
            <Link href="/me/profile" className="flex items-center p-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-slate-900 dark:text-white font-medium">
                  Hồ sơ cá nhân
                </span>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Xem và chỉnh sửa thông tin
                </p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg mx-1"
          >
            <Link href="/me" className="flex items-center p-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-slate-900 dark:text-white font-medium">
                  Cài đặt
                </span>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Tùy chỉnh tài khoản và bảo mật
                </p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg mx-1"
          >
            <Link href="/notifications" className="flex items-center p-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-slate-900 dark:text-white font-medium">
                  Thông báo
                </span>
                <p className="text-xs text-slate-600 dark:text-white/60">
                  Quản lý thông báo
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

        {/* Logout Section */}
        <div className="py-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="hover:bg-red-500/20 rounded-lg mx-1"
              >
                <div className="flex items-center p-2 w-full">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                    <LogOut className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-red-400 font-medium">Đăng xuất</span>
                    <p className="text-xs text-red-400/60">
                      Thoát khỏi tài khoản
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="customer-glass-card border-0">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <LogOut className="h-5 w-5 text-white" />
                  </div>
                  <AlertDialogTitle className="customer-gradient-text text-lg">
                    Xác nhận đăng xuất
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-white/80">
                  Bạn có chắc chắn muốn đăng xuất khỏi FastBite Group không? Bạn
                  sẽ cần đăng nhập lại để tiếp tục sử dụng.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                  Hủy bỏ
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleLogout()}
                  disabled={isPending}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng xuất...
                    </div>
                  ) : (
                    "Đăng xuất"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
