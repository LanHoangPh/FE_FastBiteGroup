"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
  disabled?: boolean;
  className?: string; // Added className prop for better styling flexibility
}

export function AudioRecorder({
  onRecordingComplete,
  disabled,
  className,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        setHasRecording(true);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error(
        "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập."
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  };

  // Play/Pause audio
  const togglePlayAudio = () => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Delete recording
  const deleteRecording = () => {
    setAudioBlob(null);
    setHasRecording(false);
    setRecordingTime(0);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  };

  // Send recording
  const sendRecording = () => {
    if (audioBlob) {
      const audioFile = new File(
        [audioBlob],
        `voice-message-${Date.now()}.webm`,
        {
          type: "audio/webm",
        }
      );
      onRecordingComplete(audioFile);
      deleteRecording(); // Clear after sending
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // If we have a recording, show playback controls
  if (hasRecording && audioBlob) {
    return (
      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayAudio}
          className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Tin nhắn thoại
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {formatTime(recordingTime)}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={deleteRecording}
          className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
        >
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={sendRecording}
          className="h-8 w-8 rounded-full hover:bg-green-100 dark:hover:bg-green-900"
        >
          <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
        </Button>
      </div>
    );
  }

  // If currently recording, show recording controls
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-full px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-900 dark:text-red-100">
            Đang ghi âm
          </span>
        </div>

        <div className="text-sm font-mono text-red-600 dark:text-red-400">
          {formatTime(recordingTime)}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePauseRecording}
          className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
        >
          {isPaused ? (
            <Mic className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <MicOff className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
        >
          <Square className="h-4 w-4 text-red-600 dark:text-red-400" />
        </Button>
      </div>
    );
  }

  // Default state - show record button
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={startRecording}
      className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
    >
      <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    </Button>
  );
}
