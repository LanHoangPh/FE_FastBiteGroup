"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, User, Calendar } from "lucide-react";

import { AdminUserListItemDTO } from "@/types/admin/user.types";
import {
  updateUserBasicInfoSchema,
  UpdateUserBasicInfoFormData,
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

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserBasicInfoFormData) => void;
  user: AdminUserListItemDTO | null;
  isLoading: boolean;
}

export default function EditUserDialog({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}: EditUserDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateUserBasicInfoFormData>({
    resolver: zodResolver(updateUserBasicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (user && isOpen) {
      const [firstName, ...lastNameParts] = user.fullName.split(" ");
      const lastName = lastNameParts.join(" ");

      setValue("firstName", firstName || "");
      setValue("lastName", lastName || "");

      // Format dateOfBirth for HTML date input (YYYY-MM-DD)
      if (user.dateOfBirth) {
        const date = new Date(user.dateOfBirth);
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toISOString().split("T")[0];
          setValue("dateOfBirth", formattedDate);
        } else {
          setValue("dateOfBirth", "");
        }
      } else {
        setValue("dateOfBirth", "");
      }
    }
  }, [user, isOpen, setValue]);

  const handleFormSubmit = (data: UpdateUserBasicInfoFormData) => {
    // Format the dateOfBirth to ISO 8601 if it exists, or set to undefined if cleared
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString()
        : undefined,
    };

    onSubmit(formattedData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chỉnh sửa thông tin người dùng
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cơ bản của người dùng "{user.fullName}"
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
                maxLength={50}
                aria-invalid={!!errors.firstName}
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
                maxLength={50}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ngày sinh
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
              disabled={isLoading}
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
              placeholder="YYYY-MM-DD"
              aria-invalid={!!errors.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">
                {errors.dateOfBirth.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Ngày sinh là tùy chọn
            </p>
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
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
