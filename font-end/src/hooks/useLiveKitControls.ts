import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Room } from "livekit-client";

interface UseLiveKitControlsProps {
  room: Room | null;
  isConnected: boolean;
}

export function useLiveKitControls({
  room,
  isConnected,
}: UseLiveKitControlsProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  const isUpdatingRef = useRef(false);
  const roomRef = useRef(room);
  const isConnectedRef = useRef(isConnected);
  const hasInitializedRef = useRef(false);
  const isVideoEnabledRef = useRef(isVideoEnabled);
  const isAudioEnabledRef = useRef(isAudioEnabled);
  const isScreenShareEnabledRef = useRef(isScreenShareEnabled);

  // Update refs
  roomRef.current = room;
  isConnectedRef.current = isConnected;
  isVideoEnabledRef.current = isVideoEnabled;
  isAudioEnabledRef.current = isAudioEnabled;
  isScreenShareEnabledRef.current = isScreenShareEnabled;

  // Initial sync when room connects - only run once per room connection
  useEffect(() => {
    if (!room || !isConnected || isUpdatingRef.current) return;

    const localParticipant = room.localParticipant;
    if (localParticipant && !hasInitializedRef.current) {
      const videoEnabled = localParticipant.isCameraEnabled;
      const audioEnabled = localParticipant.isMicrophoneEnabled;
      const screenShareEnabled = localParticipant.isScreenShareEnabled;

      setIsVideoEnabled(videoEnabled);
      setIsAudioEnabled(audioEnabled);
      setIsScreenShareEnabled(screenShareEnabled);
      hasInitializedRef.current = true;
    }
  }, [room?.name, isConnected]); // Only depend on room name, not room object

  // Reset initialization flag when room changes
  useEffect(() => {
    hasInitializedRef.current = false;
  }, [room?.name]);

  // Cleanup camera and microphone when room disconnects
  useEffect(() => {
    if (!room || !isConnected) {
      // Reset all states when room disconnects
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setIsScreenShareEnabled(false);
      hasInitializedRef.current = false;
    }
  }, [room, isConnected]);

  const toggleVideo = useCallback(async () => {
    const currentRoom = roomRef.current;
    const currentConnected = isConnectedRef.current;

    if (!currentRoom || !currentConnected || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    const newState = !isVideoEnabledRef.current;

    try {
      // Add a small delay to prevent rapid toggling
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if room is still connected after delay
      if (
        !currentRoom ||
        !currentRoom.state ||
        currentRoom.state !== "connected"
      ) {
        return;
      }

      await currentRoom.localParticipant.setCameraEnabled(newState);
      // Manually update state immediately for UI responsiveness
      setIsVideoEnabled(newState);
    } catch (error) {
      // Revert state on error
      setIsVideoEnabled(!newState);

      // If it's a timeout error, try to reset the camera state
      if (error instanceof Error && error.message.includes("Timeout")) {
        try {
          await currentRoom.localParticipant.setCameraEnabled(false);
          setIsVideoEnabled(false);
        } catch (resetError) {
          // Silent error handling
        }
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, []); // Remove isVideoEnabled dependency to prevent recreation

  const toggleAudio = useCallback(async () => {
    const currentRoom = roomRef.current;
    const currentConnected = isConnectedRef.current;

    if (!currentRoom || !currentConnected || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    const newState = !isAudioEnabledRef.current;

    try {
      // Add a small delay to prevent rapid toggling
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if room is still connected after delay
      if (
        !currentRoom ||
        !currentRoom.state ||
        currentRoom.state !== "connected"
      ) {
        return;
      }

      await currentRoom.localParticipant.setMicrophoneEnabled(newState);
      // Manually update state immediately for UI responsiveness
      setIsAudioEnabled(newState);
    } catch (error) {
      // Revert state on error
      setIsAudioEnabled(!newState);
    } finally {
      isUpdatingRef.current = false;
    }
  }, []); // Remove isAudioEnabled dependency to prevent recreation

  const toggleScreenShare = useCallback(async () => {
    const currentRoom = roomRef.current;
    const currentConnected = isConnectedRef.current;

    if (!currentRoom || !currentConnected || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    const newState = !isScreenShareEnabledRef.current;
    try {
      if (newState) {
        await currentRoom.localParticipant.setScreenShareEnabled(true);
      } else {
        await currentRoom.localParticipant.setScreenShareEnabled(false);
      }
      // Manually update state immediately for UI responsiveness
      setIsScreenShareEnabled(newState);
    } catch (error) {
      // Revert state on error
      setIsScreenShareEnabled(!newState);
    } finally {
      isUpdatingRef.current = false;
    }
  }, []); // Remove isScreenShareEnabled dependency to prevent recreation

  // Memoize the controls object to prevent unnecessary re-renders
  const controls = useMemo(
    () => ({
      isVideoEnabled,
      isAudioEnabled,
      isScreenShareEnabled,
      toggleVideo,
      toggleAudio,
      toggleScreenShare,
    }),
    [
      isVideoEnabled,
      isAudioEnabled,
      isScreenShareEnabled,
      toggleVideo,
      toggleAudio,
      toggleScreenShare,
    ]
  );

  return controls;
}
