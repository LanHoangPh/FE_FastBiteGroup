"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createRole, updateRole } from "@/lib/api/admin/roles";
import {
  createRoleSchema,
  CreateRoleFormData,
  updateRoleSchema,
  UpdateRoleFormData,
} from "@/lib/schemas/role.schema";
import { handleApiError } from "@/lib/utils/errorUtils";
import { RoleDto } from "@/types/admin/role.types";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role?: RoleDto;
}

export function RoleDialog({
  open,
  onOpenChange,
  mode,
  role,
}: RoleDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";

  // Use the appropriate schema based on mode
  const createForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: "",
    },
  });

  const updateForm = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      newRoleName: role?.name || "",
    },
  });

  // Set form values when role changes in edit mode
  useState(() => {
    if (isEditMode && role) {
      updateForm.reset({
        newRoleName: role.name,
      });
    }
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Thành công", {
        description: "Vai trò mới đã được tạo.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      onOpenChange(false);
      createForm.reset();
    },
    onError: (error) => {
      handleApiError(error, "Tạo vai trò thất bại");
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: UpdateRoleFormData;
    }) => updateRole(roleId, data),
    onSuccess: () => {
      toast.success("Thành công", {
        description: "Vai trò đã được cập nhật.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      onOpenChange(false);
      updateForm.reset();
    },
    onError: (error) => {
      handleApiError(error, "Cập nhật vai trò thất bại");
    },
  });

  // Handle form submission
  const onSubmit = isEditMode
    ? updateForm.handleSubmit((data) => {
        if (!role?.id) return;
        updateMutation.mutate({ roleId: role.id, data });
      })
    : createForm.handleSubmit((data) => {
        createMutation.mutate(data);
      });

  // Determine loading state
  const isLoading = isEditMode
    ? updateMutation.isPending
    : createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roleName">Tên vai trò</Label>
              {isEditMode ? (
                <Input
                  id="newRoleName"
                  {...updateForm.register("newRoleName")}
                  placeholder="Nhập tên vai trò"
                  disabled={isLoading}
                  maxLength={50}
                  aria-invalid={!!updateForm.formState.errors.newRoleName}
                />
              ) : (
                <Input
                  id="roleName"
                  {...createForm.register("roleName")}
                  placeholder="Nhập tên vai trò"
                  disabled={isLoading}
                  maxLength={50}
                  aria-invalid={!!createForm.formState.errors.roleName}
                />
              )}
              {isEditMode && updateForm.formState.errors.newRoleName && (
                <p className="text-sm text-red-500">
                  {updateForm.formState.errors.newRoleName.message}
                </p>
              )}
              {!isEditMode && createForm.formState.errors.roleName && (
                <p className="text-sm text-red-500">
                  {createForm.formState.errors.roleName.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
