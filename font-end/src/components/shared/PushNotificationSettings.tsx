"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, AlertTriangle, Check, X } from "lucide-react";
import { toast } from "sonner";
import OneSignal from "react-onesignal";

export function PushNotificationSettings() {
  const [permission, setPermission] =
    React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  React.useEffect(() => {
    let mounted = true;
    const load = () => {
      try {
        const perm = OneSignal.Notifications
          .permission as unknown as NotificationPermission;
        const opted = (OneSignal.User as any).PushSubscription?.optedIn as
          | boolean
          | undefined;
        if (!mounted) return;
        if (perm) setPermission(perm);
        if (typeof opted === "boolean") setIsSubscribed(opted);
      } catch {}
    };
    load();
    const onPermission = () => load();
    const onSubChange = () => load();
    OneSignal.Notifications.addEventListener("permissionChange", onPermission);
    (OneSignal.User as any).PushSubscription?.addEventListener(
      "change",
      onSubChange
    );
    return () => {
      mounted = false;
      OneSignal.Notifications.removeEventListener(
        "permissionChange",
        onPermission
      );
      (OneSignal.User as any).PushSubscription?.removeEventListener(
        "change",
        onSubChange
      );
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      await OneSignal.Slidedown.promptPush();
      toast.success("Đã bật thông báo đẩy thành công");
    } catch {
      toast.error("Không thể kích hoạt thông báo đẩy");
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await (OneSignal.User as any).PushSubscription?.optOut();
      toast.success("Đã tắt thông báo đẩy");
    } catch {
      toast.error("Không thể tắt thông báo đẩy");
    }
  };

  const handleTestNotification = async () => {
    toast.info(
      "Hãy gửi thông báo thử nghiệm từ máy chủ hoặc OneSignal Dashboard."
    );
  };

  const handleTestCriticalAlert = async () => {
    toast.info("Hãy kiểm tra cảnh báo từ máy chủ sau khi bật thông báo.");
  };

  const isVAPIDConfigured = true;

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge variant="default" className="bg-success">
            <Check className="h-3 w-3 mr-1" />
            Đã cấp
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Từ chối
          </Badge>
        );
      case "default":
        return <Badge variant="secondary">Chưa quyết định</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Thông báo đẩy không được hỗ trợ
          </CardTitle>
          <CardDescription>
            Trình duyệt của bạn không hỗ trợ thông báo đẩy web. Vui lòng sử dụng
            trình duyệt hiện đại như Chrome, Firefox, hoặc Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Cài đặt thông báo đẩy
        </CardTitle>
        <CardDescription>
          Quản lý thông báo đẩy để nhận cảnh báo quan trọng ngay cả khi không mở
          ứng dụng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái quyền:</span>
              {getPermissionBadge()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đăng ký thông báo:</span>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Đã kích hoạt
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Chưa kích hoạt
                  </>
                )}
              </Badge>
            </div>
            {/* VAPID không còn áp dụng khi dùng OneSignal */}
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <p>✅ Thông báo trong ứng dụng</p>
              <p
                className={
                  isSubscribed ? "text-success" : "text-muted-foreground"
                }
              >
                {isSubscribed ? "✅" : "❌"} Thông báo nền
              </p>
              <p
                className={
                  isSubscribed ? "text-success" : "text-muted-foreground"
                }
              >
                {isSubscribed ? "✅" : "❌"} Cảnh báo quan trọng
              </p>
            </div>
          </div>
        </div>

        {/* VAPID Configuration Warning */}
        {!isVAPIDConfigured && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  VAPID Key Not Configured
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Push notifications may not work properly. Please configure
                  NEXT_PUBLIC_VAPID_KEY in your environment variables.
                  <br />
                  <a
                    href="/PUSH_NOTIFICATIONS_SETUP.md"
                    target="_blank"
                    className="underline hover:no-underline"
                  >
                    View setup guide →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {!isSubscribed ? (
            <Button
              onClick={handleEnableNotifications}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Kích hoạt thông báo đẩy
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleDisableNotifications}
              className="flex items-center gap-2"
            >
              <BellOff className="h-4 w-4" />
              Tắt thông báo đẩy
            </Button>
          )}

          {isSubscribed && (
            <>
              <Button variant="outline" onClick={handleTestNotification}>
                Thử nghiệm thông báo
              </Button>
              <Button
                variant="outline"
                onClick={handleTestCriticalAlert}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Thử cảnh báo quan trọng
              </Button>
            </>
          )}
        </div>

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            <strong>Lưu ý:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Cảnh báo quan trọng sẽ hiển thị ngay cả khi tab không được focus
            </li>
            <li>Thông báo đẩy chỉ hoạt động trên HTTPS hoặc localhost</li>
            <li>Bạn có thể thay đổi cài đặt này bất cứ lúc nào</li>
            <li>Dữ liệu đăng ký được mã hóa và bảo mật</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
