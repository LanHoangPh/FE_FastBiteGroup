"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share, Monitor } from "lucide-react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";

interface ScreenShareToggleProps {
  className?: string;
}

export function ScreenShareToggle({ className = "" }: ScreenShareToggleProps) {
  const localParticipant = useLocalParticipant();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if currently screen sharing
  useEffect(() => {
    if (localParticipant) {
      setIsScreenSharing(localParticipant.isScreenShareEnabled);
    }
  }, [localParticipant]);

  // Listen for screen share events
  useEffect(() => {
    if (!localParticipant) return;

    const handleTrackPublished = (publication: any) => {
      if (
        publication.kind === "video" &&
        publication.source === Track.Source.ScreenShare
      ) {
        setIsScreenSharing(true);
      }
    };

    const handleTrackUnpublished = (publication: any) => {
      if (
        publication.kind === "video" &&
        publication.source === Track.Source.ScreenShare
      ) {
        setIsScreenSharing(false);
      }
    };

    // Note: Screen share events are handled by LiveKit automatically
    // We just need to listen to the isScreenShareEnabled state changes
  }, [localParticipant]);

  const handleScreenShare = async () => {
    if (!localParticipant || isLoading) return;

    setIsLoading(true);
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        await localParticipant.localParticipant.setScreenShareEnabled(false);
      } else {
        // Start screen sharing
        await localParticipant.localParticipant.setScreenShareEnabled(true);
      }
    } catch (error) {
      // Handle error - could show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        </div>
      );
    }

    if (isScreenSharing) {
      return <Monitor className="w-6 h-6" />;
    }

    return <Share className="w-6 h-6" />;
  };

  const getButtonClass = () => {
    const baseClass =
      "rounded-full w-14 h-14 border-2 transition-all duration-200 transform active:scale-95";

    if (isLoading) {
      return `${baseClass} bg-white/20 text-white border-white/30 cursor-not-allowed`;
    }

    if (isScreenSharing) {
      return `${baseClass} bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border-sky-400/50 hover:border-sky-400`;
    }

    return `${baseClass} bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50`;
  };

  return (
    <Button
      onClick={handleScreenShare}
      disabled={isLoading}
      className={getButtonClass()}
      title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
    >
      {getButtonContent()}
    </Button>
  );
}
