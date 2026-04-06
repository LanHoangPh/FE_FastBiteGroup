"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Trash2,
  ThumbsUp,
  MessageCircle,
  Pin,
  FileText,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getAdminGroupPosts,
  deleteAdminGroupPost,
  restorePost,
} from "@/lib/api/admin/groups";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { handleApiError } from "@/lib/utils/errorUtils";
import { GetGroupPostsParams, PostForListDTO } from "@/types/admin/group.types";

interface GroupPostsTabProps {
  groupId: string;
  isReadOnly?: boolean;
}

export function GroupPostsTab({
  groupId,
  isReadOnly = false,
}: GroupPostsTabProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GetGroupPostsParams>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
  });

  // State to track which post is being deleted or restored (for inline confirmation)
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [postToRestore, setPostToRestore] = useState<number | null>(null);

  // Fetch posts data
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group-posts", groupId, filters],
    queryFn: () => getAdminGroupPosts(groupId, filters),
    enabled: !!groupId,
  });

  const posts = response?.data?.items || [];
  const totalRecords = response?.data?.totalRecords || 0;
  const totalPages = response?.data?.totalPages || 0;
  const currentPage = response?.data?.pageNumber || 1;

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => deleteAdminGroupPost(groupId, postId),
    onSuccess: () => {
      // Invalidate all queries related to this group's posts
      queryClient.invalidateQueries({
        queryKey: ["group-posts", groupId],
        exact: false,
      });

      // Reset post to delete
      setPostToDelete(null);

      // Show success message
      toast.success("Đã xóa bài viết");

      // Check if we need to adjust pagination after deletion
      if (posts.length === 1 && currentPage > 1) {
        // If we deleted the last post on the current page, go to previous page
        setFilters((prev) => ({
          ...prev,
          pageNumber: Math.max(1, currentPage - 1),
        }));
      }
    },
    onError: (error) => {
      // Reset post to delete
      setPostToDelete(null);
      handleApiError(error, "Lỗi khi xóa bài viết");
    },
  });

  // Restore post mutation
  const restorePostMutation = useMutation({
    mutationFn: (postId: number) => restorePost(groupId, postId),
    onSuccess: () => {
      // Invalidate all queries related to this group's posts
      queryClient.invalidateQueries({
        queryKey: ["group-posts", groupId],
        exact: false,
      });

      // Reset post to restore
      setPostToRestore(null);

      // Show success message
      toast.success("Đã khôi phục bài viết thành công");
    },
    onError: (error) => {
      // Reset post to restore
      setPostToRestore(null);
      handleApiError(error, "Lỗi khi khôi phục bài viết");
    },
  });

  // Handler functions
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, pageNumber: 1 }));
  };

  const handlePageSizeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: parseInt(value),
      pageNumber: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const confirmDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  const confirmRestorePost = (postId: number) => {
    restorePostMutation.mutate(postId);
  };

  // Calculate display range
  const startRecord = (currentPage - 1) * (filters.pageSize ?? 10) + 1;
  const endRecord = Math.min(
    currentPage * (filters.pageSize ?? 10),
    totalRecords
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            maxLength={50} // Limit search input length
          />
        </div>
      </div>

      {isReadOnly && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Chế độ chỉ xem</p>
              <p className="text-sm text-amber-700">
                Nhóm này đã bị xóa nên bạn không thể xóa hoặc khôi phục bài
                viết. Hãy khôi phục nhóm để tiếp tục quản lý.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Posts Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">
            Đang tải danh sách bài viết...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            Có lỗi xảy ra khi tải danh sách bài viết
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Tác giả</th>
                <th className="text-left p-2 font-medium">Nội dung</th>
                <th className="text-left p-2 font-medium">Trạng thái</th>
                <th className="text-left p-2 font-medium">Tương tác</th>
                <th className="text-left p-2 font-medium">Ngày tạo</th>
                <th className="text-left p-2 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.postId}
                  className={`border-b hover:bg-muted/50 ${
                    post.isDeleted ? "opacity-60" : ""
                  }`}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={post.authorAvatarUrl}
                          alt={post.authorName}
                        />
                        <AvatarFallback>
                          {post.authorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/admin/user/${post.authorId}`}
                        className="font-medium hover:underline"
                      >
                        {post.authorName}
                      </Link>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="max-w-md">
                      <p
                        className={`text-sm line-clamp-2 ${
                          post.isDeleted ? "line-through" : ""
                        }`}
                      >
                        {post.title || "(Không có tiêu đề)"}
                      </p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {post.isPinned ? (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Pin className="h-3 w-3" />
                          <span>Ghim</span>
                        </Badge>
                      ) : post.isDeleted ? (
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <span>Đã xóa</span>
                        </Badge>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likeCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {formatRelativeTime(post.createdAt)}
                  </td>
                  <td className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>

                        {/* Show delete option for non-deleted posts */}
                        {!isReadOnly &&
                          !post.isDeleted &&
                          (postToDelete === post.postId ? (
                            // Inline confirmation for delete
                            <div className="p-2 space-y-2">
                              <p className="text-sm">Xóa bài viết này?</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => confirmDeletePost(post.postId)}
                                  disabled={deletePostMutation.isPending}
                                >
                                  {deletePostMutation.isPending
                                    ? "Đang xóa..."
                                    : "Xóa"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPostToDelete(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setPostToDelete(post.postId);
                              }}
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa bài viết
                            </DropdownMenuItem>
                          ))}

                        {/* Show restore option for deleted posts */}
                        {!isReadOnly &&
                          post.isDeleted &&
                          (postToRestore === post.postId ? (
                            // Inline confirmation for restore
                            <div className="p-2 space-y-2">
                              <p className="text-sm">Khôi phục bài viết này?</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    confirmRestorePost(post.postId)
                                  }
                                  disabled={restorePostMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {restorePostMutation.isPending
                                    ? "Đang khôi phục..."
                                    : "Khôi phục"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPostToRestore(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setPostToRestore(post.postId);
                              }}
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="text-emerald-600"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Khôi phục bài viết
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy bài viết nào
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startRecord}-{endRecord} trên tổng số{" "}
            {totalRecords.toLocaleString()} bài viết
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={filters.pageSize?.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
