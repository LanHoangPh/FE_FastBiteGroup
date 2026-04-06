"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Pencil,
  Trash2,
  Pin,
  Flag,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { RichTextViewer } from "@/components/ui/RichTextViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PostDetailModal } from "./PostDetailModal";
import { PostAttachments } from "./PostAttachments";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { PostSummaryDto } from "@/types/customer/post";
import { pinPost } from "@/lib/api/customer/post";
import { updatePost } from "@/lib/api/customer/post";
import { useQueryClient } from "@tanstack/react-query";
import { EditPostDialog } from "./EditPostDialog";

interface CommunityPostCardProps {
  post: PostSummaryDto;
  groupId: string;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onPin?: (postId: number, isPinned: boolean) => void;
  onLike?: (postId: number) => Promise<void>;
  onOpenDetail?: (postId: number) => void;
}

export function CommunityPostCard({
  post,
  groupId,
  onLike,
  onEdit,
  onDelete,
  onOpenDetail,
  onPin,
}: CommunityPostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // All data comes from props - no more data fetching
  const isAuthorCurrentUser = !!(
    post.author?.userId &&
    currentUser?.id &&
    post.author.userId === currentUser.id
  );

  // Convert plain text content to JSON format for the RichTextEditor
  const getJsonContent = (content: string | undefined | null): string => {
    if (!content) return "";

    // If content is already JSON, return as is
    try {
      const parsed = JSON.parse(content);
      // Check if it's a valid Tiptap JSON structure
      if (parsed.type === "doc" && Array.isArray(parsed.content)) {
        return content;
      }
    } catch (e) {
      // Not JSON, convert plain text to JSON format
    }

    // Convert plain text to Tiptap JSON format
    return JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: content ? [{ type: "text", text: content }] : [],
        },
      ],
    });
  };

  // Cleanup effect for when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any ongoing operations when component unmounts
      setIsModalOpen(false);
      setIsDeleting(false);
    };
  }, []);

  // Debug logging for permission issues
  if (process.env.NODE_ENV === "development") {
    console.log("Post permissions for post", post.postId, ":", {
      canEdit: post.canEdit,
      canDelete: post.canDelete,
      canPin: post.canPin,
      isAuthorCurrentUser,
      userId: currentUser?.id,
      authorId: post.author?.userId,
    });
  }

  // Handle deletion with proper state management
  const handleDelete = useCallback(async () => {
    if (isDeleting) return; // Prevent double deletion
    setIsDeleting(true);
    try {
      await onDelete?.(post.postId);

      // After successful deletion, reset all local states
      setIsModalOpen(false);

      // Force close any open dropdowns or overlays
      const activeDropdowns = document.querySelectorAll('[data-state="open"]');
      activeDropdowns.forEach((dropdown) => {
        dropdown.setAttribute("data-state", "closed");
      });

      // Ensure body scroll is restored
      document.body.style.overflow = "unset";

      // Refresh the post list
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    } catch (error) {
      console.error("Delete error in card:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, onDelete, post.postId, queryClient]);

  const handleEditPost = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEditPost = async (data: {
    title?: string | null;
    contentJson: string;
    attachmentFileIds?: number[];
  }) => {
    try {
      await updatePost(post.postId, data);
      toast.success("Đã cập nhật bài viết");
      setIsEditDialogOpen(false);
      // Refresh the post list
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("Không thể cập nhật bài viết");
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-600">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 ring-2 ring-slate-100 dark:ring-slate-700 flex-shrink-0">
            <AvatarImage src={post.author?.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
              {(post.author?.fullName || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm leading-none flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {post.author?.fullName || "Bạn"}
                </span>
                {post.isPinned && <Pin className="h-3 w-3 text-indigo-500" />}
                <span className="text-slate-500 dark:text-slate-400">
                  · {formatRelativeTime(post.createdAt)}
                </span>
              </div>
              {/* Only show dropdown menu if user has any permissions */}
              {(post.canEdit || post.canDelete || post.canPin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-50 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
                  >
                    {/* Only show pin option if user has permission */}
                    {post.canPin && (
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            const newPinnedState = !post.isPinned;
                            await pinPost(post.postId, newPinnedState);
                            onPin?.(post.postId, newPinnedState);
                            toast.success(
                              newPinnedState
                                ? "Đã ghim bài viết"
                                : "Đã bỏ ghim bài viết"
                            );
                            // Refresh the post list
                            queryClient.invalidateQueries({
                              queryKey: ["group-posts", groupId],
                            });
                          } catch (error) {
                            console.error("Pin error:", error);
                            toast.error("Không thể thay đổi trạng thái ghim");
                          }
                        }}
                        className="text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Pin className="h-4 w-4 mr-2" />{" "}
                        {post.isPinned ? "Bỏ ghim" : "Ghim bài viết"}
                      </DropdownMenuItem>
                    )}
                    {/* Only show edit option if user has permission */}
                    {post.canEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit?.(post.postId)}
                        className="text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa bài viết
                      </DropdownMenuItem>
                    )}
                    {/* Add separator if there are both edit/pin and delete options */}
                    {(post.canEdit || post.canPin) && post.canDelete && (
                      <DropdownMenuSeparator />
                    )}
                    {/* Only show delete option if user has permission */}
                    {post.canDelete && (
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                      </DropdownMenuItem>
                    )}
                    {/* Show a message if no actions are available */}
                    {!post.canEdit && !post.canDelete && !post.canPin && (
                      <div className="px-2 py-1.5 text-sm text-slate-500 dark:text-slate-400">
                        Không có hành động nào
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Title Section */}
            {post.title && (
              <div className="mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 break-words tracking-tight leading-snug">
                  {post.title}
                </h2>
              </div>
            )}

            {/* Media Attachments Section with proper spacing */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-4">
                <PostAttachments
                  attachments={post.attachments}
                  onViewAll={() => {
                    console.log(
                      "Opening post detail modal for post:",
                      post.postId
                    );
                    setIsModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 text-sm">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                    post.isLikedByCurrentUser
                      ? "text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  }`}
                  onClick={async () => {
                    try {
                      await onLike?.(post.postId);
                      // Refresh the post list
                      queryClient.invalidateQueries({
                        queryKey: ["group-posts", groupId],
                      });
                    } catch (error) {
                      console.error("Like error:", error);
                    }
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      post.isLikedByCurrentUser
                        ? "fill-red-600 text-red-600"
                        : ""
                    }`}
                  />
                  <span>Thích ({post.likeCount})</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-200 font-medium"
                  onClick={() => setIsModalOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Bình luận ({post.commentCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <PostDetailModal
        postId={post.postId}
        groupId={groupId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {post.canEdit && (
        <EditPostDialog
          open={isEditDialogOpen}
          initialTitle={post.title}
          initialContent={post.content}
          initialContentJson={post.content}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveEditPost}
        />
      )}
    </Card>
  );
}
