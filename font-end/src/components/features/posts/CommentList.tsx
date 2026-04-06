"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CommentItem, CommentItemData } from "./CommentItem";
import { getCommentReplies, getPostComments } from "@/lib/api/customer/post";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommentListProps {
  postId: number;
  onReply?: (commentId: number) => void;
}

export function CommentList({ postId, onReply }: CommentListProps) {
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );

  // Use infinite query for comments
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["post-comments-infinite", postId],
    queryFn: ({ pageParam = 1 }) => getPostComments(postId, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPages
        ? lastPage.pageNumber + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!postId,
  });

  const allComments = commentsData?.pages.flatMap((page) => page.items) || [];

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  if (allComments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allComments.map((comment) => (
        <div key={comment.commentId}>
          <CommentItem
            comment={comment}
            onReply={onReply}
            showReplies={expandedComments.has(comment.commentId)}
            onToggleReplies={() => toggleReplies(comment.commentId)}
          />

          {/* Replies Section */}
          {expandedComments.has(comment.commentId) &&
            comment.replyCount > 0 && (
              <CommentReplies commentId={comment.commentId} onReply={onReply} />
            )}
        </div>
      ))}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Xem thêm bình luận"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CommentRepliesProps {
  commentId: number;
  onReply?: (commentId: number) => void;
}

function CommentReplies({ commentId, onReply }: CommentRepliesProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["comment-replies", commentId],
      queryFn: ({ pageParam = 1 }) => getCommentReplies(commentId, pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.pageNumber < lastPage.totalPages
          ? lastPage.pageNumber + 1
          : undefined,
      initialPageParam: 1,
    });

  const replies = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="ml-8 mt-2 space-y-2 border-l-2 border-muted pl-4">
      {replies.map((reply) => (
        <CommentItem key={reply.commentId} comment={reply} onReply={onReply} />
      ))}

      {hasNextPage && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Xem thêm trả lời"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
