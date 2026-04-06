// components/shared/UserNav.tsx
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
import { LogOut, User, Settings } from "lucide-react";

export function UserNav() {
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
        // If no refresh token, no need to call API
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
    // Nếu chưa đăng nhập, hiển thị nút Login/Register
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/auth/login">Đăng nhập</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  // Nếu đã đăng nhập
  return (
    <div className="flex items-center gap-4">
      {/* Thêm các icon khác nếu cần, ví dụ chuông thông báo */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Avatar className="h-8 w-8" key={avatarKey}>
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.fullName}
              />
              <AvatarFallback className="text-xs font-medium">
                {user.firstName?.charAt(0).toUpperCase()}
                {user.lastName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Logout with Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đăng xuất không?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleLogout()}
                  disabled={isPending}
                >
                  {isPending ? "Đang đăng xuất..." : "Tiếp tục"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
