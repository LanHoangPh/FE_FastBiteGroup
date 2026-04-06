"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FileUploadPreview } from "@/components/features/fileupload/FileUploadPreview";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createGroupPost } from "@/lib/api/customer/post";
import { PostSummaryDto } from "@/types/customer/post";
import { uploadMultipleFiles } from "@/lib/api/customer/files";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

interface CreatePostDialogProps {
  open: boolean;
  groupId: string;
  onClose: () => void;
  onPostCreated: (post: PostSummaryDto) => void;
}

export function CreatePostDialog({
  open,
  groupId,
  onClose,
  onPostCreated,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [contentLen, setContentLen] = useState(0);
  const queryClient = useQueryClient();

  const canPost =
    title.trim().length > 0 && // Title is now required
    (content.trim().length > 0 || pendingFiles.length > 0) && // Either content or files must exist
    !isCreating &&
    title.length <= 200 &&
    contentLen <= 2000;

  const handleTitleChange = (value: string) => {
    if (value.length > 200) {
      toast.error("Tiêu đề không được quá 200 ký tự");
      return;
    }
    setTitle(value);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      title.length >= 200 &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      e.preventDefault();
      toast.error("Tiêu đề không được quá 200 ký tự");
    }
  };

  const handleContentChange = (json: string) => {
    setContent(json);
    // Update content length when content changes
    try {
      const editor = JSON.parse(json);
      // Get text content from editor JSON
      const getTextContent = (node: any): string => {
        if (typeof node === "string") return node;
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(getTextContent).join("");
        }
        return "";
      };
      const textContent = getTextContent(editor);
      setContentLen(textContent.length);
    } catch {
      setContentLen(json.length);
    }
  };

  const handleCharacterLimitExceeded = (
    currentLength: number,
    maxLength: number
  ) => {
    // Only show toast once when limit is exceeded
    if (currentLength === maxLength + 1) {
      toast.error(`Nội dung không được quá ${maxLength} ký tự`);
    }
  };

  const handleCreatePost = async () => {
    // Check if title is provided
    if (!title.trim()) {
      toast.error("Tiêu đề là bắt buộc");
      return;
    }

    // Check if either content or files are provided
    if (content.trim().length === 0 && pendingFiles.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc đính kèm tệp");
      return;
    }

    if (!canPost) return;

    try {
      setIsCreating(true);

      // Upload any pending files first
      let allFileIds: number[] = [];

      if (pendingFiles.length > 0) {
        toast.info("Đang tải lên files...");
        try {
          const uploaded = await uploadMultipleFiles({
            files: pendingFiles,
            context: "PostAttachment",
          });
          allFileIds.push(...uploaded.map((f) => f.fileId));
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Không thể tải lên một số tệp");
        }
      }

      // Create the post
      const newPost = await createGroupPost(groupId, {
        title: title || undefined,
        contentJson: content,
        attachmentFileIds: allFileIds,
      });

      // Notify parent component
      onPostCreated(newPost);

      // Reset form
      setTitle("");
      setContent("");
      setPendingFiles([]);
      setEditorKey((prev) => prev + 1);
      setContentLen(0);

      // Close dialog
      onClose();
      // Invalidate all queries that start with ["group-posts", groupId] to ensure
      // the post list refreshes regardless of the sortBy parameter
      queryClient.invalidateQueries({
        queryKey: ["group-posts", groupId],
        exact: false,
      });

      toast.success("Đăng bài thành công!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 shadow-2xl flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-0 border-b border-purple-200 dark:border-purple-800 flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50">
          <DialogTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200 text-center">
            Tạo bài viết mới
          </DialogTitle>
          <p className="text-sm text-purple-600 dark:text-purple-400 text-center mt-1">
            Chia sẻ suy nghĩ của bạn với cộng đồng
          </p>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800 absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-0">
          {/* Subject/Title Field */}
          <div className="space-y-2">
            <Input
              id="create-post-title"
              placeholder="Thêm tiêu đề (bắt buộc)"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 h-10"
            />
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              {title.length}/200 ký tự
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2 min-w-0 overflow-hidden">
            <div className="w-full overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
              <RichTextEditor
                key={editorKey}
                value={content}
                onChange={handleContentChange}
                onCharacterLimitExceeded={handleCharacterLimitExceeded}
                maxLength={2000}
                placeholder="Nhập nội dung..."
              />
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              {contentLen}/2000 ký tự
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Tệp đính kèm
              </h4>
            </div>
            <FileUploadPreview
              onFilesChange={setPendingFiles}
              maxFiles={8}
              maxSize={10}
              resetKey={editorKey}
            />
          </div>
        </div>

        {/* Footer with Actions - Sticky Bottom */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${
                  contentLen > 2000
                    ? "text-red-500"
                    : contentLen > 1600
                    ? "text-amber-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                aria-live="polite"
              >
                {contentLen}/2000 ký tự
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!canPost}
                className={cn(
                  "gap-2 h-9 px-6 text-sm font-medium",
                  canPost
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                    : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                )}
              >
                <SendHorizontal className="h-4 w-4" />
                {isCreating ? "Đang đăng..." : "Đăng bài"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
