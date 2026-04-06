"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AttachmentInfoDto } from "@/types/customer/user.types";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  attachment: AttachmentInfoDto;
  isOwn?: boolean;
  forceModal?: boolean; // Force modal mode regardless of file size
}

export function VideoPlayer({ attachment, isOwn = false, forceModal = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if video should play inline (< 30MB) or in modal
  const fileSizeInMB = attachment.fileSize / (1024 * 1024);
  const shouldPlayInline = !forceModal && fileSizeInMB < 30;

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing video:", error);
      setError(true);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!videoRef.current || !duration) return;
    const newTime = (value[0] / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (shouldPlayInline) {
      // For inline videos, fullscreen opens the modal
      setIsFullscreen(!isFullscreen);
    } else {
      // For large videos, they're already in modal
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const link = document.createElement("a");
      link.href = attachment.storageUrl;
      link.download = attachment.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(attachment.storageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Auto-hide controls in fullscreen
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isFullscreen && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Handle controls auto-hide
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen, isPlaying]);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Play className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-red-800 dark:text-red-200">
            Cannot play video
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 truncate">
            {attachment.fileName}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Inline Video Player (for files < 30MB)
  if (shouldPlayInline) {
    return (
      <>
        <div className={cn(
          "relative rounded-lg overflow-hidden transition-all duration-200",
          isOwn 
            ? "bg-white/10" 
            : "bg-gray-100 dark:bg-gray-800"
        )}>
          <video
            ref={videoRef}
            src={attachment.storageUrl}
            preload="metadata"
            className="w-full h-auto max-h-64 object-contain"
            controls
            onMouseMove={resetControlsTimeout}
          />
          
          {/* Overlay Controls for better UX */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Video Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="text-white text-xs">
              <div className="font-medium truncate">
                {attachment.fileName.replace(/\.[^/.]+$/, "")}
              </div>
              <div className="opacity-70">
                {fileSizeInMB.toFixed(1)} MB • Playing inline
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Modal for inline videos */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black border-0 rounded-none">
            <DialogTitle className="sr-only">
              {attachment.fileName} - Video Player
            </DialogTitle>
            
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onMouseMove={resetControlsTimeout}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                src={attachment.storageUrl}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay={isPlaying}
              />

              {/* Top Bar */}
              <div className={cn(
                "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0"
              )}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium truncate">
                      {attachment.fileName}
                    </div>
                    <div className="text-sm opacity-70">
                      {fileSizeInMB.toFixed(1)} MB
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(false)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Modal Video Player (for files >= 30MB)
  return (
    <>
      {/* Video Preview/Thumbnail */}
      <div className={cn(
        "relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group",
        isOwn 
          ? "bg-white/10 hover:bg-white/15" 
          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      )}>
        <video
          ref={videoRef}
          src={attachment.storageUrl}
          preload="metadata"
          className="w-full h-48 object-cover"
          onClick={toggleFullscreen}
          onMouseMove={resetControlsTimeout}
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-200">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>

        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {attachment.fileName.replace(/\.[^/.]+$/, "")}
              </div>
              <div className="text-xs opacity-70">
                {fileSizeInMB.toFixed(1)} MB • {formatTime(duration)} • Click to play
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 ml-2"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black border-0 rounded-none">
          <DialogTitle className="sr-only">
            {attachment.fileName} - Video Player
          </DialogTitle>
          
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={attachment.storageUrl}
              className="max-w-full max-h-full object-contain"
              onClick={togglePlayPause}
            />

            {/* Controls Overlay */}
            <div className={cn(
              "absolute inset-0 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium truncate">
                      {attachment.fileName}
                    </div>
                    <div className="text-sm opacity-70">
                      {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(false)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <Slider
                    value={[duration ? (currentTime / duration) * 100 : 0]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="w-full"
                    disabled={isLoading || !duration}
                  />

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/10"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-white hover:bg-white/10"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-20"
                        />
                      </div>
                    </div>

                    <div className="text-sm tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
