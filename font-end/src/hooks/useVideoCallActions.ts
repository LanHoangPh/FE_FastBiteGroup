import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startVideoCall, joinVideoCall } from "@/lib/api/customer/calls";
import { useVideoCallStore } from "@/store/videoCallStore";

/**
 * Custom hook for video call actions (start, join)
 * Provides reusable mutations for video call functionality
 */
export function useVideoCallActions() {
  const router = useRouter();
  const { setCurrentSession } = useVideoCallStore();

  // Start video call mutation
  const startCallMutation = useMutation({
    mutationFn: (conversationId: number) => startVideoCall(conversationId),
    onSuccess: (data, conversationId) => {
      // Set the current session in the store
      setCurrentSession({
        sessionId: data.videoCallSessionId,
        conversationId,
        livekitToken: data.livekitToken,
        livekitServerUrl: data.livekitServerUrl,
        isActive: true,
        isInitiator: true,
      });

      // Open video call in new tab using the existing route structure
      const videoCallUrl = `/video-call/${data.videoCallSessionId}?conversationId=${conversationId}&token=${encodeURIComponent(data.livekitToken)}&serverUrl=${encodeURIComponent(data.livekitServerUrl)}&isInitiator=true`;
      window.open(videoCallUrl, "_blank", "noopener,noreferrer");
      
      toast.success("Cuộc gọi video đã được bắt đầu");
    },
    onError: (error: any) => {
      console.error("Failed to start video call:", error);
      // Error is already handled by the API function
    },
  });

  // Join video call mutation
  const joinCallMutation = useMutation({
    mutationFn: ({ sessionId, conversationId }: { sessionId: string; conversationId: number }) => 
      joinVideoCall(sessionId),
    onSuccess: (data, { sessionId, conversationId }) => {
      // Set the current session in the store
      setCurrentSession({
        sessionId,
        conversationId,
        livekitToken: data.livekitToken,
        livekitServerUrl: data.livekitServerUrl,
        isActive: true,
        isInitiator: false,
      });

      // Open video call in new tab using the existing route structure
      const videoCallUrl = `/video-call/${sessionId}?conversationId=${conversationId}&token=${encodeURIComponent(data.livekitToken)}&serverUrl=${encodeURIComponent(data.livekitServerUrl)}&isInitiator=false`;
      window.open(videoCallUrl, "_blank", "noopener,noreferrer");
      
      toast.success("Đã tham gia cuộc gọi video");
    },
    onError: (error: any) => {
      console.error("Failed to join video call:", error);
      // Error is already handled by the API function
    },
  });

  return {
    startCall: startCallMutation.mutate,
    joinCall: joinCallMutation.mutate,
    isStartingCall: startCallMutation.isPending,
    isJoiningCall: joinCallMutation.isPending,
    startCallMutation,
    joinCallMutation,
  };
}
