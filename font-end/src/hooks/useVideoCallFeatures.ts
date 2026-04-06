// hooks/useVideoCallFeatures.ts
import { useState, useCallback } from "react";
import {
  muteParticipantMic,
  stopParticipantVideo,
  removeParticipant,
  endCallForAll,
} from "@/lib/api/customer/calls";
import { toast } from "sonner";

interface UseVideoCallFeaturesProps {
  sessionId: string;
  userRole: "host" | "moderator" | "participant";
}

interface UseVideoCallFeaturesReturn {
  // Recording state
  isRecording: boolean;
  recordingStatus: "idle" | "starting" | "recording" | "stopping";

  // Screen sharing state
  isScreenSharing: boolean;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleScreenShare: () => void;
  muteParticipant: (participantId: string) => Promise<void>;
  stopParticipantVideo: (participantId: string) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  endCallForAll: () => Promise<void>;
}

export function useVideoCallFeatures({
  sessionId,
  userRole,
}: UseVideoCallFeaturesProps): UseVideoCallFeaturesReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "starting" | "recording" | "stopping"
  >("idle");
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const startRecording = useCallback(async () => {
    if (userRole !== "host" && userRole !== "moderator") {
      toast.error("Only hosts and moderators can start recording");
      return;
    }

    try {
      setRecordingStatus("starting");
      // In a real implementation, you would call your backend API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsRecording(true);
      setRecordingStatus("recording");
      toast.success("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
      setRecordingStatus("idle");
    }
  }, [userRole]);

  const stopRecording = useCallback(async () => {
    try {
      setRecordingStatus("stopping");
      // In a real implementation, you would call your backend API
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsRecording(false);
      setRecordingStatus("idle");
      toast.success("Recording stopped");
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to stop recording");
      setRecordingStatus("recording");
    }
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing((prev) => !prev);
    // In a real implementation, you would integrate with LiveKit's screen sharing API
  }, []);

  const muteParticipant = useCallback(
    async (participantId: string) => {
      if (userRole !== "host" && userRole !== "moderator") {
        toast.error("Only hosts and moderators can mute participants");
        return;
      }

      try {
        await muteParticipantMic(sessionId, participantId);
        toast.success("Participant muted");
      } catch (error) {
        console.error("Failed to mute participant:", error);
        toast.error("Failed to mute participant");
      }
    },
    [sessionId, userRole]
  );

  const stopVideo = useCallback(
    async (participantId: string) => {
      if (userRole !== "host" && userRole !== "moderator") {
        toast.error("Only hosts and moderators can stop participant video");
        return;
      }

      try {
        await stopParticipantVideo(sessionId, participantId);
        toast.success("Participant video stopped");
      } catch (error) {
        console.error("Failed to stop participant video:", error);
        toast.error("Failed to stop participant video");
      }
    },
    [sessionId, userRole]
  );

  const removeUser = useCallback(
    async (participantId: string) => {
      if (userRole !== "host") {
        toast.error("Only hosts can remove participants");
        return;
      }

      try {
        await removeParticipant(sessionId, participantId);
        toast.success("Participant removed");
      } catch (error) {
        console.error("Failed to remove participant:", error);
        toast.error("Failed to remove participant");
      }
    },
    [sessionId, userRole]
  );

  const endCall = useCallback(async () => {
    if (userRole !== "host") {
      toast.error("Only hosts can end the call for all participants");
      return;
    }

    try {
      await endCallForAll(sessionId);
      toast.success("Call ended for all participants");
    } catch (error) {
      console.error("Failed to end call:", error);
      toast.error("Failed to end call");
    }
  }, [sessionId, userRole]);

  return {
    isRecording,
    recordingStatus,
    isScreenSharing,
    startRecording,
    stopRecording,
    toggleScreenShare,
    muteParticipant: muteParticipant,
    stopParticipantVideo: stopVideo,
    removeParticipant: removeUser,
    endCallForAll: endCall,
  };
}
