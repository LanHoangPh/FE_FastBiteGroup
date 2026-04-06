"use client";

import { MessageDto, MessageType } from "@/types/customer/user.types";
import { FileAttachment } from "./FileAttachment";
import { MediaGrid } from "./MediaGrid";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { LinkPreview } from "./LinkPreview";
import { extractUrls, getUrlPositions } from "@/lib/utils/linkUtils";
import { Button } from "@/components/ui/button";
import { joinVideoCall } from "@/lib/api/customer/video-call";
import { handleApiError } from "@/lib/utils/errorUtils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface MessageContentProps {
  message: MessageDto;
  onScrollToMessage?: (messageId: string) => void;
}

function TextWithLinks({ text }: { text: string }) {
  const parts = getUrlPositions(text);

  return (
    <div className="space-y-2">
      {/* Render text with clickable links */}
      <div className="text-sm whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
          if (part.type === "url") {
            return (
              <a
                key={index}
                href={part.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {part.content}
              </a>
            );
          }
          return <span key={index}>{part.content}</span>;
        })}
      </div>

      {/* Render link previews */}
      {extractUrls(text).map((url, index) => (
        <LinkPreview key={`preview-${index}`} url={url} />
      ))}
    </div>
  );
}

export function MessageContent({
  message,
  onScrollToMessage,
}: MessageContentProps) {
  const { user } = useAuthStore();

  switch (message.messageType) {
    case MessageType.Text:
      return <TextWithLinks text={message.content} />;

    case MessageType.Image:
      return (
        <div className="space-y-2">
          {message.content && <TextWithLinks text={message.content} />}
          {message.attachments && message.attachments.length > 0 && (
            <MediaGrid
              attachments={message.attachments.filter((att) =>
                att.fileType.startsWith("image/")
              )}
              messageInfo={{
                senderName: message.sender.displayName,
                sentAt: message.sentAt,
                content: message.content,
              }}
            />
          )}
        </div>
      );

    case MessageType.Video:
      return (
        <div className="space-y-2">
          {message.content && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <VideoPlayer
                  key={attachment.fileId}
                  attachment={attachment}
                  isOwn={message.isMine}
                />
              ))}
            </div>
          )}
        </div>
      );

    case MessageType.File:
      return (
        <div className="space-y-2">
          {message.content && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-1">
              {message.attachments.map((attachment) => (
                <FileAttachment
                  key={attachment.fileId}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      );

    case MessageType.Audio:
      return (
        <div className="space-y-2">
          {message.content && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <AudioPlayer
                  key={attachment.fileId}
                  attachment={attachment}
                  isOwn={message.isMine}
                />
              ))}
            </div>
          )}
        </div>
      );

    case MessageType.Poll:
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium">📊 Khảo sát</div>
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content || "Khảo sát không có nội dung"}
          </div>
          <div className="text-xs opacity-70">
            Tính năng khảo sát sẽ được triển khải sớm
          </div>
        </div>
      );

    case MessageType.VideoCall:
      // Extract videoSessionId from JSON content if it exists
      let videoSessionId = null;
      try {
        // Try to parse the content as JSON
        const contentData = JSON.parse(message.content);
        videoSessionId = contentData.videoCallSessionId;
      } catch (e) {
        // If parsing fails, use the content directly
        videoSessionId = message.content;
      }

      // If videoSessionId is "Cuộc gọi đã kết thúc" or similar, set it to null
      if (videoSessionId === "Cuộc gọi đã kết thúc") {
        videoSessionId = null;
      }

      const handleJoinCall = async () => {
        if (!videoSessionId || !user?.id) {
          toast.error("Không thể tham gia cuộc gọi", {
            description: "Thông tin cuộc gọi không hợp lệ",
          });
          return;
        }

        try {
          // Call joinVideoCall function to get connection details
          const callData = await joinVideoCall(
            videoSessionId,
            message.conversationId,
            user.id
          );

          // Create URL for the video call page with the connection details
          const searchParams = new URLSearchParams({
            groupName: "Cuộc gọi video",
            token: callData.livekitToken,
            serverUrl: callData.livekitServerUrl,
            isInitiator: "false",
            userId: user.id,
            conversationId: message.conversationId.toString(),
          }).toString();

          // Open the video call page in a new tab
          const url = `/video-call/${videoSessionId}?${searchParams}`;
          window.open(url, "_blank");
        } catch (error) {
          handleApiError(error, "Không thể tham gia cuộc gọi");
        }
      };

      return (
        <div className="flex items-center gap-2 p-2 bg-background/10 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center">
            📹
          </div>
          <div className="text-sm flex-1">
            <div className="font-medium">Cuộc gọi video</div>
            <div className="text-xs opacity-70">
              {videoSessionId
                ? "Nhấn vào nút để tham gia cuộc gọi"
                : "Cuộc gọi đã kết thúc"}
            </div>
          </div>
          {videoSessionId && (
            <Button
              onClick={handleJoinCall}
              className="h-8 px-3 text-xs"
              variant="default"
            >
              Tham gia
            </Button>
          )}
        </div>
      );

    default:
      return (
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      );
  }
}
