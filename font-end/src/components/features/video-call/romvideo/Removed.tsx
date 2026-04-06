// VideoCallRemovedMessage.tsx
// Component to display when a user has been removed from a video call by an admin
// Following the same pattern as VideoCallEndedMessage.tsx

import React from "react";
import { Video, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VideoCallRemovedMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoCallRemovedMessage: React.FC<VideoCallRemovedMessageProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Thông báo cuộc gọi</DialogTitle>
          <DialogDescription>
            Bạn đã bị xóa khỏi cuộc gọi video bởi quản trị viên
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Icon and Status */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
              <UserX className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-center">
              <h4 className="text-card-foreground font-semibold text-base">
                Bạn đã bị xóa khỏi cuộc gọi
              </h4>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Video className="h-4 w-4" />
                Bị xóa bởi quản trị viên
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-muted-foreground text-sm mt-2">
            Quản trị viên đã xóa bạn khỏi cuộc gọi video này.
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallRemovedMessage;
