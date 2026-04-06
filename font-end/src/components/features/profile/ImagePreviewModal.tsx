"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Info, Image } from "lucide-react";
import { formatFileSize } from "@/lib/utils/formatters";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File;
  imageUrl: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  file,
  imageUrl,
}: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="customer-glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-white">
            Xác nhận ảnh đại diện
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Xem trước và xác nhận ảnh đại diện mới của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Tên file:</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">
                {file.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Loại file:</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">
                {file.type}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Kích thước:</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">
                {formatFileSize(file.size)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Ngày chỉnh sửa:</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm">
                {new Date(file.lastModified).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Check className="h-4 w-4" />
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
