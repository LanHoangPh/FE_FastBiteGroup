"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { X, User, Mail, UserCheck, Shield } from "lucide-react";

import { getAllRoles } from "@/lib/api/admin/roles";
import { RoleDto } from "@/types/admin/role.types";
import {
  createUserByAdminSchema,
  CreateUserByAdminFormData,
} from "@/lib/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserByAdminFormData) => void;
  isLoading: boolean;
}

export default function CreateUserDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateUserDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserByAdminFormData>({
    resolver: zodResolver(createUserByAdminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      roleName: "",
    },
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
    enabled: isOpen,
  });

  const roles = rolesData?.data || [];

  const handleFormSubmit = (data: CreateUserByAdminFormData) => {
    onSubmit(data);
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
            <User className="h-5 w-5" />
            Tạo người dùng mới
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới với thông tin cơ bản và vai trò trong
            hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Tên *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Nhập tên"
                disabled={isLoading}
                aria-invalid={!!errors.firstName}
                maxLength={50}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Họ *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Nhập họ"
                disabled={isLoading}
                aria-invalid={!!errors.lastName}
                maxLength={50}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Nhập email"
              disabled={isLoading}
              aria-invalid={!!errors.email}
              maxLength={100}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Tên đăng nhập *
            </Label>
            <Input
              id="userName"
              {...register("userName")}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
              aria-invalid={!!errors.userName}
              maxLength={50}
            />
            {errors.userName && (
              <p className="text-sm text-red-500">{errors.userName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Chỉ được chứa chữ cái, số và dấu gạch dưới
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="roleName" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Vai trò *
            </Label>
            <Select
              onValueChange={(value) => setValue("roleName", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role: RoleDto) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleName && (
              <p className="text-sm text-red-500">{errors.roleName.message}</p>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Tạo người dùng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
