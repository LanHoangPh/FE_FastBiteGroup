"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users } from "lucide-react";
import { endVideoCallForAll } from "@/lib/api/customer/video-call";

interface EndCallForAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onCallEnded: (
    message?: string,
    reason?: "ended_by_host" | "ended_by_user" | "connection_lost" | "unknown"
  ) => void;
}

export function EndCallForAllModal({
  isOpen,
  onClose,
  sessionId,
  onCallEnded,
}: EndCallForAllModalProps) {
  const [isLeavingCall, setIsLeavingCall] = React.useState(false);

  const handleConfirmEndCall = async () => {
    setIsLeavingCall(true);
    try {
      // Call API to end video call for all participants
      await endVideoCallForAll(sessionId);
      onCallEnded(
        "Cuộc gọi đã được kết thúc cho tất cả người tham gia",
        "ended_by_host"
      );
    } catch (error) {
      // Still end the call locally even if API fails
      onCallEnded(
        "Cuộc gọi đã được kết thúc cho tất cả người tham gia",
        "ended_by_host"
      );
    } finally {
      setIsLeavingCall(false);
    }
  };

  const handleCancelEndCall = () => {
    onClose();
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="bg-card border-border p-6 rounded-xl shadow-2xl max-w-md z-[9999]">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-xl font-bold text-card-foreground">
            Kết thúc cuộc gọi cho tất cả
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm mt-2">
            Bạn có chắc chắn muốn kết thúc cuộc gọi cho tất cả người tham gia
            không? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-3 mt-6">
          <Button
            onClick={handleCancelEndCall}
            disabled={isLeavingCall}
            variant="outline"
            className="flex-1 h-10 bg-muted hover:bg-muted/80 text-muted-foreground border-border hover:text-foreground transition-all duration-200 disabled:opacity-50"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmEndCall}
            disabled={isLeavingCall}
            className="flex-1 h-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 transition-all duration-200 disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            {isLeavingCall ? "Đang kết thúc..." : "Kết thúc tất cả"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
