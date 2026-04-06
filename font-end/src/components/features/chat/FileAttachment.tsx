"use client";

import { AttachmentInfoDto } from "@/types/customer/user.types";
import {
  File,
  Download,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  attachment: AttachmentInfoDto;
}

export function FileAttachment({ attachment }: FileAttachmentProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileImage className="h-4 w-4" />;
    if (fileType.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
    if (fileType.startsWith("audio/")) return <FileAudio className="h-4 w-4" />;
    if (fileType.includes("pdf") || fileType.includes("document"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = () => {
    window.open(attachment.storageUrl, "_blank");
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-background/10 rounded-lg min-w-0">
      <div className="flex-shrink-0 w-10 h-10 bg-background/20 rounded-lg flex items-center justify-center">
        {getFileIcon(attachment.fileType)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {attachment.fileName}
        </div>
        <div className="text-xs opacity-70">
          {formatFileSize(attachment.fileSize)}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
