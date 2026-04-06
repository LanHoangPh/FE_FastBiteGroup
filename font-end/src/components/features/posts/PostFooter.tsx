"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostSummaryDto } from "@/types/customer/post";
import { cn } from "@/lib/utils";
import { toggleLike as toggleLikeApi } from "@/lib/api/customer/post";
import { toast } from "sonner";

interface PostFooterProps {
  post: PostSummaryDto;
  groupId: string;
  onComment?: () => void;
}

export function PostFooter({ post, groupId, onComment }: PostFooterProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeApi(post.postId),
    onMutate: () => {
      // Optimistic update
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    },
    onSuccess: (result) => {
      // Update with actual result from server
      setIsLiked(result.isLikedByCurrentUser);
      setLikeCount(result.newLikeCount);

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    },
    onError: (error) => {
      // Revert optimistic update on error
      setIsLiked(post.isLikedByCurrentUser);
      setLikeCount(post.likeCount);
      console.error("Failed to update like status:", error);
      toast.error("Không thể thực hiện thao tác thích");
    },
  });

  const handleLikePost = async () => {
    likeMutation.mutate();
    queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
  };

  const handleCommentPost = () => {
    if (onComment) {
      onComment();
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    } else {
      // Default behavior if no handler provided
      console.log("Comment on post:", post.postId);
    }
  };

  const handleSharePost = () => {
    // TODO: Implement share functionality
    console.log("Share post:", post.postId);
    toast.info("Chức năng chia sẻ sẽ được cập nhật trong phiên bản tới");
  };

  return (
    <div className="px-4 pb-3">
      {/* Stats */}
      {(likeCount > 0 || post.commentCount > 0) && (
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500 fill-current" />
              {likeCount}
            </span>
          )}
          {post.commentCount > 0 && <span>{post.commentCount} bình luận</span>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikePost}
          disabled={likeMutation.isPending}
          className={cn(
            "flex items-center gap-2 flex-1 justify-center py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
            isLiked && "text-pink-600 dark:text-pink-400"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isLiked && "fill-current"
            )}
          />
          <span>Thích</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCommentPost}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Bình luận</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSharePost}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Share2 className="h-5 w-5" />
          <span>Chia sẻ</span>
        </Button>
      </div>
    </div>
  );
}
