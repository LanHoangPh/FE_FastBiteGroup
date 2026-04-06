"use client";

// Import các thư viện cần thiết
import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Loader2, AlertCircle, FileText, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGroupPosts } from "@/lib/api/customer/groups";
import { PostSummaryDto, PostSortBy } from "@/types/customer/post";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { useAuthStore } from "@/store/authStore";

// Interface định nghĩa props cho component PostList
interface PostListProps {
  groupId: string; // ID của nhóm để lấy danh sách bài viết
}

export function PostList({ groupId }: PostListProps) {
  // State quản lý sắp xếp bài viết (mới nhất, cũ nhất, nhiều like, nhiều comment)
  const [sortBy, setSortBy] = useState<PostSortBy>(PostSortBy.Latest);

  // State quản lý việc mở/đóng dialog tạo bài viết mới
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query client để quản lý cache và refetch data
  const queryClient = useQueryClient();

  // Lấy thông tin user hiện tại từ store
  const currentUser = useAuthStore((s) => s.user);

  // Hàm kiểm tra xem comment có thuộc về user hiện tại không
  const isCommentByCurrentUser = (commentAuthorId: string) => {
    return !!(
      commentAuthorId &&
      currentUser?.id &&
      commentAuthorId === currentUser.id
    );
  };

  // Query key động bao gồm sortBy để cache invalidation đúng cách
  const queryKey = ["group-posts", groupId, { sortBy }];

  // Sử dụng useInfiniteQuery để tải danh sách bài viết với phân trang vô hạn
  const {
    data, // Dữ liệu từ tất cả các trang đã tải
    fetchNextPage, // Hàm tải trang tiếp theo
    hasNextPage, // Có trang tiếp theo không
    isFetchingNextPage, // Đang tải trang tiếp theo
    isLoading, // Đang tải lần đầu
    isError, // Có lỗi không
    error, // Thông tin lỗi
    refetch, // Hàm tải lại dữ liệu
  } = useInfiniteQuery({
    queryKey, // Key để cache dữ liệu
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Gọi API lấy danh sách bài viết của nhóm
        const result = await getGroupPosts(groupId, {
          pageParam, // Số trang hiện tại
          pageSize: 10, // Số bài viết mỗi trang
          sortBy, // Cách sắp xếp
        });

        // Kiểm tra cấu trúc response có hợp lệ không
        if (!result || typeof result !== "object") {
          throw new Error("Invalid response format");
        }

        return result;
      } catch (error) {
        console.error("[PostList] API Error:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      // Xử lý trường hợp lastPage có thể null hoặc undefined
      if (
        !lastPage ||
        typeof lastPage.pageNumber !== "number" ||
        typeof lastPage.totalPages !== "number"
      ) {
        return undefined;
      }

      // Nếu còn trang tiếp theo thì trả về số trang tiếp theo
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1, // Trang bắt đầu
    enabled: !!groupId, // Chỉ chạy khi có groupId
    retry: (failureCount, error) => {
      // Không retry với lỗi 404 hoặc 403
      const axiosError = error as any;
      if (
        axiosError?.response?.status === 404 ||
        axiosError?.response?.status === 403
      ) {
        return false;
      }
      return failureCount < 2; // Retry tối đa 2 lần
    },
  });

  // Xử lý dữ liệu từ các trang để tạo danh sách bài viết phẳng
  const posts =
    data?.pages
      ?.filter((page) => page && Array.isArray(page.items)) // Lọc các trang hợp lệ
      ?.flatMap((page) => page.items) // Gộp tất cả items từ các trang
      ?.filter(Boolean) ?? []; // Lọc bỏ các item null/undefined

  // Thiết lập infinite scroll - theo dõi khi element vào viewport
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0, // Trigger ngay khi element vào viewport
  });

  // Effect tự động tải trang tiếp theo khi scroll đến cuối
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Hiển thị skeleton loading khi đang tải lần đầu
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Hiển thị trạng thái lỗi khi có lỗi xảy ra
  if (isError) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      {/* Phần điều khiển sắp xếp và tạo bài viết */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bài viết
        </h2>
        <div className="flex items-center gap-2">
          {/* Nút tạo bài viết mới */}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-9 px-3 text-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tạo bài viết</span>
          </Button>
          {/* Dropdown chọn cách sắp xếp bài viết */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as PostSortBy)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PostSortBy.Latest}>Mới nhất</SelectItem>
              <SelectItem value={PostSortBy.Oldest}>Cũ nhất</SelectItem>
              <SelectItem value={PostSortBy.MostLiked}>
                Nhiều lượt thích
              </SelectItem>
              <SelectItem value={PostSortBy.MostCommented}>
                Nhiều bình luận
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Danh sách bài viết */}
      {posts.length === 0 ? (
        <EmptyState /> // Hiển thị trạng thái trống khi chưa có bài viết
      ) : (
        <div className="space-y-4">
          {/* Render từng bài viết */}
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} groupId={groupId} />
          ))}

          {/* Trigger cho infinite scroll - element ẩn để theo dõi */}
          <div ref={loadMoreRef} className="h-4">
            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="relative">
                  {/* Animation loading khi tải trang tiếp theo */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 animate-ping" />
                  <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog tạo bài viết mới */}
      <CreatePostDialog
        open={isCreateDialogOpen}
        groupId={groupId}
        onClose={() => setIsCreateDialogOpen(false)}
        onPostCreated={(newPost) => {
          // Cập nhật cache ngay lập tức với bài viết mới
          queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData) {
              // Nếu chưa có data, tạo structure mới
              return {
                pages: [
                  {
                    items: [newPost],
                    pageNumber: 1,
                    pageSize: 10,
                    totalCount: 1,
                    totalPages: 1,
                  },
                ],
                pageParams: [1],
              };
            }

            // Thêm bài viết mới vào đầu trang đầu tiên
            const newPages = [...oldData.pages];
            if (newPages.length > 0 && newPages[0]) {
              newPages[0] = {
                ...newPages[0],
                items: [newPost, ...newPages[0].items],
                totalCount: (newPages[0].totalCount || 0) + 1,
              };
            } else {
              // Nếu chưa có trang nào, tạo trang đầu tiên
              newPages.unshift({
                items: [newPost],
                pageNumber: 1,
                pageSize: 10,
                totalCount: 1,
                totalPages: 1,
              });
            }

            return {
              ...oldData,
              pages: newPages,
            };
          });

          // Invalidate sau 1 giây để đồng bộ với server (không ảnh hưởng UI)
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey });
          }, 1000);
        }}
      />
    </div>
  );
}

