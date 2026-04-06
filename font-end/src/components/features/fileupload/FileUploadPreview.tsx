"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileText, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadPreviewProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  resetKey?: number;
}

export function FileUploadPreview({
  onFilesChange,
  maxFiles = 8,
  maxSize = 10,
  resetKey,
}: FileUploadPreviewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset files when resetKey changes
  useEffect(() => {
    setFiles([]);
    onFilesChange?.([]);
  }, [resetKey, onFilesChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    // Check file count limit
    if (files.length + newFiles.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} tệp.`);
      return;
    }

    // Check file size limit
    const oversizedFiles = newFiles.filter(
      (file) => file.size > maxSize * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      alert(`Mỗi tệp không được vượt quá ${maxSize}MB.`);
      return;
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-3">
      {/* Preview Area */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group border rounded-lg p-2 bg-white dark:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed h-20 flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />
          <span className="text-sm">
            {files.length > 0
              ? "Thêm tệp đính kèm"
              : "Chọn tệp đính kèm (tối đa 8 tệp)"}
          </span>
          <span className="text-xs text-muted-foreground">
            Mỗi tệp tối đa {maxSize}MB
          </span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="*/*"
        />
      </div>
    </div>
  );
}
