"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  Room,
} from "livekit-client";
import { VideoDevice, AudioDevice } from "../types/video/video-call.types";

// ===== MEDIA DEVICES =====
export interface UseMediaDevicesReturn {
  cameras: VideoDevice[];
  microphones: AudioDevice[];
  speakers: AudioDevice[];
  isLoading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
}

export function useMediaDevices(): UseMediaDevicesReturn {
  const [cameras, setCameras] = useState<VideoDevice[]>([]);
  const [microphones, setMicrophones] = useState<AudioDevice[]>([]);
  const [speakers, setSpeakers] = useState<AudioDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadMediaDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const devices = await Room.getLocalDevices();

      const camerasList: VideoDevice[] = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: "videoinput" as const,
        }));

      const microphonesList: AudioDevice[] = devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: "audioinput" as const,
        }));

      const speakersList: AudioDevice[] = devices
        .filter((device) => device.kind === "audiooutput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          kind: "audiooutput" as const,
        }));

      setCameras(camerasList);
      setMicrophones(microphonesList);
      setSpeakers(speakersList);
      setHasLoaded(true);
    } catch (err) {
      setError("Không thể tải danh sách thiết bị");
    } finally {
      setIsLoading(false);
    }
  }, []); // Không depend vào gì để tránh re-create

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleDeviceChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadMediaDevices();
      }, 500);
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      clearTimeout(timeoutId);
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!hasLoaded) {
      await loadMediaDevices();
    }
  }, [hasLoaded, loadMediaDevices]);

  return {
    cameras,
    microphones,
    speakers,
    isLoading,
    error,
    refreshDevices,
  };
}

// ===== CAMERA =====
interface UseCameraProps {
  enabled: boolean;
  deviceId?: string;
  onError?: (error: string) => void;
}

interface UseCameraReturn {
  videoTrack: LocalVideoTrack | null;
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchDevice: (deviceId: string) => Promise<void>;
}

export function useCamera({
  enabled,
  deviceId,
  onError,
}: UseCameraProps): UseCameraReturn {
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const isMountedRef = useRef(true);
  const prevDeviceIdRef = useRef<string | undefined>(deviceId);
  const prevEnabledRef = useRef<boolean>(enabled);

  const cleanup = useCallback(async () => {
    if (videoTrackRef.current) {
      try {
        await videoTrackRef.current.stop();
        videoTrackRef.current = null;
        setVideoTrack(null);
        setIsActive(false);
      } catch (err) {
        // Silent error handling for production
      }
    }
  }, []); // Không depend vào gì để tránh re-create

  const startCamera = useCallback(async () => {
    if (!deviceId) {
      setError("Không có thiết bị camera được chọn");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Cleanup existing track first
      if (videoTrackRef.current) {
        await cleanup();
      }

      const track = await createLocalVideoTrack({
        deviceId,
        resolution: { width: 640, height: 480, frameRate: 15 },
      });

      // Add small delay to avoid race condition
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check if component is still mounted before setting state
      if (isMountedRef.current) {
        videoTrackRef.current = track;
        setVideoTrack(track);
        setIsActive(true);
      } else {
        track.stop();
      }
    } catch (err) {
      const errorMessage =
        "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [deviceId, onError]); // Không depend vào cleanup để tránh re-create

  const stopCamera = useCallback(async () => {
    await cleanup();
  }, []); // Không depend vào cleanup để tránh re-create

  const switchDevice = useCallback(
    async (newDeviceId: string) => {
      if (isActive) {
        await startCamera();
      }
    },
    [isActive, startCamera]
  );

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      // Camera was enabled
      startCamera();
    } else if (!enabled && prevEnabledRef.current) {
      // Camera was disabled
      stopCamera();
    }
    prevEnabledRef.current = enabled;
  }, [enabled]); // Chỉ depend vào enabled để tránh vòng lặp

  useEffect(() => {
    if (enabled && deviceId && deviceId !== prevDeviceIdRef.current) {
      // Device changed while camera is enabled
      startCamera();
    }
    prevDeviceIdRef.current = deviceId;
  }, [deviceId, enabled]); // Chỉ depend vào deviceId và enabled

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []); // Không depend vào cleanup để tránh re-run

  return {
    videoTrack,
    isLoading,
    error,
    isActive,
    startCamera,
    stopCamera,
    switchDevice,
  };
}

// ===== MICROPHONE =====
interface UseMicrophoneProps {
  enabled: boolean;
  deviceId?: string;
  onError?: (error: string) => void;
}

interface UseMicrophoneReturn {
  audioTrack: LocalAudioTrack | null;
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => void;
  switchDevice: (deviceId: string) => Promise<void>;
}

