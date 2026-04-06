"use client";

import { useState } from "react";
import { PostAttachmentDto } from "@/types/customer/post";
import { Download, ExternalLink, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostAttachmentsProps {
  attachments: PostAttachmentDto[];
  onViewAll?: () => void;
}

export function PostAttachments({
  attachments,
  onViewAll,
}: PostAttachmentsProps) {
  // State for tracking load errors only
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set());

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleLoadError = (fileId: number) => {
    setLoadErrors((prev) => new Set(prev).add(fileId));
  };

  const renderAttachment = (attachment: PostAttachmentDto) => {
    const fileType = attachment.fileType || "";
    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");
    const isDocument = !isImage && !isVideo;
    const hasLoadError = loadErrors.has(attachment.fileId);

    if (isImage) {
      if (hasLoadError) {
        return (
          <div
            key={attachment.fileId}
            className="relative group h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
          >
            <Image className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Không thể tải ảnh
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
              {attachment.fileName}
            </p>
          </div>
        );
      }

      return (
        <div key={attachment.fileId} className="relative group h-full">
          <img
            src={attachment.storageUrl}
            alt={attachment.fileName}
            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
            onError={() => handleLoadError(attachment.fileId)}
            onClick={() => {
              // Trigger onViewAll to open PostDetailModal instead of ImageViewer directly
              onViewAll?.();
            }}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }

    if (isVideo) {
      if (hasLoadError) {
        return (
          <div
            key={attachment.fileId}
            className="relative group h-full w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
          >
            <Video className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Không thể tải video
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
              {attachment.fileName}
            </p>
          </div>
        );
      }

      return (
        <div key={attachment.fileId} className="relative group h-full">
          <video
            src={attachment.storageUrl}
            controls
            className="w-full h-full object-cover"
            onError={() => handleLoadError(attachment.fileId)}
          />
        </div>
      );
    }

    if (isDocument) {
      return (
        <div
          key={attachment.fileId}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {attachment.fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileType.split("/")[1]?.toUpperCase() || "FILE"} •
                {(attachment.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const link = document.createElement("a");
              link.href = attachment.storageUrl;
              link.download = attachment.fileName;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="ml-2"
          >
            <Download className="h-4 w-4 mr-1" />
            Tải xuống
          </Button>
        </div>
      );
    }

    return null;
  };

  // Filter images and videos for grid layout
  const mediaAttachments = attachments.filter(
    (a) =>
      (a.fileType || "").startsWith("image/") ||
      (a.fileType || "").startsWith("video/")
  );

  const documentAttachments = attachments.filter(
    (a) =>
      !(a.fileType || "").startsWith("image/") &&
      !(a.fileType || "").startsWith("video/")
  );

  return (
    <div className="px-4 pb-3">
      {/* Media Grid Layout */}
      {mediaAttachments.length > 0 && (
        <div className="mb-3">
          {mediaAttachments.length === 1 ? (
            // Single media item - full width
            <div className="rounded-lg overflow-hidden">
              {renderAttachment(mediaAttachments[0])}
            </div>
          ) : mediaAttachments.length === 2 ? (
            // Two media items - side by side
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {mediaAttachments.map((item) => (
                <div key={item.fileId} className="aspect-square">
                  {renderAttachment(item)}
                </div>
              ))}
            </div>
          ) : mediaAttachments.length === 3 ? (
            // Three media items - 2 on top, 1 on bottom (full width)
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              <div className="aspect-square">
                {renderAttachment(mediaAttachments[0])}
              </div>
              <div className="row-span-2">
                {renderAttachment(mediaAttachments[1])}
              </div>
              <div className="aspect-square">
                {renderAttachment(mediaAttachments[2])}
              </div>
            </div>
          ) : mediaAttachments.length === 4 ? (
            // Four media items - 2x2 grid
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              {mediaAttachments.map((item) => (
                <div key={item.fileId} className="aspect-square">
                  {renderAttachment(item)}
                </div>
              ))}
            </div>
          ) : (
            // Five or more media items - 2x2 grid with overlay on last item
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              <div className="aspect-square">
                {renderAttachment(mediaAttachments[0])}
              </div>
              <div className="aspect-square">
                {renderAttachment(mediaAttachments[1])}
              </div>
              <div className="aspect-square">
                {renderAttachment(mediaAttachments[2])}
              </div>
              <div className="relative aspect-square cursor-pointer">
                <div className="absolute inset-0">
                  {renderAttachment(mediaAttachments[3])}
                </div>
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-40 transition-all duration-200"
                  onClick={() => {
                    // TODO: Implement view all functionality
                    console.log("View all attachments clicked");
                    onViewAll?.();
                  }}
                >
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">
                      +{mediaAttachments.length - 4}
                    </div>
                    <div className="text-sm">Xem tất cả</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      {documentAttachments.length > 0 && (
        <div className="space-y-2">
          {documentAttachments.map(renderAttachment)}
        </div>
      )}

      {/* ImageViewer is handled in PostDetailModal for proper flow */}
    </div>
  );
}
