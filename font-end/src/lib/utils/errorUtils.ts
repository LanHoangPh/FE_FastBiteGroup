import { toast } from "sonner";
import { type ApiResponse } from "@/types/api.types";

/**
 * Utility function to standardize error display for API errors
 */
export function handleApiError(error: any, title: string = "Có lỗi xảy ra") {
  // Check for concurrency error (HTTP 409 Conflict)
  if (error?.response?.status === 409) {
    toast.error("Xung đột dữ liệu", {
      description:
        "Dữ liệu của một hoặc nhiều người dùng đã được thay đổi bởi người khác. Vui lòng làm mới trang và thử lại.",
    });
    return;
  }

  // Check for concurrency error by error code (fallback)
  if (error?.response?.data?.errorCode === "CONCURRENCY_ERROR") {
    toast.error("Xung đột dữ liệu", {
      description:
        "Dữ liệu đã được thay đổi bởi người khác. Vui lòng làm mới trang và thử lại.",
    });
    return;
  }

  if (error?.response?.data) {
    const errorData: ApiResponse<null> = error.response.data;
    // Prefer the message from the errors array, otherwise use the main message
    const errorMessage =
      errorData.errors?.[0]?.message ||
      errorData.message ||
      "Có lỗi xảy ra từ máy chủ.";
    toast.error(title, { description: errorMessage });
  } else {
    toast.error(title, {
      description: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
    });
  }
}
