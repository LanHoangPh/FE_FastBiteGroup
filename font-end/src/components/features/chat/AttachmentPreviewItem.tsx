"use client";

import { useState, useEffect } from "react";
import { X, File, Image, Video, Music, Check, AlertCircle } from "lucide-react";
import { UploadingFile } from "@/types/customer/file";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AttachmentPreviewItemProps {
  uploadingFile: UploadingFile;
  onRemove: (localId: string) => void;
  onCancel: (localId: string) => void;
}

export function AttachmentPreviewItem({
  uploadingFile,
  onRemove,
  onCancel,
}: AttachmentPreviewItemProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (uploadingFile.file && uploadingFile.file.type.startsWith("image/")) {
      const url = URL.createObjectURL(uploadingFile.file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadingFile.file]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return <Image className="h-4 w-4" />;
    }

    if (["mp4", "avi", "mov", "wmv", "webm"].includes(extension || "")) {
      return <Video className="h-4 w-4" />;
    }

    if (["mp3", "wav", "ogg", "flac", "aac"].includes(extension || "")) {
      return <Music className="h-4 w-4" />;
    }

    return <File className="h-4 w-4" />;
  };

  const isImage = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      extension || ""
    );
  };

  return (
    <div className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-2 max-w-xs border border-gray-200 dark:border-gray-700">
      {/* Remove/Cancel button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          uploadingFile.status === "uploading"
            ? onCancel(uploadingFile.localId)
            : onRemove(uploadingFile.localId)
        }
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>

      {/* File preview */}
      <div className="flex items-center space-x-2">
        {isImage(uploadingFile.file.name) && objectUrl ? (
          <div className="flex-shrink-0">
            <img
              src={objectUrl}
              alt={uploadingFile.file.name}
              className="h-12 w-12 object-cover rounded border border-gray-200 dark:border-gray-600"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            {getFileIcon(uploadingFile.file.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {uploadingFile.file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(uploadingFile.file.size)}
          </p>
        </div>
      </div>

      {/* Progress bar or status indicators */}
      {uploadingFile.status === "uploading" && (
        <div className="mt-2">
          <Progress value={uploadingFile.progress} className="h-2" />
        </div>
      )}

      {uploadingFile.status === "success" && (
        <div className="mt-2 flex items-center text-green-500">
          <Check className="h-4 w-4 mr-1" />
          <span className="text-xs">Uploaded</span>
        </div>
      )}

      {uploadingFile.status === "error" && (
        <div className="mt-2 flex items-center text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{uploadingFile.error || "Error"}</span>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
