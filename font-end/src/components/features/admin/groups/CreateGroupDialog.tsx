"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Users, UserPlus } from "lucide-react";

import { createAdminGroup } from "@/lib/api/admin/groups";
import {
  CreateGroupFormData,
  GroupType,
  UserSearchResultDTO,
} from "@/types/admin/group.types";
import { createGroupSchema } from "@/lib/schemas/group.schema";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserSearchCombobox } from "../users/UserSearchCombobox";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState<UserSearchResultDTO[]>(
    []
  );

  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      description: "",
      groupType: "Public",
      initialAdminUserIds: [],
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createAdminGroup,
    onSuccess: () => {
      toast.success("Tạo nhóm thành công", {
        description: "Nhóm mới đã được tạo và hiển thị trong danh sách.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      handleClose();
    },
    onError: (error) => {
      handleApiError(error, "Tạo nhóm thất bại");
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedAdmins([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleUserSelect = (user: UserSearchResultDTO | null) => {
    if (user) {
      // Check if user is already selected
      if (!selectedAdmins.find((admin) => admin.userId === user.userId)) {
        setSelectedAdmins((prev) => [...prev, user]);
        // Update form value
        const currentIds = form.getValues("initialAdminUserIds");
        form.setValue("initialAdminUserIds", [...currentIds, user.userId]);
      }
      // Clear search query for next search
      setSearchQuery("");
    }
  };

  const removeAdmin = (userId: string) => {
    setSelectedAdmins((prev) =>
      prev.filter((admin) => admin.userId !== userId)
    );
    // Update form value
    const currentIds = form.getValues("initialAdminUserIds");
    form.setValue(
      "initialAdminUserIds",
      currentIds.filter((id: string) => id !== userId)
    );
  };

  const onSubmit = (data: CreateGroupFormData) => {
    createGroupMutation.mutate(data);
  };

  const groupTypeOptions: { value: GroupType; label: string }[] = [
    { value: "Public", label: "Công khai" },
    { value: "Private", label: "Riêng tư" },
    { value: "Community", label: "Cộng đồng" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tạo Nhóm Mới
          </DialogTitle>
          <DialogDescription>
            Tạo một nhóm mới và chỉ định các quản trị viên ban đầu. Tất cả thông
            tin có thể được chỉnh sửa sau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">
              Tên nhóm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="groupName"
              placeholder="Nhập tên nhóm..."
              {...form.register("groupName")}
              maxLength={50}
              className={
                form.formState.errors.groupName ? "border-destructive" : ""
              }
            />
            {form.formState.errors.groupName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.groupName.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả nhóm (tùy chọn)..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Group Type */}
          <div className="space-y-2">
            <Label htmlFor="groupType">
              Loại nhóm <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("groupType")}
              onValueChange={(value: GroupType) =>
                form.setValue("groupType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại nhóm" />
              </SelectTrigger>
              <SelectContent>
                {groupTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.groupType && (
              <p className="text-sm text-destructive">
                {form.formState.errors.groupType.message}
              </p>
            )}
          </div>

          {/* Initial Administrators */}
          <div className="space-y-3">
            <Label>
              Quản trị viên ban đầu <span className="text-destructive">*</span>
            </Label>

            {/* User Search */}
            <UserSearchCombobox
              value={null}
              onSelectUser={handleUserSelect}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              placeholder="Tìm kiếm người dùng để thêm làm quản trị viên..."
            />

            {/* Selected Admins Display */}
            {selectedAdmins.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Quản trị viên đã chọn ({selectedAdmins.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedAdmins.map((admin) => (
                    <Badge
                      key={admin.userId}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <Users className="h-3 w-3" />
                      {admin.displayName}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeAdmin(admin.userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {form.formState.errors.initialAdminUserIds && (
              <p className="text-sm text-destructive">
                {form.formState.errors.initialAdminUserIds.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createGroupMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={createGroupMutation.isPending}
              className="min-w-[120px]"
            >
              {createGroupMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