export function useMicrophone({
  enabled,
  deviceId,
  onError,
}: UseMicrophoneProps): UseMicrophoneReturn {
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const isMountedRef = useRef(true);
  const prevDeviceIdRef = useRef<string | undefined>(deviceId);
  const prevEnabledRef = useRef<boolean>(enabled);

  const cleanup = useCallback(async () => {
    if (audioTrackRef.current) {
      try {
        await audioTrackRef.current.stop();
        audioTrackRef.current = null;
        setAudioTrack(null);
        setIsActive(false);
      } catch (err) {
        // Silent error handling for production
      }
    }
  }, []);

  const startMicrophone = useCallback(async () => {
    if (!deviceId) {
      setError("Không có thiết bị microphone được chọn");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cleanup();

      const track = await createLocalAudioTrack({
        deviceId,
      });

      if (isMountedRef.current) {
        audioTrackRef.current = track;
        setAudioTrack(track);
        setIsActive(true);
      } else {
        track.stop();
      }
    } catch (err) {
      const errorMessage =
        "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [deviceId, onError]); // Không depend vào cleanup để tránh re-create

  const stopMicrophone = useCallback(async () => {
    await cleanup();
  }, []); // Không depend vào cleanup để tránh re-run

  const switchDevice = useCallback(
    async (newDeviceId: string) => {
      if (isActive) {
        await startMicrophone();
      }
    },
    [isActive, startMicrophone]
  );

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      startMicrophone();
    } else if (!enabled && prevEnabledRef.current) {
      stopMicrophone();
    }
    prevEnabledRef.current = enabled;
  }, [enabled, startMicrophone, stopMicrophone]);

  useEffect(() => {
    if (enabled && deviceId && deviceId !== prevDeviceIdRef.current) {
      startMicrophone();
    }
    prevDeviceIdRef.current = deviceId;
  }, [deviceId, enabled, startMicrophone]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []); // Không depend vào cleanup để tránh re-run

  return {
    audioTrack,
    isLoading,
    error,
    isActive,
    startMicrophone,
    stopMicrophone,
    switchDevice,
  };
}

// ===== COMBINED MEDIA HOOK =====
interface UseLiveKitMediaProps {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  selectedCamera?: string;
  selectedMicrophone?: string;
  onError?: (error: string) => void;
}

interface UseLiveKitMediaReturn {
  // Devices
  cameras: VideoDevice[];
  microphones: AudioDevice[];
  speakers: AudioDevice[];
  devicesLoading: boolean;
  devicesError: string | null;
  refreshDevices: () => Promise<void>;

  // Camera
  videoTrack: LocalVideoTrack | null;
  cameraLoading: boolean;
  cameraError: string | null;
  cameraActive: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;

  // Microphone
  audioTrack: LocalAudioTrack | null;
  microphoneLoading: boolean;
  microphoneError: string | null;
  microphoneActive: boolean;
  startMicrophone: () => Promise<void>;
  stopMicrophone: () => void;

  // Combined
  isLoading: boolean;
  error: string | null;
}

export function useLiveKitMedia({
  cameraEnabled,
  microphoneEnabled,
  selectedCamera,
  selectedMicrophone,
  onError,
}: UseLiveKitMediaProps): UseLiveKitMediaReturn {
  // Devices
  const {
    cameras,
    microphones,
    speakers,
    isLoading: devicesLoading,
    error: devicesError,
    refreshDevices,
  } = useMediaDevices();

  // Memoize onError function to prevent re-creation
  const memoizedOnError = useCallback(
    (error: string) => {
      onError?.(error);
    },
    [onError]
  );

  // Memoize camera parameters to prevent re-creation
  const cameraParams = useMemo(
    () => ({
      enabled: cameraEnabled,
      deviceId: selectedCamera,
      onError: memoizedOnError,
    }),
    [cameraEnabled, selectedCamera, memoizedOnError]
  );

  // Camera
  const {
    videoTrack,
    isLoading: cameraLoading,
    error: cameraError,
    isActive: cameraActive,
    startCamera,
    stopCamera,
  } = useCamera(cameraParams);

  // Memoize microphone parameters to prevent re-creation
  const microphoneParams = useMemo(
    () => ({
      enabled: microphoneEnabled,
      deviceId: selectedMicrophone,
      onError: memoizedOnError,
    }),
    [microphoneEnabled, selectedMicrophone, memoizedOnError]
  );

  // Microphone
  const {
    audioTrack,
    isLoading: microphoneLoading,
    error: microphoneError,
    isActive: microphoneActive,
    startMicrophone,
    stopMicrophone,
  } = useMicrophone(microphoneParams);

  const isLoading = devicesLoading || cameraLoading || microphoneLoading;
  const error = devicesError || cameraError || microphoneError;

  return {
    // Devices
    cameras,
    microphones,
    speakers,
    devicesLoading,
    devicesError,
    refreshDevices,

    // Camera
    videoTrack,
    cameraLoading,
    cameraError,
    cameraActive,
    startCamera,
    stopCamera,

    // Microphone
    audioTrack,
    microphoneLoading,
    microphoneError,
    microphoneActive,
    startMicrophone,
    stopMicrophone,

    // Combined
    isLoading,
    error,
  };
}
