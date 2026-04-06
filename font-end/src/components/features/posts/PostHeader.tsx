"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MoreHorizontal,
  Pin,
  Edit,
  Trash2,
  PinOff,
  MessageSquare,
  Flag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostSummaryDto } from "@/types/customer/post";
import { pinPost, deletePost } from "@/lib/api/customer/post";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ReportContentModal } from "@/components/features/reports/ReportContentModal";
import { ReportedContentType } from "@/types/customer/moderation";

interface PostHeaderProps {
  post: PostSummaryDto;
  groupId: string;
  onEdit?: () => void;
  onComment?: () => void;
}

export function PostHeader({
  post,
  groupId,
  onEdit,
  onComment,
}: PostHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Check if the current user is the author of the post
  const isAuthorCurrentUser = !!(
    post.author?.userId &&
    currentUser?.id &&
    post.author.userId === currentUser.id
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "Không xác định";
    }
  };

  const pinMutation = useMutation({
    mutationFn: (shouldPin: boolean) => pinPost(post.postId, shouldPin),
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success(post.isPinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết");
    },
    onError: (error) => {
      console.error("Failed to toggle pin status:", error);
      toast.error("Không thể thực hiện thao tác ghim bài viết");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.postId),
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success("Đã xóa bài viết");
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
      toast.error("Không thể xóa bài viết");
    },
  });

  const handleEditPost = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Default behavior if no handler provided
      console.log("Edit post:", post.postId);
    }
    setIsMenuOpen(false);
  };

  const handleDeletePost = () => {
    deleteMutation.mutate();
    setIsMenuOpen(false);
  };

  const handleTogglePin = () => {
    pinMutation.mutate(!post.isPinned);
    setIsMenuOpen(false);
  };

  const handleCommentPost = () => {
    if (onComment) {
      onComment();
    } else {
      // Default behavior if no handler provided
      console.log("Comment on post:", post.postId);
    }
    setIsMenuOpen(false);
  };

  const handleReportPost = () => {
    setIsReportModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={post.author.avatarUrl || undefined}
              alt={post.author.fullName}
            />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
              {getInitials(post.author.fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`font-semibold ${
                  isAuthorCurrentUser
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {post.author.fullName}
              </h4>
              {post.isPinned && (
                <Pin className="h-4 w-4 text-indigo-500" fill="currentColor" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Context Menu */}
        {(post.canEdit ||
          post.canDelete ||
          post.canPin ||
          !isAuthorCurrentUser) && (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* {post.canEdit && (
                <DropdownMenuItem onClick={handleEditPost}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa bài viết
                </DropdownMenuItem>
              )} */}

              <DropdownMenuItem onClick={handleCommentPost}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Bình luận
              </DropdownMenuItem>

              {post.canPin && (
                <DropdownMenuItem
                  onClick={handleTogglePin}
                  disabled={pinMutation.isPending}
                >
                  {post.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Bỏ ghim bài viết
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Ghim bài viết
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {(post.canEdit || post.canPin) && post.canDelete && (
                <DropdownMenuSeparator />
              )}

              {post.canDelete && (
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa bài viết
                </DropdownMenuItem>
              )}

              {!isAuthorCurrentUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReportPost}>
                    <Flag className="h-4 w-4 mr-2" />
                    Báo cáo bài viết
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Report Content Modal */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        contentId={post.postId}
        groupId={groupId}
        contentType={ReportedContentType.Post}
      />
    </div>
  );
}
