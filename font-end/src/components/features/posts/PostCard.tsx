"use client";

import { Card } from "@/components/ui/card";
import { PostSummaryDto } from "@/types/customer/post";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostAttachments } from "./PostAttachments";
import { PostFooter } from "./PostFooter";
import { useState } from "react";
import { PostDetailModal } from "./PostDetailModal";
import { EditPostDialog } from "./EditPostDialog";
import { updatePost } from "@/lib/api/customer/post";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";

interface PostCardProps {
  post: PostSummaryDto;
  groupId: string;
}

export function PostCard({ post, groupId }: PostCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Check if a comment belongs to the current user
  const isCommentByCurrentUser = (commentAuthorId: string) => {
    return !!(
      commentAuthorId &&
      currentUser?.id &&
      commentAuthorId === currentUser.id
    );
  };

  const handleCommentClick = () => {
    setIsDetailModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleViewAllAttachments = () => {
    setIsDetailModalOpen(true);
  };

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
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <PostHeader
          post={post}
          groupId={groupId}
          onEdit={handleEditClick}
          onComment={handleCommentClick}
        />
        <PostContent post={post} />
        <PostAttachments
          attachments={post.attachments}
          onViewAll={handleViewAllAttachments}
        />
        <PostFooter post={post} groupId={groupId} onComment={handleCommentClick} />
      </Card>

      <PostDetailModal
        postId={post.postId}
        groupId={groupId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isCommentByCurrentUser={isCommentByCurrentUser}
      />

      <EditPostDialog
        open={isEditDialogOpen}
        initialTitle={post.title}
        initialContent={post.content}
        initialContentJson={post.content}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEditPost}
      />
    </>
  );
}
