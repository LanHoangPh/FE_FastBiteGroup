"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleDto } from "@/types/admin/role.types";

const bulkRoleSchema = z.object({
  roleName: z.string().min(1, "Vai trò là bắt buộc"),
});

type BulkRoleFormData = z.infer<typeof bulkRoleSchema>;

interface BulkRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BulkRoleFormData) => void;
  selectedCount: number;
  roles: RoleDto[];
  isLoading?: boolean;
}

export default function BulkRoleDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  roles,
  isLoading = false,
}: BulkRoleDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkRoleFormData>({
    resolver: zodResolver(bulkRoleSchema),
    defaultValues: {
      roleName: "",
    },
  });

  const selectedRole = watch("roleName");

  const onSubmit = (data: BulkRoleFormData) => {
    onConfirm(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gán vai trò cho {selectedCount} người dùng
          </DialogTitle>
          <DialogDescription>
            Vui lòng chọn vai trò để gán cho {selectedCount} người dùng đã chọn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Vai trò *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("roleName", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleName && (
              <p className="text-sm text-red-600">{errors.roleName.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !selectedRole}
            >
              {isLoading ? "Đang xử lý..." : "Gán vai trò"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
