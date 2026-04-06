"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { handleApiError } from "@/lib/utils/errorUtils";

interface ExportButtonProps {
  onExport: () => Promise<any>;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  onExport,
  children = "Xuất dữ liệu",
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await onExport();
      toast.info("Yêu cầu xuất dữ liệu đã được nhận", {
        description: "Bạn sẽ được thông báo khi tệp đã sẵn sàng để tải xuống.",
        duration: 5000,
      });
    } catch (error) {
      handleApiError(error, "Lỗi khi xuất dữ liệu");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {children}
    </Button>
  );
}
