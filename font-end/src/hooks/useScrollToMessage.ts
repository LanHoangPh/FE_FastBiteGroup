import { useCallback, useState, useRef } from "react";

interface UseScrollToMessageReturn {
  scrollToMessage: (messageId: string) => void;
  highlightedMessageId: string | null;
}

export function useScrollToMessage(): UseScrollToMessageReturn {
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToMessage = useCallback((messageId: string) => {
    // Find the message element by data attribute
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    
    if (messageElement) {
      // Smooth scroll to the message
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Highlight the message temporarily
      setHighlightedMessageId(messageId);
      
      // Clear any existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Remove highlight after 3 seconds
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    } else {
      console.warn(`Message with ID ${messageId} not found in DOM`);
    }
  }, []);

  return {
    scrollToMessage,
    highlightedMessageId,
  };
}
