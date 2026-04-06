"use client";

import { Video, Maximize2, PhoneOff, Users, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCallSessionData } from "@/types/video/video-call-api.types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface VideoCallMinimizedProps {
  sessionData: VideoCallSessionData;
  conversationId: number;
  groupName: string;
  onMaximize: () => void;
  onEndCall: () => void;
}

export function VideoCallMinimized({
  sessionData,
  conversationId,
  groupName,
  onMaximize,
  onEndCall,
}: VideoCallMinimizedProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Timer for call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={cn(
          "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 transform",
          isHovered ? "scale-105 shadow-3xl" : "scale-100"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced Header with Gradient */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-t-2xl" />
        
        <div className="relative p-4">
          <div className="flex items-center gap-4">
            {/* Enhanced Video Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/10">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            
            {/* Enhanced Call Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white text-sm font-semibold truncate">
                  {groupName}
                </p>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span>Trực tiếp</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Cuộc gọi nhóm</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMaximize}
                className="h-9 w-9 p-0 text-white hover:bg-white/10 hover:text-cyan-400 transition-all duration-200 rounded-xl backdrop-blur-sm border border-white/5 hover:border-cyan-400/30"
                title="Mở rộng"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEndCall}
                className="h-9 w-9 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 rounded-xl backdrop-blur-sm border border-red-500/20 hover:border-red-400/50"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Status Bar */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Sparkles className="w-3 h-3" />
                <span>FastBite Group</span>
              </div>
              <div className="text-gray-500">
                ID: {sessionData.videoCallSessionId.slice(-6)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-purple-400/30 animate-pulse" />
        <div className="absolute top-3 right-8 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-3 left-6 w-1 h-1 rounded-full bg-cyan-400/30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
