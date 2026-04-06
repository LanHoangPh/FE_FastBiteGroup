"use client";

import { useState } from "react";
import { MessageCircle, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewConversationModal } from "./NewConversationModal";
import { CreateGroupModal } from "../groups/CreateGroupModal";

interface ConversationTypeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationTypeModal({
  isOpen,
  onOpenChange,
}: ConversationTypeModalProps) {
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleDirectChatClick = () => {
    onOpenChange(false);
    setShowNewConversation(true);
  };

  const handleGroupChatClick = () => {
    onOpenChange(false);
    setShowCreateGroup(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mới</DialogTitle>
            <DialogDescription>
              Chọn loại cuộc trò chuyện bạn muốn tạo
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={handleDirectChatClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Tin nhắn trực tiếp</p>
                  <p className="text-sm text-muted-foreground">
                    Bắt đầu cuộc trò chuyện 1-1
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={handleGroupChatClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Nhóm chat</p>
                  <p className="text-sm text-muted-foreground">
                    Tạo nhóm chat mới
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Modals */}
      <NewConversationModal
        isOpen={showNewConversation}
        onOpenChange={setShowNewConversation}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
    </>
  );
}
