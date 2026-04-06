"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserX, AlertTriangle, Shield } from "lucide-react";

import { AdminUserListItemDTO } from "@/types/admin/user.types";
import {
  deactivateUserSchema,
  DeactivateUserFormData,
} from "@/lib/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface DeactivateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeactivateUserFormData) => void;
  user: AdminUserListItemDTO | null;
  isLoading: boolean;
}

const DEACTIVATION_REASONS = [
  { value: "VIOLATION", label: "Vi phạm quy tắc cộng đồng" },
  { value: "SPAM", label: "Spam hoặc quảng cáo không mong muốn" },
  { value: "INAPPROPRIATE_CONTENT", label: "Nội dung không phù hợp" },
  { value: "SECURITY_CONCERN", label: "Vấn đề bảo mật" },
  { value: "INACTIVE", label: "Tài khoản không hoạt động" },
  { value: "USER_REQUEST", label: "Yêu cầu của người dùng" },
  { value: "OTHER", label: "Lý do khác" },
];

export default function DeactivateUserDialog({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}: DeactivateUserDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeactivateUserFormData>({
    resolver: zodResolver(deactivateUserSchema),
    defaultValues: {
      reasonCategory: "",
      reasonDetails: "",
    },
  });

  const selectedReason = watch("reasonCategory");

  const handleFormSubmit = (data: DeactivateUserFormData) => {
    onSubmit(data);
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <UserX className="h-5 w-5" />
            Vô hiệu hóa người dùng
          </DialogTitle>
          <DialogDescription>
            Vô hiệu hóa tài khoản của người dùng "{user.fullName}". Người dùng
            sẽ không thể đăng nhập vào hệ thống cho đến khi được kích hoạt lại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Người dùng sẽ không thể đăng nhập vào hệ thống</li>
                <li>Họ vẫn có thể xem nội dung công khai</li>
                <li>Bạn có thể kích hoạt lại tài khoản bất cứ lúc nào</li>
              </ul>
            </div>
          </div>

          {/* Reason Category */}
          <div className="space-y-2">
            <Label htmlFor="reasonCategory" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Lý do vô hiệu hóa *
            </Label>
            <Select
              onValueChange={(value) => setValue("reasonCategory", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do vô hiệu hóa" />
              </SelectTrigger>
              <SelectContent>
                {DEACTIVATION_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reasonCategory && (
              <p className="text-sm text-red-500">
                {errors.reasonCategory.message}
              </p>
            )}
          </div>

          {/* Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reasonDetails">
              Chi tiết lý do
              {selectedReason === "OTHER" && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Textarea
              id="reasonDetails"
              {...register("reasonDetails")}
              placeholder={
                selectedReason === "OTHER"
                  ? "Vui lòng mô tả chi tiết lý do vô hiệu hóa..."
                  : "Thêm thông tin chi tiết (tùy chọn)..."
              }
              disabled={isLoading}
              rows={3}
              aria-invalid={!!errors.reasonDetails}
            />
            {errors.reasonDetails && (
              <p className="text-sm text-red-500">
                {errors.reasonDetails.message}
              </p>
            )}
            {selectedReason === "OTHER" && (
              <p className="text-xs text-orange-600">
                Khi chọn "Lý do khác", vui lòng mô tả chi tiết lý do vô hiệu hóa
              </p>
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
              variant="destructive"
              disabled={
                isLoading ||
                !selectedReason ||
                (selectedReason === "OTHER" && !watch("reasonDetails"))
              }
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang vô hiệu hóa...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Vô hiệu hóa người dùng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
