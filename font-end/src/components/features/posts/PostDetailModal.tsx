"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPostDetail,
  addComment,
  toggleLike,
  getCommentReplies,
  updateComment,
  deleteComment,
} from "@/lib/api/customer/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Send,
  Share,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Flag,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { RichTextViewer } from "@/components/ui/RichTextViewer";
import { MediaCarousel } from "./MediaCarousel";
import { EditPostDialog } from "./EditPostDialog";
import { updatePost } from "@/lib/api/customer/post";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ReportContentModal } from "@/components/features/reports/ReportContentModal";
import { ReportedContentType } from "@/types/customer/moderation";

interface PostDetailModalProps {
  postId: number | null;
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  isCommentByCurrentUser?: (commentAuthorId: string) => boolean;
}

export function PostDetailModal({
  postId,
  groupId,
  isOpen,
  onClose,
  isCommentByCurrentUser: externalIsCommentByCurrentUser,
}: PostDetailModalProps) {
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [editingParentId, setEditingParentId] = useState<number | undefined>(
    undefined
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Check if a comment belongs to the current user
  const isCommentByCurrentUserInternal = (commentAuthorId: string) => {
    return !!(
      commentAuthorId &&
      currentUser?.id &&
      commentAuthorId === currentUser.id
    );
  };

  // Use external function if provided, otherwise use internal function
  const isCommentByCurrentUser =
    externalIsCommentByCurrentUser || isCommentByCurrentUserInternal;

  const canComment =
    commentContent.trim().length > 0 && commentContent.length <= 200;
  const canEdit =
    editingContent.trim().length > 0 && editingContent.length <= 200;

  const handleCommentChange = (value: string) => {
    if (value.length > 200) {
      toast.error("Bình luận không được quá 200 ký tự");
      return;
    }
    setCommentContent(value);
  };

  const handleEditContentChange = (value: string) => {
    if (value.length > 200) {
      toast.error("Bình luận không được quá 200 ký tự");
      return;
    }
    setEditingContent(value);
  };

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostDetail(postId!),
    enabled: !!postId && isOpen,
  });
  // Use attachments from post detail (if present) otherwise fetched API
  // const displayAttachments = post?.attachments ?? attachments ?? [];
  const displayAttachments = post?.attachments ?? [];

  const createComment = useMutation({
    mutationFn: () =>
      addComment(postId!, {
        content: commentContent,
        parentCommentId: replyingTo || undefined,
      }),
    onSuccess: () => {
      // Save current scroll position
      const scrollContainer = scrollContainerRef.current;
      const scrollTop = scrollContainer?.scrollTop || 0;

      // If replying to a comment, keep replies expanded
      const wasReplyingTo = replyingTo;

      setCommentContent("");
      setReplyingTo(null);

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      if (wasReplyingTo) {
        queryClient.invalidateQueries({
          queryKey: ["comment-replies", wasReplyingTo],
        });
        // Keep replies expanded for the comment we just replied to
        setExpandedReplies((prev) => {
          const newSet = new Set(prev);
          newSet.add(wasReplyingTo);
          return newSet;
        });
      }

      // Restore scroll position immediately without delay
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }

      toast.success("Đã thêm bình luận");
    },
    onError: () => {
      toast.error("Không thể thêm bình luận");
    },
  });

  const handleLike = useMutation({
    mutationFn: () => toggleLike(postId!),
    onSuccess: (result) => {
      // Update post data immediately with new like data
      queryClient.setQueryData(["post", postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likeCount: result.newLikeCount,
          isLikedByCurrentUser: result.isLikedByCurrentUser,
        };
      });
      // Also update group posts list if it exists
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    },
    onError: () => {
      toast.error("Không thể thực hiện thao tác thích");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: (data: {
      title?: string | null;
      contentJson: string;
      attachmentFileIds?: number[];
    }) => updatePost(postId!, data),
    onSuccess: (updatedPost) => {
      // Update post data in query cache
      queryClient.setQueryData(["post", postId], updatedPost);
      // Also update group posts list if it exists
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      setIsEditDialogOpen(false);
      toast.success("Đã cập nhật bài viết");
    },
    onError: () => {
      toast.error("Không thể cập nhật bài viết");
    },
  });

  const handleEditPost = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEditPost = async (data: {
    title?: string | null;
    contentJson: string;
    attachmentFileIds?: number[];
  }) => {
    updatePostMutation.mutate(data);
  };

  const handleSubmitComment = () => {
    if (!commentContent.trim()) return;
    createComment.mutate();
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    // Auto-expand replies for this comment
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      return newSet;
    });
  };

  const handleDeleteComment = (commentId: number, parentCommentId?: number) => {
    setDeleteCommentId(commentId);
    setShowDeleteDialog(true);
  };

  const doDeleteComment = async (
    commentId: number,
    parentCommentId?: number
  ) => {
    try {
      await deleteComment(commentId);
      // refresh data
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comment-replies", parentCommentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success("Đã xóa bình luận");
      setShowDeleteDialog(false);
      setDeleteCommentId(null);
    } catch (e) {
      toast.error("Xóa bình luận thất bại");
    }
  };

  const doStartEdit = (
    commentId: number,
    current: string,
    parentCommentId?: number
  ) => {
    // Use bottom input bar for editing
    setEditingCommentId(commentId);
    setEditingParentId(parentCommentId);
    setEditingContent(current);
    setReplyingTo(null);
    setCommentContent(current);
  };

  const doSaveEdit = async (commentId: number, parentCommentId?: number) => {
    if (!editingContent.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }
    try {
      await updateComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent("");
      setEditingParentId(undefined);
      setCommentContent("");
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comment-replies", parentCommentId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success("Đã cập nhật bình luận");
    } catch (e) {
      toast.error("Cập nhật bình luận thất bại");
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReportComment = (commentId: number) => {
    setReportCommentId(commentId);
    setIsReportModalOpen(true);
  };

  // Component to display replies for a comment
  const CommentReplies = ({
    commentId,
    replyCount,
  }: {
    commentId: number;
    replyCount: number;
  }) => {
    const {
      data: replies,
      isLoading: repliesLoading,
      error,
    } = useQuery({
      queryKey: ["comment-replies", commentId],
      queryFn: () => getCommentReplies(commentId, 1),
      enabled: expandedReplies.has(commentId),
    });

    if (!expandedReplies.has(commentId)) return null;

    return (
      <div className="ml-8 mt-3 space-y-3 border-l-2 border-indigo-200 dark:border-indigo-700 pl-4">
        {repliesLoading ? (
          <div className="text-center py-3 text-slate-500 dark:text-slate-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mx-auto mb-2"></div>
            <p className="text-xs">Đang tải trả lời...</p>
          </div>
        ) : error ? (
          <div className="text-center py-3 text-red-500">
            <p className="text-xs">Lỗi khi tải trả lời</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        ) : replies?.items && replies.items.length > 0 ? (
          replies.items.map((reply: any) => (
            <div key={reply.commentId}>
              <div className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                <Avatar className="h-6 w-6 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-600">
                  <AvatarImage src={reply.author.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                    {reply.author.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-medium text-xs ${
                        isCommentByCurrentUser(reply.author.userId)
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {reply.author.fullName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                    {reply.content}
                  </p>

                  {/* Action buttons for replies (no reply button for child messages) */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Empty space for consistency */}
                    </div>
                    <div className="flex items-center gap-2">
                      {reply.replyCount > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {reply.replyCount} trả lời
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                          <DropdownMenuItem
                            onClick={() => handleReply(reply.commentId)}
                          >
                            <MessageCircle className="h-3 w-3 mr-2" /> Trả lời
                          </DropdownMenuItem>
                          {reply.canEdit && (
                            <DropdownMenuItem
                              onClick={() =>
                                doStartEdit(
                                  reply.commentId,
                                  reply.content,
                                  commentId
                                )
                              }
                              className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Pencil className="h-3 w-3 mr-2" /> Sửa
                            </DropdownMenuItem>
                          )}
                          {reply.canDelete && (
                            <DropdownMenuItem
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              onClick={() =>
                                handleDeleteComment(reply.commentId, commentId)
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-2" /> Xóa
                            </DropdownMenuItem>
                          )}
                          {/* Report option - show for all users except the author */}
                          {reply.author.userId !== currentUser?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleReportComment(reply.commentId)
                                }
                              >
                                <Flag className="h-3 w-3 mr-2" /> Báo cáo
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-3 text-slate-500 dark:text-slate-400">
            <p className="text-xs">Chưa có trả lời nào</p>
          </div>
        )}
      </div>
    );
  };

  if (!post && !isLoading) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          showCloseButton={false}
        >
          <DialogHeader className="relative flex-shrink-0 border-b border-slate-200 dark:border-slate-700 py-4 bg-transparent">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 sr-only">
              Chi tiết bài đăng
            </DialogTitle>
            <div className="relative">
              <h2 className="w-full text-center text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Chi tiết bài đăng
              </h2>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {post && post.canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <DropdownMenuItem
                        onClick={handleEditPost}
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa bài viết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 px-1 sm:px-2 bg-slate-50 dark:bg-slate-900"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : post ? (
              <>
                {/* Post Content */}
                <Card className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 rounded-xl hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-indigo-100 dark:ring-indigo-800">
                        <AvatarImage src={post.author.avatarUrl || undefined} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                          {post.author.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 text-sm mb-2 flex-wrap">
                          <span className="font-semibold text-base break-words text-slate-900 dark:text-slate-100">
                            {post.author.fullName}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            · {formatRelativeTime(post.createdAt)}
                          </span>
                        </div>
                        {post.title && (
                          <div className="font-bold text-xl mb-3 text-slate-900 dark:text-slate-100 break-words">
                            {post.title}
                          </div>
                        )}
                        {(post.contentJson || post.contentHtml) && (
                          <div className="text-base leading-relaxed break-words overflow-hidden">
                            {post.contentJson ? (
                              <RichTextViewer value={post.contentJson} />
                            ) : (
                              <RichTextViewer value={post.contentHtml || ""} />
                            )}
                          </div>
                        )}

                        {/* Post Attachments - Show all in modal */}
                        {displayAttachments &&
                          displayAttachments.length > 0 && (
                            <div className="mt-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-900 p-2 sm:p-3">
                              <MediaCarousel
                                attachments={displayAttachments}
                                showDownloadButton={true}
                                showExternalLink={true}
                              />
                            </div>
                          )}

                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            <button
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                                post.isLikedByCurrentUser
                                  ? "text-red-500 bg-red-50 dark:bg-red-950/20 shadow-sm"
                                  : "text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:shadow-sm"
                              }`}
                              onClick={() => handleLike.mutate()}
                              disabled={handleLike.isPending}
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  post.isLikedByCurrentUser
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span
                                className={`font-medium ${
                                  post.isLikedByCurrentUser
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {post.isLikedByCurrentUser
                                  ? "Bỏ thích"
                                  : "Thích"}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  post.isLikedByCurrentUser
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {post.likeCount}
                              </span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                              <MessageCircle className="h-5 w-5" />
                              <span className="font-medium">Bình luận</span>
                              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                {post.commentCount}
                              </span>
                            </div>
                            <button
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                              onClick={() => {
                                // TODO: Implement share functionality
                                console.log("Share post:", post.postId);
                                toast.info(
                                  "Chức năng chia sẻ sẽ được cập nhật trong phiên bản tới"
                                );
                              }}
                            >
                              <Share className="h-5 w-5" />
                              <span className="font-medium">Chia sẻ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comment Section */}
                <Card className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 rounded-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Bình luận
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {createComment.isPending ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm">Đang thêm bình luận...</p>
                        </div>
                      ) : post.commentsPage?.items &&
                        post.commentsPage.items.length > 0 ? (
                        post.commentsPage.items.map((comment: any) => (
                          <div key={comment.commentId}>
                            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-sm transition-shadow duration-200">
                              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-600">
                                <AvatarImage
                                  src={comment.author.avatarUrl || undefined}
                                />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                                  {comment.author.fullName
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`font-medium text-sm ${
                                      isCommentByCurrentUser(
                                        comment.author.userId
                                      )
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-slate-900 dark:text-slate-100"
                                    }`}
                                  >
                                    {comment.author.fullName}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatRelativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                                  {comment.content}
                                </p>

                                {/* Action buttons */}
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
                                      onClick={() =>
                                        handleReply(comment.commentId)
                                      }
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      <span>Trả lời</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {comment.replyCount > 0 && (
                                      <button
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
                                        onClick={() =>
                                          toggleReplies(comment.commentId)
                                        }
                                      >
                                        {expandedReplies.has(comment.commentId)
                                          ? "Ẩn trả lời"
                                          : `Xem ${comment.replyCount} trả lời`}
                                      </button>
                                    )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleReply(comment.commentId)
                                          }
                                        >
                                          <MessageCircle className="h-3 w-3 mr-2" />{" "}
                                          Trả lời
                                        </DropdownMenuItem>
                                        {comment.canEdit && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              doStartEdit(
                                                comment.commentId,
                                                comment.content
                                              )
                                            }
                                            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                          >
                                            <Pencil className="h-3 w-3 mr-2" />{" "}
                                            Sửa
                                          </DropdownMenuItem>
                                        )}
                                        {comment.canDelete && (
                                          <DropdownMenuItem
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={() =>
                                              handleDeleteComment(
                                                comment.commentId
                                              )
                                            }
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />{" "}
                                            Xóa
                                          </DropdownMenuItem>
                                        )}
                                        {/* Report option - show for all users except the author */}
                                        {comment.author.userId !==
                                          currentUser?.id && (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleReportComment(
                                                  comment.commentId
                                                )
                                              }
                                            >
                                              <Flag className="h-3 w-3 mr-2" />{" "}
                                              Báo cáo
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <CommentReplies
                              commentId={comment.commentId}
                              replyCount={comment.replyCount}
                            />

                            {/* Inline reply input removed; use bottom input bar only */}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-slate-400 dark:text-slate-500" />
                          <p>
                            Chưa có bình luận nào. Hãy là người đầu tiên bình
                            luận!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Comment Input - Fixed at bottom */}
          {post && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
              {replyingTo && (
                <div className="mb-4 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                  <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="flex-1">
                    Trả lời bình luận #{replyingTo}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setReplyingTo(null)}
                  >
                    Hủy
                  </Button>
                </div>
              )}
              {editingCommentId && (
                <div className="mb-4 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="flex-1">
                    Chỉnh sửa bình luận #{editingCommentId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingContent("");
                      setEditingParentId(undefined);
                      setCommentContent("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-3 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() =>
                      doSaveEdit(editingCommentId!, editingParentId)
                    }
                    disabled={!editingContent.trim()}
                  >
                    Lưu
                  </Button>
                </div>
              )}
              <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-start gap-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-600">
                  <AvatarImage src={currentUser?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                    {(currentUser?.fullName || "").slice(0, 2).toUpperCase() ||
                      "B"}
                  </AvatarFallback>
                </Avatar>
                <div className="relative flex-1 min-w-0">
                  <Textarea
                    placeholder={
                      editingCommentId
                        ? "Chỉnh sửa bình luận..."
                        : replyingTo
                        ? "Trả lời bình luận..."
                        : "Viết bình luận công khai..."
                    }
                    value={editingCommentId ? editingContent : commentContent}
                    onChange={(e) =>
                      editingCommentId
                        ? handleEditContentChange(e.target.value)
                        : handleCommentChange(e.target.value)
                    }
                    onKeyDown={(e) => {
                      // Check character limit first
                      const currentLength = editingCommentId
                        ? editingContent.length
                        : commentContent.length;
                      if (
                        currentLength >= 200 &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight" &&
                        e.key !== "Home" &&
                        e.key !== "End"
                      ) {
                        e.preventDefault();
                        toast.error("Bình luận không được quá 200 ký tự");
                        return;
                      }

                      // Handle Enter key for submit
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (editingCommentId) {
                          doSaveEdit(editingCommentId, editingParentId);
                        } else {
                          handleSubmitComment();
                        }
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() =>
                      editingCommentId
                        ? doSaveEdit(editingCommentId, editingParentId)
                        : handleSubmitComment()
                    }
                    disabled={
                      (editingCommentId ? !canEdit : !canComment) ||
                      createComment.isPending
                    }
                    className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {/* Character counter */}
                <div className="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {editingCommentId
                    ? editingContent.length
                    : commentContent.length}
                  /200 ký tự
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 sr-only">
              Xác nhận xóa bình luận
            </DialogTitle>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Xác nhận xóa bình luận
            </h2>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteCommentId && doDeleteComment(deleteCommentId)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              Xóa bình luận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Content Modal */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        contentId={reportCommentId || 0}
        groupId={groupId}
        contentType={ReportedContentType.Comment}
      />

      {/* Edit Post Dialog */}
      {post && (
        <EditPostDialog
          open={isEditDialogOpen}
          initialTitle={post.title}
          initialContent={post.contentJson || post.contentHtml}
          initialContentJson={post.contentJson}
          initialContentHtml={post.contentHtml}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveEditPost}
        />
      )}
    </>
  );
}
