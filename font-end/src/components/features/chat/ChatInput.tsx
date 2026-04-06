"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Loader2, Mic, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { MessageDto, MessageType } from "@/types/customer/user.types";
import { FileUploadResponseDto } from "@/types/customer/file";
import { SendMessageDto } from "@/types/customer/conversation";
import { sendMessage } from "@/lib/api/customer/conversations";
import { handleApiError } from "@/lib/utils/errorUtils";
import { AttachmentPreviewList } from "./AttachmentPreviewList";
import { InputReplyPreview } from "./InputReplyPreview";
import { EmojiPicker } from "./EmojiPicker";
import { AudioRecorder } from "./AudioRecorder";
import { LinkPreview } from "./LinkPreview";
import { useFileUploader } from "@/hooks/useFileUploader";
import { useChatHub } from "@/providers/ChatHubProvider";
import { useAuthStore } from "@/store/authStore";
import { TypingUserDto } from "@/types/customer/hub.types";
import { extractUrls } from "@/lib/utils/linkUtils";

interface ChatInputProps {
  conversationId: number;
  replyToMessage?: MessageDto | null;
  onCancelReply?: () => void;
  onMessageSent?: () => void; // Add this new prop
}

export function ChatInput({
  conversationId,
  replyToMessage,
  onCancelReply,
  onMessageSent, // Destructure the new prop
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [detectedUrls, setDetectedUrls] = useState<string[]>([]);
  const [removedUrls, setRemovedUrls] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    uploadingFiles,
    uploadFiles,
    removeFile,
    cancelUpload,
    clearAllFiles,
  } = useFileUploader();

  const { startTyping, stopTyping } = useChatHub();

  const isTypingRef = useRef(false);
  const lastTextRef = useRef("");

  // Debounced function to stop typing after 1 second of inactivity
  const debouncedStopTyping = useDebouncedCallback(() => {
    if (isTypingRef.current) {
      stopTyping(conversationId);
      isTypingRef.current = false;
    }
  }, 1000);

  // Handle typing indicators
  useEffect(() => {
    if (!user) return;

    const typingUser: TypingUserDto = {
      userId: user.id,
      fullName: user.fullName,
    };

    const currentText = text.trim();
    const lastText = lastTextRef.current.trim();

    // Only trigger typing events if the text actually changed
    if (currentText !== lastText) {
      if (currentText.length > 0) {
        // User is actively typing
        if (!isTypingRef.current) {
          startTyping(conversationId, typingUser);
          isTypingRef.current = true;
        }

        // Reset the debounced stop typing timer
        debouncedStopTyping();
      } else {
        // User cleared the input - stop typing immediately
        if (isTypingRef.current) {
          stopTyping(conversationId);
          isTypingRef.current = false;
          debouncedStopTyping.cancel();
        }
      }
    } else if (currentText.length > 0 && isTypingRef.current) {
      // Text hasn't changed but user is still "typing" - refresh the timer
      debouncedStopTyping();
    }

    // Update the last text reference
    lastTextRef.current = text;

    // Cleanup on unmount
    return () => {
      if (isTypingRef.current) {
        stopTyping(conversationId);
        isTypingRef.current = false;
      }
      debouncedStopTyping.cancel();
    };
  }, [
    text,
    conversationId,
    startTyping,
    stopTyping,
    user,
    debouncedStopTyping,
  ]);

  // Detect URLs in text
  useEffect(() => {
    const urls = extractUrls(text);
    // Only show URLs that haven't been manually removed
    const visibleUrls = urls.filter((url) => !removedUrls.has(url));
    setDetectedUrls(visibleUrls);
  }, [text, removedUrls]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: SendMessageDto) =>
      sendMessage(conversationId, messageData),
    onMutate: async (messageData) => {
      // Optimistic update - add temporary message to cache
      await queryClient.cancelQueries({
        queryKey: ["messageHistory", conversationId],
      });

      // Get successful file uploads
      const successfulUploads = uploadingFiles.filter(
        (f) => f.status === "success" && f.result
      );

      // Determine message type based on content and attachments
      let messageType = MessageType.Text;
      if (successfulUploads.length > 0) {
        // Check if any uploaded files are images based on file type from the File object
        const hasImage = successfulUploads.some((uploadingFile) =>
          uploadingFile.file.type.startsWith("image/")
        );
        messageType = hasImage ? MessageType.Image : MessageType.File;
      }

      // Create temporary message with proper user data
      // Use a more unique ID to prevent duplicates
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const tempMessage: MessageDto = {
        id: tempId,
        conversationId,
        sender: user
          ? {
              userId: user.id,
              displayName: user.fullName,
              avatarUrl: user.avatarUrl,
            }
          : {
              userId: "current-user",
              displayName: "You",
              avatarUrl: null,
            },
        content: messageData.content || "",
        messageType: messageType,
        sentAt: new Date().toISOString(),
        isDeleted: false,
        attachments:
          successfulUploads.length > 0
            ? successfulUploads.map((uploadingFile) => ({
                fileId: uploadingFile.result!.fileId,
                fileName: uploadingFile.result!.fileName,
                storageUrl: uploadingFile.result!.url,
                fileType: uploadingFile.file.type || "application/octet-stream",
                fileSize: uploadingFile.file.size,
              }))
            : null,
        reactions: null,
        parentMessageId: messageData.parentMessageId,
        parentMessage: null,
        readBy: [],
        canEdit: true,
        canDelete: true,
        isMine: true,
        senderRoleInGroup: null,
      };

      // Add temp message to infinite query cache
      queryClient.setQueryData(
        ["messageHistory", conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: [
              {
                ...oldData.pages[0],
                messages: [tempMessage, ...oldData.pages[0].messages],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Force a refetch to ensure UI updates immediately
      queryClient.invalidateQueries({
        queryKey: ["messageHistory", conversationId],
      });

      return { tempMessage };
    },
    onSuccess: (realMessage, variables, context) => {
      // Replace temporary message with real one
      queryClient.setQueryData(
        ["messageHistory", conversationId],
        (oldData: any) => {
          if (!oldData || !context) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  messages: page.messages.map((msg: MessageDto) =>
                    msg.id === context.tempMessage.id ? realMessage : msg
                  ),
                };
              }
              return page;
            }),
          };
        }
      );

      // Force a refetch to ensure UI updates
      queryClient.invalidateQueries({
        queryKey: ["messageHistory", conversationId],
      });

      // Reset state after successful send
      setText("");
      clearAllFiles();
      setDetectedUrls([]);
      setRemovedUrls(new Set());
      if (replyToMessage && onCancelReply) {
        onCancelReply();
      }

      toast.success("Tin nhắn đã được gửi");
    },
    onError: (error, variables, context) => {
      // Remove temporary message on error
      if (context) {
        queryClient.setQueryData(
          ["messageHistory", conversationId],
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                  return {
                    ...page,
                    messages: page.messages.filter(
                      (msg: MessageDto) => msg.id !== context.tempMessage.id
                    ),
                  };
                }
                return page;
              }),
            };
          }
        );

        // Force a refetch to ensure UI updates
        queryClient.invalidateQueries({
          queryKey: ["messageHistory", conversationId],
        });
      }

      handleApiError(error, "Gửi tin nhắn thất bại");
    },
  });

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  // Handle audio recording completion
  const handleAudioRecording = (audioFile: File) => {
    uploadFiles([audioFile]);
    setShowAudioRecorder(false);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Upload files using the hook
    uploadFiles(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle send message
  const handleSend = () => {
    const trimmedText = text.trim();

    // Check if there are any files still uploading
    const isUploading = uploadingFiles.some(
      (file) => file.status === "uploading"
    );
    if (isUploading) {
      toast.error("Vui lòng chờ upload file hoàn tất trước khi gửi tin nhắn");
      return;
    }

    // Check if we have content or attachments to send
    const hasContent = trimmedText.length > 0;
    const hasAttachments = uploadingFiles.some(
      (file) => file.status === "success"
    );

    if (!hasContent && !hasAttachments) {
      return;
    }

    // Stop typing indicator immediately when user attempts to send
    if (isTypingRef.current) {
      stopTyping(conversationId);
      isTypingRef.current = false;
      debouncedStopTyping.cancel();
    }

    const messageData: SendMessageDto = {
      content: trimmedText || null,
      parentMessageId: replyToMessage?.id || null,
      attachmentFileIds:
        uploadingFiles.filter((f) => f.status === "success" && f.result)
          .length > 0
          ? uploadingFiles
              .filter((f) => f.status === "success" && f.result)
              .map((f) => f.result!.fileId)
          : null,
    };

    sendMessageMutation.mutate(messageData);
    
    // Call the onMessageSent callback
    if (onMessageSent) {
      setTimeout(() => {
        onMessageSent();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle removing URL preview
  const handleRemoveUrlPreview = (url: string) => {
    setRemovedUrls((prev) => new Set([...prev, url]));
  };

  const isDisabled = !text.trim() && uploadingFiles.length === 0;
  const isLoading = sendMessageMutation.isPending;

  return (
    <div className="border-t border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      {/* Reply Preview */}
      {replyToMessage && onCancelReply && (
        <div className="animate-in slide-in-from-bottom-2 duration-200">
          <InputReplyPreview
            replyToMessage={replyToMessage}
            onCancel={onCancelReply}
          />
        </div>
      )}

      {/* Attachment Previews */}
      {uploadingFiles.length > 0 && (
        <div className="animate-in slide-in-from-bottom-2 duration-200">
          <AttachmentPreviewList
            uploadingFiles={uploadingFiles}
            onRemove={removeFile}
            onCancel={cancelUpload}
          />
        </div>
      )}

      {/* Link Previews */}
      {detectedUrls.length > 0 && (
        <div className="animate-in slide-in-from-bottom-2 duration-200 px-4 pt-3">
          <div className="space-y-2">
            {detectedUrls.map((url, index) => (
              <LinkPreview
                key={`input-preview-${index}`}
                url={url}
                onRemove={() => handleRemoveUrlPreview(url)}
                showRemoveButton={true}
                className="max-w-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-4 space-y-3">
        {showAudioRecorder ? (
          /* Audio Recording Interface */
          <div className="animate-in zoom-in-95 duration-200 flex items-center justify-between bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-4 border border-green-200/60 dark:border-green-800/60 shadow-lg backdrop-blur-sm">
            <AudioRecorder
              onRecordingComplete={handleAudioRecording}
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAudioRecorder(false)}
              className="h-9 w-9 rounded-full hover:bg-red-100/80 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              {/* File Upload Button */}
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 rounded-full hover:bg-blue-50/80 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95 group"
              >
                {uploadingFiles.some((f) => f.status === "uploading") ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <Paperclip className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                )}
              </Button>

              {/* Audio Record Button */}
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => setShowAudioRecorder(true)}
                className="h-11 w-11 rounded-full hover:bg-green-50/80 dark:hover:bg-green-950/50 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-95 group"
              >
                <Mic className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Text Input Container */}
            <div className="flex-1 relative">
              <div className="relative bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-800/60 dark:to-gray-700/40 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500/60 dark:focus-within:border-blue-400/60 backdrop-blur-sm">
                <TextareaAutosize
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  minRows={1}
                  maxRows={6}
                  maxLength={2000}
                  className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none disabled:opacity-50 transition-all duration-200"
                />

                {/* Emoji Picker */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isDisabled || isLoading}
              className={`h-12 w-12 flex-shrink-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                isDisabled || isLoading
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 animate-pulse hover:animate-none"
              }`}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Send className="h-5 w-5 text-white transform group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}






