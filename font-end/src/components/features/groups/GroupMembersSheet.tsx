"use client";

import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { GroupRole } from "@/types/customer/group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GroupMembersListDark } from "./GroupMembersListDark";
import { AddMemberModal } from "./AddMemberModal";

interface GroupMembersSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  groupId: string;
  groupName: string;
  memberCount: number;
  currentUserRole: GroupRole;
}

export function GroupMembersSheet({
  isOpen,
  onOpenChange,
  groupId,
  groupName,
  memberCount,
}: GroupMembersSheetProps) {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const handleAddMemberClick = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Check if user can add members - this will be determined by backend permissions
  const canAddMembers = true; // Backend will control this via API permissions

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full max-w-md p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Thành viên
                </SheetTitle>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              {/* Add Member Section */}
              {canAddMembers && (
                <div className="space-y-4">
                  <Button
                    onClick={handleAddMemberClick}
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 p-3"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Thêm thành viên
                    </span>
                  </Button>
                </div>
              )}

              {/* Members List Section */}
              <div className="space-y-4 mt-6 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Danh sách thành viên ({memberCount})
                  </h3>
                </div>

                {/* Custom Members List */}
                <div className="space-y-1">
                  <GroupMembersListDark groupId={groupId} />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={handleCloseAddMemberModal}
        groupId={groupId}
        groupName={groupName}
      />
    </>
  );
}
