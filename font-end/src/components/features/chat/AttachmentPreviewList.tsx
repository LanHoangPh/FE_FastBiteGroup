"use client";

import { UploadingFile } from "@/types/customer/file";
import { AttachmentPreviewItem } from "./AttachmentPreviewItem";

interface AttachmentPreviewListProps {
  uploadingFiles: UploadingFile[];
  onRemove: (localId: string) => void;
  onCancel: (localId: string) => void;
}

export function AttachmentPreviewList({
  uploadingFiles,
  onRemove,
  onCancel,
}: AttachmentPreviewListProps) {
  if (uploadingFiles.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap gap-2">
        {uploadingFiles.map((uploadingFile) => (
          <AttachmentPreviewItem
            key={uploadingFile.localId}
            uploadingFile={uploadingFile}
            onRemove={onRemove}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
