"use client";

import React from "react";
import { PhoneOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallEndedScreenProps {
  message?: string;
  reason?:
    | "ended_by_host"
    | "ended_by_user"
    | "connection_lost"
    | "removed_by_admin"
    | "unknown";
}

export function CallEndedScreen({
  message,
  reason = "unknown",
}: CallEndedScreenProps) {
  const getMessage = () => {
    if (message) return message;

    switch (reason) {
      case "ended_by_host":
        return "Cuộc gọi đã được kết thúc bởi người tạo cuộc gọi";
      case "ended_by_user":
        return "Bạn đã rời khỏi cuộc gọi";
      case "connection_lost":
        return "Kết nối bị mất. Cuộc gọi đã kết thúc";
      case "removed_by_admin":
        return "Bạn đã bị xóa khỏi cuộc gọi bởi quản trị viên";
      default:
        return "Cuộc gọi video đã kết thúc";
    }
  };

  const getIconColor = () => {
    switch (reason) {
      case "ended_by_host":
        return "text-orange-500";
      case "ended_by_user":
        return "text-blue-500";
      case "connection_lost":
        return "text-yellow-500";
      case "removed_by_admin":
        return "text-red-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* Icon with gradient background */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
            <PhoneOff className={`h-12 w-12 ${getIconColor()}`} />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/50"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500/30 to-green-500/30 border border-cyan-500/50"></div>
        </div>

        {/* Title */}
        <h2 className="text-white text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Cuộc gọi đã kết thúc
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-4 leading-relaxed">
          {getMessage()}
        </p>

        {/* Additional message for removed users */}
        {reason === "removed_by_admin" && (
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Bạn sẽ được chuyển về trang chủ trong vài giây...
          </p>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => window.close()}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105"
          >
            <X className="h-5 w-5 mr-2" />
            Đóng tab
          </Button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <p className="text-gray-500 text-sm">
            Cảm ơn bạn đã sử dụng dịch vụ video call
          </p>
        </div>
      </div>
    </div>
  );
}
