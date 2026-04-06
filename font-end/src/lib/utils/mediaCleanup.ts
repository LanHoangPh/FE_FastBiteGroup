/**
 * Utility functions for cleaning up media devices (camera, microphone)
 */

/**
 * Stop all active media tracks to release camera and microphone
 */
export async function stopAllMediaTracks(): Promise<void> {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Get all active media tracks
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop all tracks
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Stop specific media tracks by type
 */
export async function stopMediaTracksByType(
  type: "video" | "audio" | "both"
): Promise<void> {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints: MediaStreamConstraints = {};

      if (type === "video" || type === "both") {
        constraints.video = true;
      }
      if (type === "audio" || type === "both") {
        constraints.audio = true;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      stream.getTracks().forEach((track) => {
        if (type === "both" || track.kind === type) {
          track.stop();
        }
      });
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Check if camera is currently in use
 */
export async function isCameraInUse(): Promise<boolean> {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTracks = stream.getVideoTracks();

      // Stop the stream immediately after checking
      stream.getTracks().forEach((track) => track.stop());

      return videoTracks.length > 0;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if microphone is currently in use
 */
export async function isMicrophoneInUse(): Promise<boolean> {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTracks = stream.getAudioTracks();

      // Stop the stream immediately after checking
      stream.getTracks().forEach((track) => track.stop());

      return audioTracks.length > 0;
    }
    return false;
  } catch (error) {
    return false;
  }
}
