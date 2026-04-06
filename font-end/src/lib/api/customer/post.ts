import apiClient from "@/lib/api/apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  PostDetailDto,
  CommentDto,
  PostSummaryDto,
  PostAuthorDto,
  PostAttachmentDto,
  // Other types
} from "@/types/customer/post";

export async function getPostDetail(postId: number): Promise<PostDetailDto> {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    const apiResponse = response.data as ApiResponse<PostDetailDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching post detail:", error);
    throw error;
  }
}

export async function addComment(
  postId: number,
  data: { content: string; parentCommentId?: number }
): Promise<CommentDto> {
  try {
    const response = await apiClient.post(`/comments/${postId}/comments`, data);
    const apiResponse = response.data as ApiResponse<CommentDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

export async function toggleLike(
  postId: number
): Promise<{ newLikeCount: number; isLikedByCurrentUser: boolean }> {
  try {
    const response = await apiClient.post(`/posts/${postId}/toggle-like`);
    const apiResponse = response.data as ApiResponse<{
      newLikeCount: number;
      isLikedByCurrentUser: boolean;
    }>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

export async function getPostComments(
  postId: number,
  pageParam: number = 1,
  pageSize: number = 20
): Promise<PagedResult<CommentDto>> {
  try {
    const response = await apiClient.get(
      `/comments/${postId}/comments?pageNumber=${pageParam}&pageSize=${pageSize}`
    );
    const apiResponse = response.data as ApiResponse<PagedResult<CommentDto>>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }
}
export async function getCommentReplies(
  commentId: number,
  pageParam: number = 1,
  pageSize: number = 20
): Promise<PagedResult<CommentDto>> {
  try {
    const response = await apiClient.get(
      `/comments/${commentId}/replies?pageNumber=${pageParam}&pageSize=${pageSize}`
    );
    const apiResponse = response.data as ApiResponse<PagedResult<CommentDto>>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching comment replies:", error);
    throw error;
  }
}

export async function updateComment(
  commentId: number,
  content: string
): Promise<CommentDto> {
  try {
    const response = await apiClient.put(`/comments/${commentId}`, { content });
    const apiResponse = response.data as ApiResponse<CommentDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await apiClient.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
export async function createGroupPost(
  groupId: string,
  data: {
    title?: string | null;
    contentJson: string;
    attachmentFileIds?: number[];
  }
): Promise<PostSummaryDto> {
  try {
    const response = await apiClient.post(`/groups/${groupId}/posts`, data);
    const apiResponse = response.data as ApiResponse<PostSummaryDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error creating group post:", error);
    throw error;
  }
}

export async function pinPost(
  postId: number,
  shouldPin: boolean = true
): Promise<void> {
  try {
    await apiClient.put(`/posts/${postId}/pin`, { isPinned: shouldPin });
  } catch (error) {
    console.error("Error changing pin status:", error);
    throw error;
  }
}

export async function updatePost(
  postId: number,
  data: {
    title?: string | null;
    contentJson?: string;
    attachmentFileIds?: number[];
  }
): Promise<PostSummaryDto> {
  try {
    const response = await apiClient.put(`/posts/${postId}`, data);
    const apiResponse = response.data as ApiResponse<PostSummaryDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deletePost(postId: number): Promise<void> {
  try {
    await apiClient.delete(`/posts/${postId}`);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
