"use client";

import Link from "next/link";
import { Shield, MessageCircle, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function SelectRolePage() {
  const { user } = useAuthStore();

  return (
    <div className="customer-bg-gradient flex min-h-screen flex-col items-center justify-center p-8 text-white">
      <div className="text-center">
        <h1 className="customer-gradient-text text-4xl font-bold">
          Chào mừng trở lại{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Bạn có quyền truy cập vào nhiều khu vực. Vui lòng chọn nơi bạn muốn
          đến.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Admin Selection Card */}
        <Link href="/admin" className="block">
          <div className="customer-glass-card p-8 text-center transition-all duration-300 hover:border-primary/50 hover:scale-105 cursor-pointer space-y-4 group">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white">Khu vực Quản trị</h3>
            <p className="text-muted-foreground">
              Quản lý người dùng, nhóm, và các cài đặt hệ thống.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                Quản trị viên
              </span>
            </div>
          </div>
        </Link>

        {/* Customer Selection Card */}
        <Link href="/dashboard" className="block">
          <div className="customer-glass-card p-8 text-center transition-all duration-300 hover:border-cyan-400/50 hover:scale-105 cursor-pointer space-y-4 group">
            <div className="mx-auto h-16 w-16 rounded-full bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
              <MessageCircle className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Ứng dụng Giao tiếp
            </h3>
            <p className="text-muted-foreground">
              Trò chuyện, đăng bài và tham gia các cuộc gọi video với đội nhóm
              của bạn.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
                Người dùng
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Bạn có thể thay đổi khu vực bất cứ lúc nào từ menu người dùng.</p>
      </div>
    </div>
  );
}

