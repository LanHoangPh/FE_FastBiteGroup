"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useAuthStore } from "@/store/authStore";
import { subscribeToPushNotifications } from "@/lib/api/customer/notifications";
import { handleApiError } from "@/lib/utils/errorUtils";

const SUBSCRIPTION_STORAGE_KEY = "onesignal_user_subscribed";

export const useOneSignalSubscription = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Hàm để đồng bộ Player ID với backend
    const syncPlayerIdWithBackend = async () => {
      // Kiểm tra xem đã có Player ID chưa và đã được lưu local chưa
      const isSynced =
        localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) === "true";
      const playerId = OneSignal.User.PushSubscription.id;

      if (playerId && !isSynced) {
        try {
          await subscribeToPushNotifications(playerId);
          localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, "true");
          console.log("OneSignal Player ID synced with backend.");
        } catch (error) {
          handleApiError(error, "Không thể đồng bộ hóa thông báo đẩy.");
        }
      }
    };

    const initializeAndPrompt = async () => {
      // 1. Kiểm tra xem người dùng đã đăng ký trên OneSignal chưa
      const isSubscribed = OneSignal.User.PushSubscription.optedIn;

      if (isSubscribed) {
        // Nếu đã đăng ký, chỉ cần đồng bộ với backend
        await syncPlayerIdWithBackend();
      } else {
        // 2. Nếu chưa, hiển thị pop-up hỏi quyền
        // Phương thức này sẽ hiển thị slidedown trước, sau đó là native prompt
        await OneSignal.Slidedown.promptPush();
      }
    };

    // 3. Lắng nghe sự kiện "change" trên PushSubscription
    // Đây là cách đáng tin cậy nhất để biết khi nào người dùng đăng ký thành công
    const onSubscriptionChange = () => {
      // Khi có thay đổi (ví dụ người dùng vừa nhấn Allow), tiến hành đồng bộ
      syncPlayerIdWithBackend();
    };

    OneSignal.User.PushSubscription.addEventListener(
      "change",
      onSubscriptionChange
    );

    // Chạy logic khởi tạo sau một khoảng trễ nhỏ để đảm bảo OneSignal sẵn sàng
    const timer = setTimeout(initializeAndPrompt, 3000);

    // 4. Cleanup function để gỡ bỏ listener khi component unmount
    return () => {
      clearTimeout(timer);
      OneSignal.User.PushSubscription.removeEventListener(
        "change",
        onSubscriptionChange
      );
    };
  }, [isAuthenticated]);

  // Hook này chủ yếu để chạy logic, không cần trả về state
  return {};
};
