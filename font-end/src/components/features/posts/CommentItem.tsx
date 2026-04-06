"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Reply,
  Flag,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { updateComment, deleteComment } from "@/lib/api/customer/post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ReportContentModal } from "@/components/features/reports/ReportContentModal";
import { ReportedContentType } from "@/types/customer/moderation";
import { useAuthStore } from "@/store/authStore";

export interface CommentItemData {
  commentId: number;
  content: string;
  author: { userId: string; fullName: string; avatarUrl?: string | null };
  createdAt: string;
  replyCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

interface CommentItemProps {
  comment: CommentItemData;
  groupId: string;
  onReply?: (commentId: number) => void;
  showReplies?: boolean;
  onToggleReplies?: () => void;
}

export function CommentItem({
  comment,
  groupId,
  onReply,
  showReplies,
  onToggleReplies,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Check if the current user is the author of the comment
  const isAuthorCurrentUser = !!(
    comment.author?.userId &&
    currentUser?.id &&
    comment.author.userId === currentUser.id
  );

  const canSave = editContent.trim().length > 0 && editContent.length <= 200;

  const handleEditContentChange = (value: string) => {
    if (value.length > 200) {
      toast.error("Bình luận không được quá 200 ký tự");
      return;
    }
    setEditContent(value);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      editContent.length >= 200 &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      e.preventDefault();
      toast.error("Bình luận không được quá 200 ký tự");
    }
  };

  const updateMutation = useMutation({
    mutationFn: () => updateComment(comment.commentId, editContent),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comment-replies"] });
      toast.success("Đã cập nhật bình luận");
    },
    onError: () => {
      toast.error("Không thể cập nhật bình luận");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comment-replies"] });
      toast.success("Đã xóa bình luận");
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Không thể xóa bình luận");
    },
  });

  const handleSave = () => {
    if (!editContent.trim()) return;
    updateMutation.mutate();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleReportComment = () => {
    setIsReportModalOpen(true);
  };

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatarUrl || undefined} />
        <AvatarFallback>
          {comment.author.fullName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 max-w-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.author.fullName}</span>
          <span className="text-muted-foreground">
            · {formatRelativeTime(comment.createdAt)}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReply?.(comment.commentId)}>
                <Reply className="h-3 w-3 mr-2" /> Trả lời
              </DropdownMenuItem>

              {comment.canEdit && (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-3 w-3 mr-2" /> Chỉnh sửa
                </DropdownMenuItem>
              )}

              {comment.canDelete && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3 mr-2" /> Xóa
                </DropdownMenuItem>
              )}

              {/* Report option - show for all users except the author */}
              {!isAuthorCurrentUser && (
                <DropdownMenuItem onClick={handleReportComment}>
                  <Flag className="h-3 w-3 mr-2" /> Báo cáo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => handleEditContentChange(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="min-h-[60px] resize-none"
            />
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              {editContent.length}/200 ký tự
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!canSave || updateMutation.isPending}
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-1 text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <button
                className="hover:underline"
                onClick={() => onReply?.(comment.commentId)}
              >
                Thích
              </button>
              <button
                className="hover:underline"
                onClick={() => onReply?.(comment.commentId)}
              >
                <Reply className="h-3 w-3 inline mr-1" />
                Trả lời
              </button>
              {comment.replyCount > 0 && (
                <button className="hover:underline" onClick={onToggleReplies}>
                  {showReplies ? "Ẩn" : "Xem"} {comment.replyCount} trả lời
                </button>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Xác nhận xóa bình luận
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Bạn có chắc chắn muốn xóa bình luận này không? Hành động này
                không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteMutation.isPending}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa bình luận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Content Modal */}
        <ReportContentModal
          isOpen={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          contentId={comment.commentId}
          groupId={groupId}
          contentType={ReportedContentType.Comment}
        />
      </div>
    </div>
  );
}