// Component hiển thị skeleton loading khi đang tải dữ liệu
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tạo 3 skeleton cards giả lập bài viết */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
        >
          {/* Skeleton cho phần header (avatar + tên + thời gian) */}
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/4 animate-pulse" />
            </div>
          </div>
          {/* Skeleton cho phần nội dung bài viết */}
          <div className="space-y-3">
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-5/6 animate-pulse" />
            </div>
            {/* Skeleton cho các nút action */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component hiển thị trạng thái lỗi khi không thể tải dữ liệu
function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Icon lỗi với animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-200/30 dark:border-red-800/30">
          <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-60 animate-bounce" />
      </div>

      {/* Tiêu đề lỗi */}
      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-red-600 dark:from-gray-100 dark:to-red-400 bg-clip-text text-transparent mb-3">
        Không thể tải bài viết
      </h3>
      {/* Thông báo lỗi chi tiết */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed max-w-sm">
        Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.
      </p>
    </div>
  );
}

// Component hiển thị trạng thái trống khi chưa có bài viết nào
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Icon trống với các animation trang trí */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 shadow-2xl">
          <FileText className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        {/* Các icon trang trí với animation */}
        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-bounce delay-300" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse" />
      </div>

      {/* Tiêu đề trạng thái trống */}
      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-3">
        Chưa có bài viết nào
      </h3>
      {/* Thông báo khuyến khích tạo bài viết */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed max-w-sm">
        Hãy là người đầu tiên chia sẻ điều gì đó thú vị với cộng đồng này!
      </p>

      {/* Các chấm tròn trang trí với animation bounce */}
      <div className="flex gap-2 mt-6">
        <div
          className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
}
