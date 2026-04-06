"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addAdminGroupMember } from "@/lib/api/admin/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import {
  AddMemberAdminRequest,
  UserSearchResultDTO,
} from "@/types/admin/group.types";
import { UserSearchCombobox } from "@/components/features/admin/users/UserSearchCombobox";

interface AddMemberDialogProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserSearchResultDTO | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState(""); // Manage search query state here
  const [selectedRole, setSelectedRole] = useState<
    "Member" | "Moderator" | "Admin"
  >("Member");

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: AddMemberAdminRequest) =>
      addAdminGroupMember(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      // Add this: Invalidate the user search cache to force a refetch next time
      queryClient.invalidateQueries({ queryKey: ["user-search"] });
      // Also invalidate the group detail to refresh member count
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success(`Đã thêm ${selectedUser?.displayName} vào nhóm`);
      handleClose();
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi thêm thành viên");
    },
  });

  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery(""); // Clear search query on close
    setSelectedRole("Member");
    onOpenChange(false);
  };

  // Handle user selection - update both selectedUser and searchQuery
  const handleSelectUser = (user: UserSearchResultDTO | null) => {
    setSelectedUser(user);
    // Also update the input text to reflect the selection
    setSearchQuery(user ? user.displayName : "");
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.error("Vui lòng chọn một người dùng");
      return;
    }

    const data: AddMemberAdminRequest = {
      userId: selectedUser.userId,
      role: selectedRole,
    };

    addMemberMutation.mutate(data);
  };

  const isSubmitDisabled = !selectedUser || addMemberMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm thành viên vào nhóm
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và thêm người dùng vào nhóm "{groupName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Search Combobox */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Tìm kiếm người dùng</Label>
            <UserSearchCombobox
              value={selectedUser} // Pass selectedUser as controlled value
              onSelectUser={handleSelectUser} // Pass handleSelectUser as callback
              searchQuery={searchQuery} // Pass searchQuery as controlled value
              onSearchQueryChange={setSearchQuery} // Pass setSearchQuery as callback
              excludeGroupId={groupId}
              placeholder="Tìm kiếm người dùng để thêm vào nhóm..."
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: "Member" | "Moderator" | "Admin") =>
                setSelectedRole(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={addMemberMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {addMemberMutation.isPending ? "Đang thêm..." : "Thêm vào nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
