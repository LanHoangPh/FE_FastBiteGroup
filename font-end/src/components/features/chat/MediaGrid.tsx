"use client";

import { AttachmentInfoDto } from "@/types/customer/user.types";
import { cn } from "@/lib/utils";
import { useImageViewer } from "@/hooks/useImageViewer";
import { ImageViewer } from "./ImageViewer";

interface MediaGridProps {
  attachments: AttachmentInfoDto[];
  messageInfo?: {
    senderName: string;
    sentAt: string;
    content?: string;
  };
}

export function MediaGrid({ attachments, messageInfo }: MediaGridProps) {
  
  const {
    isOpen,
    images,
    initialIndex,
    messageInfo: viewerMessageInfo,
    openImageViewer,
    closeImageViewer,
  } = useImageViewer();

  const mediaAttachments = attachments.filter(
    (att) =>
      att.fileType.startsWith("image/") || att.fileType.startsWith("video/")
  );

  // Filter only images for the viewer
  const imageAttachments = attachments.filter((att) =>
    att.fileType.startsWith("image/")
  );

  if (mediaAttachments.length === 0) return null;

  const handleImageClick = (clickedIndex: number) => {
    const clickedAttachment = mediaAttachments[clickedIndex];
    if (!clickedAttachment) return;

    // Only open viewer for images, not videos
    if (!clickedAttachment.fileType.startsWith("image/")) {
      window.open(clickedAttachment.storageUrl, "_blank");
      return;
    }

    const imageIndex = imageAttachments.findIndex(
      (img) => img.fileId === clickedAttachment.fileId
    );
    
    if (imageIndex !== -1) {
      openImageViewer(imageAttachments, imageIndex, messageInfo);
    }
  };

  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg overflow-hidden",
        mediaAttachments.length === 1 && "grid-cols-1",
        mediaAttachments.length === 2 && "grid-cols-2",
        mediaAttachments.length === 3 && "grid-cols-2",
        mediaAttachments.length >= 4 && "grid-cols-2"
      )}
    >
      {mediaAttachments.slice(0, 4).map((attachment, index) => (
        <div
          key={attachment.fileId}
          className={cn(
            "relative aspect-square bg-background/10 rounded overflow-hidden group",
            mediaAttachments.length === 3 && index === 0 && "row-span-2"
          )}
        >
          {attachment.fileType.startsWith("image/") ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={attachment.storageUrl}
                alt={attachment.fileName}
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleImageClick(index);
                }}
              />
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 dark:bg-black/90 rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-background/20 hover:bg-background/30 transition-colors cursor-pointer"
              onClick={() => window.open(attachment.storageUrl, "_blank")}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🎬</div>
                <div className="text-xs opacity-70 px-2 truncate">
                  {attachment.fileName}
                </div>
              </div>
            </div>
          )}

          {/* Show count indicator for 4+ images */}
          {index === 3 && mediaAttachments.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">
                +{mediaAttachments.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={isOpen}
        onClose={closeImageViewer}
        images={images}
        initialIndex={initialIndex}
        messageInfo={viewerMessageInfo}
      />
    </div>
  );
}
