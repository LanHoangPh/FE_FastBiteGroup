"use client";

import { useState, useRef, useEffect } from "react";
import { PostSummaryDto } from "@/types/customer/post";

interface PostContentProps {
  post: PostSummaryDto;
}

export function PostContent({ post }: PostContentProps) {
  // Don't render anything if there's no title or content
  if (!post.title && !post.content) {
    return null;
  }

  // Move all hooks to the top level to avoid conditional hook calls
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content overflows
      const element = contentRef.current;
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setShowSeeMore(isOverflowing);
    }
  }, [post.content]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="px-4 pb-3">
      {/* Post Title */}
      {post.title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      {post.content && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div
            ref={contentRef}
            className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${
              !isExpanded ? "line-clamp-5" : ""
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: !isExpanded ? 5 : "unset",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.content}
          </div>
          {showSeeMore && (
            <button
              onClick={toggleExpanded}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mt-1"
            >
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
