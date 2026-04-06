"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AttachmentInfoDto } from "@/types/customer/user.types";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  attachment: AttachmentInfoDto;
  isOwn?: boolean;
}

export function AudioPlayer({ attachment, isOwn = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setError(true);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !duration) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle download
  const handleDownload = async () => {
    try {
      // First try direct link approach (works if CORS is properly configured)
      const link = document.createElement("a");
      link.href = attachment.storageUrl;
      link.download = attachment.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      // Try to trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Direct download failed, trying fetch approach:", error);
      
      try {
        // Fallback: try fetch approach with proper headers
        const response = await fetch(attachment.storageUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (fetchError) {
        console.error("Fetch download also failed:", fetchError);
        
        // Final fallback: open in new tab
        window.open(attachment.storageUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
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

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-red-800 dark:text-red-200">
            Cannot play audio
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

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
      isOwn 
        ? "bg-white/10 hover:bg-white/15" 
        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
    )}>
      <audio ref={audioRef} src={attachment.storageUrl} preload="metadata" />
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={isLoading}
        className={cn(
          "w-10 h-10 rounded-full p-0 transition-all duration-200",
          isOwn
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Progress and Info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* File name and duration */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-sm font-medium truncate",
            isOwn ? "text-white/90" : "text-gray-900 dark:text-gray-100"
          )}>
            {attachment.fileName.replace(/\.[^/.]+$/, "")} {/* Remove extension */}
          </div>
          <div className={cn(
            "text-xs tabular-nums",
            isOwn ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          )}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="flex-1"
            disabled={isLoading || !duration}
          />
        </div>

        {/* File size */}
        <div className={cn(
          "text-xs",
          isOwn ? "text-white/60" : "text-gray-400 dark:text-gray-500"
        )}>
          {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className={cn(
          "w-8 h-8 p-0",
          isOwn
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
}
