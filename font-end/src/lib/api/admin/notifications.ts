import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import { AdminNotificationDto } from "@/types/admin/notification.types";

// ===============================
// ADMIN NOTIFICATIONS API FUNCTIONS
// ===============================

// Get Recent Notifications
export const getRecentNotifications = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  typeFilter?: string,
  statusFilter?: "all" | "unread"
) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (typeFilter && typeFilter !== "all") {
    params.append("notificationType", typeFilter);
  }

  // Add the status filter to the params sent to the backend
  if (statusFilter === "unread") {
    params.append("isRead", "false");
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<AdminNotificationDto>>
  >(`/admin/notification?${params.toString()}`);
  return response.data;
};

// Mark a Notification as Read
export const markNotificationAsRead = async (notificationId: number) => {
  const response = await apiClient.post<ApiResponse<object>>(
    `/admin/notification/${notificationId}/mark-as-read`
  );
  return response.data;
};

// Mark All Notifications as Read
export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/notification/mark-all-as-read"
  );
  return response.data;
};
