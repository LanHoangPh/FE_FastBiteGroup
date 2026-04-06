"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Globe, Play, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkPreviewData } from "@/types/customer/hub.types";
import { fetchLinkPreview } from "@/lib/api/customer/conversations";
import { getDomain, isVideoUrl, isImageUrl, getYouTubeVideoId } from "@/lib/utils/linkUtils";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
  url: string;
  className?: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

interface LinkPreviewCardProps {
  data: LinkPreviewData;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
}

function LinkPreviewCard({ data, onRemove, showRemoveButton, className }: LinkPreviewCardProps) {
  const [imageError, setImageError] = useState(false);
  const domain = getDomain(data.url);
  const isVideo = isVideoUrl(data.url);
  const isImage = isImageUrl(data.url);
  const youtubeId = getYouTubeVideoId(data.url);

  const handleClick = () => {
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = () => {
    if (isVideo) return <Play className="w-4 h-4" />;
    if (isImage) return <ImageIcon className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const getImageUrl = () => {
    if (imageError) return null;
    
    // YouTube thumbnail
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    
    // Use provided image or favicon
    return data.image || data.favicon;
  };

  const imageUrl = getImageUrl();

  return (
    <div
      className={cn(
        "relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer max-w-md",
        className
      )}
      onClick={handleClick}
    >
      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Image/Thumbnail */}
      {imageUrl && (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={data.title || data.url}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {/* Title */}
            {data.title && (
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                {data.title}
              </h4>
            )}
            
            {/* Description */}
            {data.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {data.description}
              </p>
            )}
            
            {/* URL and site info */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {data.favicon && !imageError && (
                <img
                  src={data.favicon}
                  alt=""
                  className="w-4 h-4 rounded"
                  onError={() => setImageError(true)}
                />
              )}
              <span className="truncate">
                {data.siteName || domain || data.url}
              </span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkPreviewSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 max-w-md">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function LinkPreview({ url, className, onRemove, showRemoveButton = false }: LinkPreviewProps) {
  const {
    data: previewData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["linkPreview", url],
    queryFn: () => fetchLinkPreview({ url }),
    enabled: !!url,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return <LinkPreviewSkeleton />;
  }

  if (isError || !previewData) {
    // Fallback to simple link display
    return (
      <div
        className={cn(
          "relative group border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer max-w-md",
          className
        )}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      >
        {showRemoveButton && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-sm text-blue-500 hover:text-blue-600 truncate">
            {url}
          </span>
          <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <LinkPreviewCard
      data={previewData}
      onRemove={onRemove}
      showRemoveButton={showRemoveButton}
      className={className}
    />
  );
}
