"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, Sparkles } from "lucide-react";

interface ReactionPickerProps {
  onReactionSelect: (reactionCode: string) => void;
  disabled?: boolean;
}

// Enhanced emoji reactions with categories
const REACTION_CATEGORIES = {
  popular: {
    label: "Phổ biến",
    icon: "🔥",
    emojis: ["👍", "❤️", "😂", "😮", "🎉", "🔥"]
  },
  emotions: {
    label: "Cảm xúc", 
    icon: "😊",
    emojis: ["😊", "😍", "🥰", "😘", "😢", "😡", "😱", "🤔"]
  },
  gestures: {
    label: "Cử chỉ",
    icon: "👏", 
    emojis: ["👏", "🙏", "👌", "✌️", "🤝", "💪", "🤲", "👋"]
  }
};

export function ReactionPicker({ onReactionSelect, disabled = false }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof REACTION_CATEGORIES>("popular");

  const handleReactionClick = (reactionCode: string) => {
    onReactionSelect(reactionCode);
    setOpen(false); // Close popover after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-950/30 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 hover:scale-110 active:scale-95 group"
        >
          <Smile className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl" 
        align="start"
        sideOffset={8}
      >
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chọn reaction
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100/60 dark:bg-gray-800/60 rounded-lg">
            {Object.entries(REACTION_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(key as keyof typeof REACTION_CATEGORIES)}
                className={`h-8 px-3 text-xs rounded-md transition-all duration-200 ${
                  activeCategory === key
                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "hover:bg-white/60 dark:hover:bg-gray-700/60"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-6 gap-1 min-w-[240px]">
            {REACTION_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:scale-125 active:scale-110 transition-all duration-200 rounded-lg group"
                onClick={() => handleReactionClick(emoji)}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <span className="group-hover:animate-bounce">{emoji}</span>
              </Button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="flex gap-1">
              {["👍", "❤️", "😂"].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:scale-110 active:scale-95 transition-all duration-200 rounded-full"
                  onClick={() => handleReactionClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
              <div className="flex-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                Nhanh
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
