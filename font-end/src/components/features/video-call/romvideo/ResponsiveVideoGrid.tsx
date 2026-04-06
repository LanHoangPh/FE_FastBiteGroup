"use client";

import React from "react";
import {
  GridLayout,
  ParticipantTile,
  ConnectionQualityIndicator,
  ParticipantName,
  useParticipants,
  TrackReference,
  VideoTrack,
  AudioTrack,
  useTracks,
  ParticipantContext,
  useTrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import styles from "./CallInterface.module.css";

interface ResponsiveVideoGridProps {
  tracks: TrackReference[];
  className?: string;
}

// Custom ParticipantTile that leverages LiveKit's components properly
function CustomParticipantTile({
  className,
  ...props
}: React.ComponentProps<typeof ParticipantTile>) {
  return (
    <div className={cn("relative group", styles.participantTile, className)}>
      {/* Use LiveKit's ParticipantTile - it handles video/avatar and names automatically */}
      <ParticipantTile 
        className="h-full w-full bg-gray-900 border border-white/10 rounded-lg overflow-hidden"
        {...props}
      />
      
      {/* Participant name overlay with proper styling */}
      <div className={cn("absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded px-3 py-2 text-white text-sm font-medium z-20", styles.participantName)}>
        <ParticipantName className="text-white font-medium" />
      </div>
      
      {/* Connection quality indicator */}
      <div className="absolute top-2 right-2 z-10">
        <ConnectionQualityIndicator className="text-white" />
      </div>
    </div>
  );
}

// Loading skeleton for participant tiles
function ParticipantSkeleton() {
  return (
    <div className={cn(
      "aspect-video w-full rounded-lg border border-white/10 bg-gray-900",
      styles.participantSkeleton
    )}>
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

// Participant placeholder when no video track is available
function ParticipantPlaceholder({ participant }: { participant: any }) {
  return (
    <div className={cn("relative group h-full w-full", styles.participantTile)}>
      <div className="h-full w-full bg-gray-900 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
            <AvatarImage src={participant?.metadata ? JSON.parse(participant.metadata)?.avatarUrl : undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl font-bold">
              {participant?.name?.charAt(0)?.toUpperCase() || participant?.identity?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <p className="text-white text-lg font-semibold">
            {participant?.name || participant?.identity || "Người dùng"}
          </p>
          <p className="text-gray-400 text-sm mt-1">Chưa bật camera</p>
        </div>
      </div>
      
      {/* Participant name overlay */}
      <div className={cn("absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded px-3 py-2 text-white text-sm font-medium z-20", styles.participantName)}>
        <span>{participant?.name || participant?.identity || "Người dùng"}</span>
      </div>
      
      {/* Connection quality indicator */}
      <div className="absolute top-2 right-2 z-10">
        <ConnectionQualityIndicator className="text-white" participant={participant} />
      </div>
      
      {/* Audio indicator when speaking */}
      {participant?.isSpeaking && (
        <div className="absolute top-2 left-2 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
          🎤 Đang nói
        </div>
      )}
    </div>
  );
}

export function ResponsiveVideoGrid({ tracks, className }: ResponsiveVideoGridProps) {
  const participants = useParticipants();
  const participantCount = participants.length;

  // Show loading skeletons while participants are connecting
  if (participantCount === 0) {
    return (
      <div className={cn("h-full w-full p-4 flex items-center justify-center", className)}>
        <ParticipantSkeleton />
      </div>
    );
  }

  // Filter tracks to only show camera tracks (not microphone tracks)
  const videoTracks = tracks.filter(track => 
    track.source === Track.Source.Camera || 
    track.source === Track.Source.ScreenShare
  );

  // If there are participants but no video tracks, show participant tiles anyway
  const shouldShowParticipants = participantCount > 0;
  const hasVideoTracks = videoTracks.length > 0;

  // Calculate grid layout based on participant count
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
  };

  return (
    <div className={cn("h-full w-full p-4", className)}>
      {hasVideoTracks ? (
        // Use LiveKit's GridLayout when we have video tracks
        <GridLayout 
          tracks={videoTracks}
          className={cn(
            "h-full w-full gap-4",
            getGridClass(participantCount)
          )}
        >
          <CustomParticipantTile />
        </GridLayout>
      ) : shouldShowParticipants ? (
        // Show participant placeholders when no video tracks but participants exist
        <div className={cn(
          "grid gap-4 h-full w-full",
          getGridClass(participantCount)
        )}>
          {participants.map((participant) => (
            <div key={participant.sid} className="aspect-video min-h-[200px] h-full">
              <ParticipantPlaceholder participant={participant} />
            </div>
          ))}
        </div>
      ) : (
        // Fallback loading state
        <div className="h-full w-full flex items-center justify-center">
          <ParticipantSkeleton />
        </div>
      )}
    </div>
  );
}
