"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageDto } from "@/types/customer/user.types";
import { MoreHorizontal, Reply, Copy, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactionPicker } from "./ReactionPicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteMessage } from "@/lib/api/customer/conversations";
import { handleApiError } from "@/lib/utils/errorUtils";

interface MessageActionsProps {
  message: MessageDto;
  onReply?: (message: MessageDto) => void;
  onReactionSelect?: (reactionCode: string) => void;
}

export function MessageActions({ message, onReply, onReactionSelect }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: () => {
      console.log("[MessageActions] Deleting message:", { conversationId: message.conversationId, messageId: message.id });
      return deleteMessage(message.conversationId, message.id);
    },
    onSuccess: () => {
      console.log("[MessageActions] Delete API call successful");
      setShowDeleteDialog(false);
      setIsOpen(false);
      toast.success("Đang thu hồi tin nhắn...");
    },
    onError: (error) => {
      console.error("[MessageActions] Delete API call failed:", error);
      handleApiError(error);
    },
  });

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      // Position dropdown below the button
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleReply = () => {
    if (onReply) {
      onReply(message);
      // toast.success("Đang chuẩn bị trả lời tin nhắn");
    } else {
      toast.info("Tính năng trả lời sẽ được triển khai sớm");
    }
    setIsOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Đã sao chép tin nhắn");
    } catch (error) {
      toast.error("Không thể sao chép tin nhắn");
    }
    setIsOpen(false);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast.info("Tính năng chỉnh sửa sẽ được triển khai sớm");
    setIsOpen(false);
  };

  const handleDelete = () => {
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMessageMutation.mutate();
  };

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      {/* Reaction Picker */}
      {onReactionSelect && (
        <div className="animate-in fade-in-0 zoom-in-95 duration-200 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border border-gray-200/60 dark:border-gray-600/60 rounded-md hover:shadow-xl transition-all duration-200">
          <ReactionPicker 
            onReactionSelect={onReactionSelect}
            disabled={false}
          />
        </div>
      )}
      
      {/* More Actions Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="h-7 w-7 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border border-gray-200/60 dark:border-gray-600/60 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
      >
        <MoreHorizontal className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
      </Button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 duration-200 absolute z-50 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-600/60 rounded-lg shadow-xl py-1",
            message.isMine
              ? "right-0 top-8"
              : "left-0 top-8"
          )}
        >
          <button
            onClick={handleReply}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
          >
            <Reply className="mr-2 h-3.5 w-3.5" />
            <span>Trả lời</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
          >
            <Copy className="mr-2 h-3.5 w-3.5" />
            <span>Sao chép</span>
          </button>

          {message.canDelete && (
            <>
              <div className="border-t border-gray-200/60 dark:border-gray-600/60 my-1" />
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Thu hồi</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi tin nhắn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thu hồi tin nhắn này không? Hành động này không thể hoàn tác và tin nhắn sẽ bị xóa khỏi cuộc trò chuyện cho tất cả mọi người.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMessageMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMessageMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMessageMutation.isPending ? "Đang thu hồi..." : "Thu hồi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
