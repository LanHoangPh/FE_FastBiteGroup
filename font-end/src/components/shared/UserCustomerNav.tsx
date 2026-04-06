// components/shared/UserCustomerNav.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePresence } from "@/providers/PresenceProvider";
import { usePresenceStore } from "@/store/presenceStore";
import { UserPresenceStatus } from "@/types/customer/models";
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
import {
  LogOut,
  User,
  Settings,
  Bell,
  Heart,
  Shield,
  Sparkles,
  Crown,
} from "lucide-react";

export function UserCustomerNav() {
  const { isAuthenticated, user } = useAuthStore();
  const [avatarKey, setAvatarKey] = useState(0);
  const { changeMyStatus } = usePresence();
  const userStatus = usePresenceStore((state) =>
    user ? state.statuses[user.id] : undefined
  );
  const currentStatus = userStatus ?? UserPresenceStatus.Online;

  // Status change handler
  const handleStatusChange = async (status: UserPresenceStatus) => {
    console.log("🔄 Changing status to:", status);
    await changeMyStatus(status);

    // Temporary: Also update store directly to test UI
    if (user) {
      const { updateUserStatus } = usePresenceStore.getState();
      updateUserStatus(user.id, status);
      console.log("🔄 Updated store directly for testing");
    }
  };

  // Get status color and text
  const getStatusInfo = (status: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return {
          color: "bg-green-500",
          text: "Online",
          textColor: "text-green-400",
        };
      case UserPresenceStatus.Busy:
        return { color: "bg-red-500", text: "Bận", textColor: "text-red-400" };
      case UserPresenceStatus.Absent:
        return {
          color: "bg-yellow-500",
          text: "Vắng mặt",
          textColor: "text-yellow-400",
        };
      case UserPresenceStatus.Offline:
        return {
          color: "bg-gray-400",
          text: "Offline",
          textColor: "text-gray-400",
        };
      default:
        return {
          color: "bg-green-500",
          text: "Online",
          textColor: "text-green-400",
        };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);

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
    // If not authenticated, show login/register buttons
    return (
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <Link href="/login">Đăng nhập</Link>
        </Button>
        <Button asChild className="customer-primary-button">
          <Link href="/register">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  // If authenticated
  return (
    <div className="flex items-center gap-4">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </Button>
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-200 group"
          >
            <div className="relative">
              <Avatar
                className="h-9 w-9 ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-200"
                key={avatarKey}
              >
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold">
                  {user.firstName?.charAt(0).toUpperCase() ||
                    user.fullName?.charAt(0).toUpperCase() ||
                    "U"}
                  {user.lastName?.charAt(0).toUpperCase() ||
                    user.fullName?.split(" ")[1]?.charAt(0).toUpperCase() ||
                    ""}
                </AvatarFallback>
              </Avatar>
              {/* Status Indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusInfo.color} rounded-full border-2 border-slate-900`}
              />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 customer-glass-card border-0 p-2"
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
                  <p className="customer-gradient-text text-sm font-semibold leading-none">
                    {user.fullName}
                  </p>
                  <Crown className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="text-xs text-white/60 leading-none">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 ${statusInfo.color} rounded-full`} />
                  <span
                    className={`text-xs ${statusInfo.textColor} font-medium`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Status Change Section */}
          <div className="px-3 py-2">
            <p className="text-xs text-white/60 mb-2">Thay đổi trạng thái:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange(UserPresenceStatus.Online)}
                className={`flex-1 text-xs ${
                  currentStatus === UserPresenceStatus.Online
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                }`}
              >
                Online
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange(UserPresenceStatus.Busy)}
                className={`flex-1 text-xs ${
                  currentStatus === UserPresenceStatus.Busy
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                }`}
              >
                Bận
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange(UserPresenceStatus.Absent)}
                className={`flex-1 text-xs ${
                  currentStatus === UserPresenceStatus.Absent
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                }`}
              >
                Vắng mặt
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* Menu Items */}
          <div className="py-1">
            <DropdownMenuItem
              asChild
              className="hover:bg-white/10 rounded-lg mx-1"
            >
              <Link href="/profile" className="flex items-center p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Hồ sơ cá nhân</span>
                  <p className="text-xs text-white/60">
                    Xem và chỉnh sửa thông tin
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="hover:bg-white/10 rounded-lg mx-1"
            >
              <Link href="/settings" className="flex items-center p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Cài đặt</span>
                  <p className="text-xs text-white/60">Tùy chỉnh ứng dụng</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="hover:bg-white/10 rounded-lg mx-1"
            >
              <Link href="/notifications" className="flex items-center p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Thông báo</span>
                  <p className="text-xs text-white/60">Quản lý thông báo</p>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="hover:bg-white/10 rounded-lg mx-1"
            >
              <Link href="/favorites" className="flex items-center p-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-medium">Yêu thích</span>
                  <p className="text-xs text-white/60">
                    Tin nhắn và nhóm yêu thích
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="bg-white/10" />

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
                      <span className="text-red-400 font-medium">
                        Đăng xuất
                      </span>
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
                    Bạn có chắc chắn muốn đăng xuất khỏi FastBite Group không?
                    Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
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
    </div>
  );
}
