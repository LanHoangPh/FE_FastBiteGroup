"use client";

import { useState, useEffect } from "react";
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

import { Paperclip, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditPostDialogProps {
  open: boolean;
  initialTitle?: string | null;
  initialContent?: string | null;
  initialContentJson?: string | null;
  initialContentHtml?: string | null;
  onClose: () => void;
  onSave: (data: {
    title?: string | null;
    contentJson: string;
    attachmentFileIds?: number[];
  }) => Promise<void> | void;
}

export function EditPostDialog({
  open,
  initialTitle,
  initialContent,
  initialContentJson,
  initialContentHtml,
  onClose,
  onSave,
}: EditPostDialogProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(""); // Add this missing state
  const [isSaving, setIsSaving] = useState(false); // Add this missing state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // Add this missing state
  const [editorKey, setEditorKey] = useState(0); // Add this missing state

  // Convert any content format to proper JSON format for the RichTextEditor
  const getJsonContent = (
    contentJson: string | undefined | null,
    contentHtml: string | undefined | null,
    plainContent: string | undefined | null
  ): string => {
    // Prefer contentJson if available as it's already in Tiptap format
    if (contentJson) {
      try {
        const parsed = JSON.parse(contentJson);
        // Check if it's a valid Tiptap JSON structure
        if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
          return contentJson;
        }
      } catch (e) {
        // Not valid JSON, fall through to handle as plain text
      }
    }

    // If we have HTML content, we should convert it to JSON format
    // For now, we'll treat it as plain text if it's not valid JSON
    const contentText = contentJson || contentHtml || plainContent || "";

    // If content is already JSON, return as is
    try {
      const parsed = JSON.parse(contentText);
      // Check if it's a valid Tiptap JSON structure
      if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
        return contentText;
      }
    } catch (e) {
      // Not JSON, convert to JSON format
    }

    // Convert plain text or HTML to Tiptap JSON format
    return JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: contentText ? [{ type: "text", text: contentText }] : [],
        },
      ],
    });
  };

  const getContentLength = (contentJson: string): number => {
    try {
      const json = JSON.parse(contentJson);
      // Handle case where json might be null or undefined
      if (!json) return 0;

      // For Tiptap JSON structure, we need to extract actual text content
      const getTextContent = (node: any): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(getTextContent).join("");
        }
        return "";
      };

      const textContent = getTextContent(json);
      return textContent.length;
    } catch {
      return contentJson.length || 0;
    }
  };

  const contentLen = getContentLength(content);

  const canSave =
    content.trim().length > 0 &&
    !isSaving &&
    (title?.length || 0) <= 200 &&
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

  useEffect(() => {
    if (open) {
      setTitle(initialTitle || "");
      // Convert to proper JSON format for the editor
      setContent(
        getJsonContent(initialContentJson, initialContentHtml, initialContent)
      );
      setPendingFiles([]);
      setEditorKey((prev: number) => prev + 1);
    }
  }, [
    open,
    initialTitle,
    initialContentJson,
    initialContentHtml,
    initialContent,
  ]);

  const handleContentChange = (json: string) => {
    // Check character count before updating
    const newContentLen = getContentLength(json);

    if (newContentLen > 2000) {
      toast.error("Đã quá giới hạn 2000 ký tự");
      return; // Don't update content if over limit
    }

    setContent(json);
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setIsSaving(true);

      // For now, we'll handle file uploads similar to create post
      // In the future, this could be enhanced to handle existing attachments
      let attachmentFileIds: number[] = [];
      // Note: File upload logic would go here if needed

      await onSave({
        title: title || undefined,
        contentJson: content,
        attachmentFileIds,
      });

      // Close the dialog after successful save
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Không thể lưu bài viết. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
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
            Chỉnh sửa bài viết
          </DialogTitle>
          <p className="text-sm text-purple-600 dark:text-purple-400 text-center mt-1">
            Thực hiện các thay đổi cho bài viết của bạn
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
              id="edit-post-title"
              placeholder="Thêm tiêu đề (tùy chọn)"
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
                placeholder="Nhập nội dung..."
                maxLength={2000}
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
                disabled={isSaving}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className={cn(
                  "gap-2 h-9 px-6 text-sm font-medium",
                  canSave
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                    : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                )}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
