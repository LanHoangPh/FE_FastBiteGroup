"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FileUploadPreview } from "@/components/features/fileupload/FileUploadPreview";
import { FileUploadResponseDto } from "@/types/customer/file";
import { Paperclip, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadMultipleFiles } from "@/lib/api/customer/files";

interface CommunityComposerProps {
  onSubmit: (data: {
    title?: string | null;
    contentJson: string;
    attachmentFileIds?: number[];
  }) => Promise<void> | void;
  isSubmitting?: boolean;
  draftKey?: string; // for autosave/restore
}

export function CommunityComposer({
  onSubmit,
  isSubmitting,
  draftKey,
}: CommunityComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [editorKey, setEditorKey] = useState(0);
  const [contentLen, setContentLen] = useState(0);

  const canPost =
    content.trim().length > 0 &&
    !isSubmitting &&
    title.length <= 200 &&
    contentLen <= 2000;

  const handleContentChange = (json: string) => {
    // Check character count before updating
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

      // Prevent writing if over 2000 characters
      if (textContent.length > 2000) {
        toast.error("Nội dung không được quá 2000 ký tự");
        return;
      }
    } catch {
      setContentLen(json.length);
      if (json.length > 2000) {
        toast.error("Nội dung không được quá 2000 ký tự");
        return;
      }
    }

    setContent(json);
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

  // Disable restoring old drafts so the form is fresh each open
  // If later you want drafts, we can add a setting to enable/disable

  const handleSubmit = async () => {
    if (!canPost) return;

    try {
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

      await onSubmit({
        title: title || undefined,
        contentJson: content,
        attachmentFileIds: allFileIds,
      });

      // Clear all form data after successful submission
      setTitle("");
      setContent("");
      setPendingFiles([]);
      setEditorKey((prev) => prev + 1); // Force re-render editor
      setContentLen(0);

      // Clear draft
      if (draftKey) {
        try {
          localStorage.removeItem(`draft:${draftKey}`);
        } catch {}
      }

      // Show success message
      toast.success("Đăng bài thành công!");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Không thể đăng bài");
    }
  };

  return (
    <div className="space-y-4">
      {/* Subject/Title Field */}
      <div className="space-y-2">
        <Input
          id="post-title"
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
      <div className="space-y-2">
        <RichTextEditor
          key={editorKey}
          placeholder="Nhập nội dung..."
          value={content}
          onChange={handleContentChange}
          onCharacterLimitExceeded={handleCharacterLimitExceeded}
          maxLength={2000}
        />
      </div>

      {/* File Upload Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Tệp đính kèm
        </h4>
        <FileUploadPreview
          onFilesChange={setPendingFiles}
          maxFiles={8}
          maxSize={10}
          resetKey={editorKey}
        />
      </div>

      {/* Submit Section */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium ${
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

        <Button
          aria-label="Đăng bài viết"
          title="Đăng bài viết"
          onClick={handleSubmit}
          disabled={!canPost}
          className={cn(
            "gap-2 h-10 px-6 text-sm font-medium transition-all duration-200",
            canPost
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          )}
        >
          <SendHorizontal className="h-4 w-4" />
          {isSubmitting ? "Đang đăng..." : "Đăng bài"}
        </Button>
      </div>
    </div>
  );
}
