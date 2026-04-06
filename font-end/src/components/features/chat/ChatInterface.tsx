import { useState, useRef } from "react";
import { DirectChatHeader } from "./DirectChatHeader";
import { GroupChatHeader } from "./GroupChatHeader";
import { MessageList, MessageListRef } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useScrollToMessage } from "@/hooks/useScrollToMessage";
import {
  ConversationDetailDto,
  ConversationType,
  MessageDto,
} from "@/types/customer/user.types";
import { PagedResult } from "@/types/api.types";

interface ChatInterfaceProps {
  conversationDetails: ConversationDetailDto;
  initialMessagesPage?: PagedResult<MessageDto>; // Optional override for initial messages
  onSearchOpen?: () => void;
  highlightedMessageId?: string | null;
}

export function ChatInterface({
  conversationDetails,
  initialMessagesPage,
  onSearchOpen,
  highlightedMessageId: externalHighlightedMessageId,
}: ChatInterfaceProps) {
  const [replyToMessage, setReplyToMessage] = useState<MessageDto | null>(null);
  const messageListRef = useRef<MessageListRef>(null);

  const {
    scrollToMessage,
    highlightedMessageId: internalHighlightedMessageId,
  } = useScrollToMessage();

  // Use external highlighted message ID if provided, otherwise use internal one
  const highlightedMessageId =
    externalHighlightedMessageId || internalHighlightedMessageId;

  // Use provided initialMessagesPage or fall back to the one in conversationDetails
  const messagesPage = initialMessagesPage || conversationDetails.messagesPage;

  const handleReply = (message: MessageDto) => {
    setReplyToMessage(message);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Header (Non-flexible) */}
      <div className="flex-shrink-0 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        {conversationDetails.conversationType === ConversationType.Group ? (
          <GroupChatHeader
            conversationDetails={conversationDetails}
            onSearchOpen={onSearchOpen}
          />
        ) : (
          <DirectChatHeader
            conversationId={conversationDetails.conversationId}
            partner={conversationDetails.partner}
            displayName={conversationDetails.displayName}
            conversationType={conversationDetails.conversationType}
            avatarUrl={conversationDetails.avatarUrl}
            onSearchOpen={onSearchOpen}
          />
        )}
      </div>

      {/* Message Area (Flexible Container) */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 dark:from-gray-800/20 dark:via-transparent dark:to-gray-800/20" />

        {/* Simple MessageList - search handled by separate sheet */}
        <MessageList
          ref={messageListRef}
          initialMessagesPage={messagesPage}
          conversationId={conversationDetails.conversationId}
          conversationType={conversationDetails.conversationType}
          onReply={handleReply}
          onScrollToMessage={scrollToMessage}
          highlightedMessageId={highlightedMessageId}
        />
      </div>

      {/* Typing Indicator */}
      <div className="flex-shrink-0">
        <TypingIndicator conversationId={conversationDetails.conversationId} />
      </div>

      {/* Input Area (Non-flexible) */}
      <div className="flex-shrink-0 border-t border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg">
        <ChatInput
          conversationId={conversationDetails.conversationId}
          replyToMessage={replyToMessage}
          onCancelReply={handleCancelReply}
          onMessageSent={() => messageListRef.current?.scrollToBottom()}
        />
      </div>
    </div>
  );
}
