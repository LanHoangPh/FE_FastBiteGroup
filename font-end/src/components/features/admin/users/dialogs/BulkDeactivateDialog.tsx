"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bulkDeactivateSchema = z.object({
  reasonCategory: z.string().min(1, "Danh mục lý do là bắt buộc"),
  reasonDetails: z.string().optional(),
});

type BulkDeactivateFormData = z.infer<typeof bulkDeactivateSchema>;

interface BulkDeactivateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BulkDeactivateFormData) => void;
  selectedCount: number;
  isLoading?: boolean;
}

const REASON_CATEGORIES = [
  { value: "Spam", label: "Spam" },
  { value: "Harassment", label: "Quấy rối" },
  { value: "Policy Violation", label: "Vi phạm chính sách" },
  { value: "Inappropriate Content", label: "Nội dung không phù hợp" },
  { value: "Security Concern", label: "Vấn đề bảo mật" },
  { value: "Other", label: "Khác" },
];

export default function BulkDeactivateDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false,
}: BulkDeactivateDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkDeactivateFormData>({
    resolver: zodResolver(bulkDeactivateSchema),
    defaultValues: {
      reasonCategory: "",
      reasonDetails: "",
    },
  });

  const selectedCategory = watch("reasonCategory");

  const onSubmit = (data: BulkDeactivateFormData) => {
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
            Vô hiệu hóa {selectedCount} người dùng
          </DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp lý do vô hiệu hóa cho {selectedCount} người dùng
            đã chọn. Hành động này sẽ vô hiệu hóa tài khoản của họ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reasonCategory">Danh mục lý do *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue("reasonCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục lý do" />
              </SelectTrigger>
              <SelectContent>
                {REASON_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reasonCategory && (
              <p className="text-sm text-red-600">
                {errors.reasonCategory.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonDetails">Chi tiết lý do (tùy chọn)</Label>
            <Textarea
              id="reasonDetails"
              placeholder="Nhập chi tiết lý do vô hiệu hóa..."
              {...register("reasonDetails")}
              className="min-h-[100px]"
            />
            {errors.reasonDetails && (
              <p className="text-sm text-red-600">
                {errors.reasonDetails.message}
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
              disabled={isLoading || !selectedCategory}
            >
              {isLoading ? "Đang xử lý..." : "Vô hiệu hóa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
