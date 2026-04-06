"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";

import { createChatGroup } from "@/lib/api/customer/groups";
import { CreateGroupResponseDto } from "@/types/customer/group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateGroupDetailsForm } from "./CreateGroupDetailsForm";

export type CreateGroupStep = "details";

interface CreateGroupModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateGroupModal({
  children,
  isOpen,
  onOpenChange,
}: CreateGroupModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const router = useRouter();
  const queryClient = useQueryClient();

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: createChatGroup,
    onSuccess: (data) => {
      toast.success(`Nhóm '${data.groupName}' đã được tạo thành công.`);

      // Invalidate conversations list to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Navigate to the new group's chat
      router.push(`/chat/conversations/${data.defaultConversationId}`);

      // Close modal and reset state
      handleClose();
    },
    onError: (error) => {
      console.error("Error creating group:", error);
      toast.error("⚠️ Lỗi tạo nhóm", {
        description:
          "Không thể tạo nhóm. Vui lòng kiểm tra thông tin và thử lại.",
        duration: 5000,
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {
        /* Only show DialogTrigger if using internal control (no external isOpen provided) */
        isOpen === undefined && (
          <DialogTrigger asChild>
            {children || (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200 group"
                aria-label="Tạo nhóm mới"
              >
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            )}
          </DialogTrigger>
        )
      }

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Tạo nhóm mới
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Tạo một nhóm chat để kết nối với bạn bè và đồng nghiệp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <CreateGroupDetailsForm
            onSuccess={(data: any) => createGroupMutation.mutate(data)}
            isLoading={createGroupMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
