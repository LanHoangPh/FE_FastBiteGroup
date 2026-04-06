"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Image,
  Video,
} from "lucide-react";
import { FileUploadResponseDto } from "@/types/customer/file";
import { PostAttachmentDto } from "@/types/customer/post";
import { ImageViewer } from "@/components/features/fileupload/ImageViewer";

interface MediaCarouselProps {
  attachments: (FileUploadResponseDto | PostAttachmentDto)[];
  className?: string;
  showDownloadButton?: boolean;
  showExternalLink?: boolean;
  onBackToPost?: () => void;
}

// Type guards
const isPostAttachment = (
  attachment: FileUploadResponseDto | PostAttachmentDto
): attachment is PostAttachmentDto => {
  return (attachment as PostAttachmentDto).storageUrl !== undefined;
};

// Helper functions to access properties safely
const getFileType = (attachment: FileUploadResponseDto | PostAttachmentDto) => {
  return isPostAttachment(attachment) ? attachment.fileType || "" : "";
};

const getStorageUrl = (
  attachment: FileUploadResponseDto | PostAttachmentDto
) => {
  return isPostAttachment(attachment) ? attachment.storageUrl : attachment.url;
};

const getFileSize = (attachment: FileUploadResponseDto | PostAttachmentDto) => {
  return isPostAttachment(attachment) ? attachment.fileSize : 0;
};

export function MediaCarousel({
  attachments,
  className = "",
  showDownloadButton = true,
  showExternalLink = true,
  onBackToPost,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());

  // Filter only images and videos for carousel
  const mediaItems = attachments.filter(
    (a) =>
      getFileType(a).startsWith("image/") || getFileType(a).startsWith("video/")
  );

  // Documents that are not part of carousel
  const documents = attachments.filter(
    (a) =>
      !getFileType(a).startsWith("image/") &&
      !getFileType(a).startsWith("video/")
  );

  const handleLoadError = (fileId: string) => {
    setLoadErrors((prev) => new Set(prev).add(fileId));
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
    );
  }, [mediaItems.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
    );
  }, [mediaItems.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const renderCurrentMedia = () => {
    if (mediaItems.length === 0) return null;

    const currentItem = mediaItems[currentIndex];
    const isImage = getFileType(currentItem).startsWith("image/");
    const isVideo = getFileType(currentItem).startsWith("video/");
    const hasLoadError = loadErrors.has(currentItem.fileId.toString());

    if (isImage) {
      if (hasLoadError) {
        return (
          <div className="relative group w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <Image className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Không thể tải ảnh
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
              {currentItem.fileName}
            </p>
          </div>
        );
      }

      return (
        <div className="relative group w-full h-full flex items-center justify-center bg-black/5">
          <img
            src={getStorageUrl(currentItem)}
            alt={currentItem.fileName}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onError={() => handleLoadError(currentItem.fileId.toString())}
            onClick={() => {
              setViewingImage({
                url: getStorageUrl(currentItem),
                name: currentItem.fileName,
              });
            }}
          />
          {showExternalLink && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      );
    }

    if (isVideo) {
      if (hasLoadError) {
        return (
          <div className="relative group w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <Video className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Không thể tải video
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate w-full text-center">
              {currentItem.fileName}
            </p>
          </div>
        );
      }

      return (
        <div className="relative group w-full h-full flex items-center justify-center bg-black/5">
          <video
            src={getStorageUrl(currentItem)}
            controls
            className="max-w-full max-h-full object-contain"
            onError={() => handleLoadError(currentItem.fileId.toString())}
          />
        </div>
      );
    }

    return null;
  };

  const renderDocuments = () => {
    if (documents.length === 0) return null;

    return (
      <div className="space-y-2 mt-4">
        <h4 className="font-medium text-sm text-muted-foreground">
          Tệp đính kèm
        </h4>
        {documents.map((doc) => (
          <div
            key={doc.fileId.toString()}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getFileType(doc).split("/")[1]?.toUpperCase() || "FILE"} •
                  {(getFileSize(doc) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {showDownloadButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = getStorageUrl(doc);
                  link.download = doc.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="ml-2"
              >
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (attachments.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Media Carousel */}
      {mediaItems.length > 0 && (
        <div className="relative">
          {/* Main Media Display */}
          <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden group">
            {renderCurrentMedia()}

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                {/* Left Arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 transition-opacity duration-200"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Right Arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 transition-opacity duration-200"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Media Counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {mediaItems.map((item, index) => {
                const hasLoadError = loadErrors.has(item.fileId.toString());
                return (
                  <button
                    key={item.fileId.toString()}
                    onClick={() => goToSlide(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                  >
                    {hasLoadError ? (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-xs text-gray-400">
                          {getFileType(item).startsWith("image/") ? "📷" : "🎥"}
                        </span>
                      </div>
                    ) : getFileType(item).startsWith("image/") ? (
                      <img
                        src={getStorageUrl(item)}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                        onError={() => handleLoadError(item.fileId.toString())}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-xs">🎥</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents Section */}
      {renderDocuments()}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewer
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
          imageUrl={viewingImage.url}
          imageName={viewingImage.name}
          onBackToPost={onBackToPost}
          showBackButton={!!onBackToPost}
        />
      )}
    </div>
  );
}
