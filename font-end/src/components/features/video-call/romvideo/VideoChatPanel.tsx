"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Sparkles, ChevronDown } from "lucide-react";
import {
  RoomContext,
  useChat,
  formatChatMessageLinks,
} from "@livekit/components-react";
import { useContext } from "react";

interface ChatPanelProps {
  onClose: () => void;
  isVisible: boolean;
}

export function ChatPanel({ onClose, isVisible }: ChatPanelProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const room = useContext(RoomContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use LiveKit's built-in chat hook
  const { send, chatMessages } = useChat();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  };

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      // Only show scroll button if there are messages and user has scrolled up
      setShowScrollButton(chatMessages.length > 0 && !isNearBottom);
    }
  };

  useEffect(() => {
    // Delay scroll to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
      // Hide scroll button when new messages arrive (auto scroll to bottom)
      setShowScrollButton(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [chatMessages]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      send(chatMessage.trim());
      setChatMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-card via-card to-card/95 border-l border-border/50 flex flex-col z-50 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl backdrop-blur-xl ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Enhanced Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <MessageCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-card-foreground font-semibold text-lg">
                Tin nhắn
              </h3>
              <p className="text-xs text-muted-foreground">Cuộc gọi video</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-y-auto scroll-smooth bg-gradient-to-b from-transparent via-background/5 to-transparent scrollbar-hide"
      >
        <div className="space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-purple-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-card-foreground">
                Chưa có tin nhắn
              </h4>
              <p className="text-sm mb-1">
                Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện trong cuộc
                gọi
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message, index) => {
                const isLocal =
                  message.from?.identity === room?.localParticipant?.identity;
                const isFirstMessage = index === 0;
                const isNewDay =
                  index > 0 &&
                  new Date(message.timestamp).toDateString() !==
                    new Date(chatMessages[index - 1].timestamp).toDateString();

                return (
                  <div key={message.timestamp}>
                    {/* Date Separator */}
                    {isFirstMessage || isNewDay ? (
                      <div className="flex items-center justify-center my-6">
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Message */}
                    <div
                      className={`flex flex-col space-y-2 ${
                        isLocal ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Name (for non-local messages) */}
                      {!isLocal && (
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold text-white">
                            {(
                              message.from?.name ||
                              message.from?.identity ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {message.from?.name ||
                              message.from?.identity ||
                              "Unknown"}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] ${
                          isLocal ? "ml-auto" : "mr-auto"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                            isLocal
                              ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-purple-500/25"
                              : "bg-gradient-to-br from-muted/80 to-muted/60 text-muted-foreground border border-border/50 shadow-muted/25"
                          }`}
                        >
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: String(
                                formatChatMessageLinks(message.message) ||
                                  message.message
                              ),
                            }}
                          />
                        </div>

                        {/* Message Time */}
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isLocal ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-muted-foreground/70">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Input */}
      <div className="p-4 border-t border-border/30 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-gradient-to-r from-muted/50 to-muted/30 border-border/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 transition-all duration-200 placeholder:text-muted-foreground/60"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!chatMessage.trim()}
            size="sm"
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 rounded-full w-10 h-10 bg-transparent border-2 border-purple-500/50 text-purple-400 shadow-lg shadow-purple-500/25 z-20 backdrop-blur-sm hover:bg-transparent"
          size="sm"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
