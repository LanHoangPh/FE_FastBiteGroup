import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  NotificationDto,
  GetNotificationsParams,
  MarkNotificationAsReadParams,
} from "@/types/customer/notification";

// ===============================
// CUSTOMER NOTIFICATIONS API FUNCTIONS
// ===============================

/**
 * Get paginated notifications for the current user
 * @param params - Request parameters including pagination
 * @returns Promise<PagedResult<NotificationDto>> - Paginated notifications
 */
export const getMyNotifications = async (
  params: GetNotificationsParams
): Promise<PagedResult<NotificationDto>> => {
  const { pageParam = 1, pageSize = 10 } = params;

  try {
    console.log("[API] Fetching notifications:", { pageParam, pageSize });

    const response = await apiClient.get<
      ApiResponse<PagedResult<NotificationDto>>
    >(`/notifications/me?pageNumber=${pageParam}&pageSize=${pageSize}`);

    console.log(
      "[API] Notifications fetched successfully:",
      response.data.data
    );
    return response.data.data;
  } catch (error) {
    console.error("[API] Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a specific notification as read
 * @param notificationId - The ID of the notification to mark as read
 * @returns Promise<void> - 204 NoContent response
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    console.log("[API] Marking notification as read:", notificationId);

    await apiClient.post(`/notifications/${notificationId}/mark-as-read`);

    console.log("[API] Notification marked as read successfully");
  } catch (error) {
    console.error("[API] Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for the current user
 * @returns Promise<void> - 204 NoContent response
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    console.log("[API] Marking all notifications as read");

    await apiClient.post(`/notifications/me/mark-all-as-read`);

    console.log("[API] All notifications marked as read successfully");
  } catch (error) {
    console.error("[API] Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Subscribes the current user to push notifications by sending their PlayerId.
 * @param playerId The unique ID provided by the OneSignal SDK.
 */
export const subscribeToPushNotifications = async (playerId: string) => {
  const response = await apiClient.post("/me/notifications/subscribe", {
    playerId,
  });
  return response;
};
