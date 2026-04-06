"use client";

import { useState } from "react";
import { ReactionDto } from "@/types/customer/user.types";
import { ReactionBadge } from "./ReactionBadge";

interface ReactionListProps {
  reactions: ReactionDto[];
  messageId: string;
  conversationId: number;
  onReactionToggle: (reactionCode: string) => void;
  disabled?: boolean;
}

export function ReactionList({
  reactions,
  messageId,
  conversationId,
  onReactionToggle,
  disabled = false,
}: ReactionListProps) {
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(
    null
  );

  // Don't render anything if no reactions
  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Group reactions by reaction code
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reactionCode]) {
      acc[reaction.reactionCode] = [];
    }
    acc[reaction.reactionCode].push(reaction);
    return acc;
  }, {} as Record<string, ReactionDto[]>);

  const handleReactionClick = (reactionCode: string) => {
    if (!disabled) {
      setAnimatingReaction(reactionCode);
      onReactionToggle(reactionCode);

      // Reset animation after a short delay
      setTimeout(() => setAnimatingReaction(null), 300);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([reactionCode, reactionList]) => (
        <ReactionBadge
          key={reactionCode}
          reactionCode={reactionCode}
          reactors={reactionList}
          messageId={messageId}
          conversationId={conversationId}
          onReactionToggle={handleReactionClick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
