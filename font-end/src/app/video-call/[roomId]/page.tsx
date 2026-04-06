"use client";

import { VideoCallRoom } from "@/components/features/video-call/romvideo/VideoCallRoom";
import { use } from "react";

interface VideoCallPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    groupName?: string;
    token?: string;
    serverUrl?: string;
    settings?: string;
    isInitiator?: string;
    userId?: string;
    conversationId?: string;
  }>;
}

export default function VideoCallPage({
  params,
  searchParams,
}: VideoCallPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <VideoCallRoom
        roomId={resolvedParams.roomId}
        conversationId={parseInt(resolvedSearchParams.conversationId || "1")}
        groupName={resolvedSearchParams.groupName || "Video Call"}
        livekitToken={resolvedSearchParams.token}
        livekitServerUrl={resolvedSearchParams.serverUrl}
        settings={resolvedSearchParams.settings}
        isInitiator={resolvedSearchParams.isInitiator === "true"}
        userId={resolvedSearchParams.userId}
      />
    </div>
  );
}
