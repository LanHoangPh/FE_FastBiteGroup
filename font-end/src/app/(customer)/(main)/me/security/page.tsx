"use client";

import { Shield } from "lucide-react";
import {
  ChangePasswordCard,
  LoginHistoryCard,
  AccountActionsCard,
} from "@/components/features/security";

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
              Bảo mật
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Quản lý cài đặt bảo mật và quyền riêng tư cho tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Security Status Indicator */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Tài khoản của bạn đang được bảo vệ
            </span>
            <div className="ml-auto px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
              An toàn
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ChangePasswordCard />
        <LoginHistoryCard />
        <AccountActionsCard />
      </div>
    </div>
  );
}
