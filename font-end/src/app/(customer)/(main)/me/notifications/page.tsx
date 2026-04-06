"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  UserPlus,
  Users,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotificationsPage() {
  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for notification types
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [friendRequestNotifications, setFriendRequestNotifications] =
    useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Cài đặt thông báo đã được cập nhật");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
              Thông báo
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Quản lý cài đặt thông báo cho tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {pushNotifications ? "Bật" : "Tắt"} thông báo đẩy
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {emailNotifications ? "Bật" : "Tắt"} email
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {doNotDisturb ? "Bật" : "Tắt"} không làm phiền
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enhanced Notification Channels */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              Kênh thông báo
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Chọn cách bạn muốn nhận thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-500" />
                    </div>
                    Thông báo đẩy
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Nhận thông báo trên trình duyệt và thiết bị di động
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-500/5 hover:to-emerald-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-green-500" />
                    </div>
                    Thông báo qua email
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Nhận thông báo qua địa chỉ email của bạn
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-red-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                    </div>
                    Thông báo qua SMS
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Nhận thông báo qua tin nhắn SMS
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Notification Types */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              Loại thông báo
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Chọn loại thông báo bạn muốn nhận
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-indigo-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                    </div>
                    Tin nhắn
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Thông báo khi có tin nhắn mới
                  </p>
                </div>
                <Switch
                  checked={messageNotifications}
                  onCheckedChange={setMessageNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-indigo-600"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-500/5 hover:to-teal-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    Nhóm
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Thông báo về hoạt động trong nhóm
                  </p>
                </div>
                <Switch
                  checked={groupNotifications}
                  onCheckedChange={setGroupNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-teal-600"
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-yellow-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="flex items-center gap-3 text-base font-medium">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-orange-500" />
                    </div>
                    Lời mời kết bạn
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                    Thông báo khi có lời mời kết bạn mới
                  </p>
                </div>
                <Switch
                  checked={friendRequestNotifications}
                  onCheckedChange={setFriendRequestNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-yellow-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Do Not Disturb */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-red-500/5 to-orange-500/5">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <BellOff className="w-4 h-4 text-white" />
              </div>
              Không làm phiền
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Tạm thời tắt tất cả thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-500/5 hover:to-orange-500/5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Bật chế độ không làm phiền
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tất cả thông báo sẽ bị tắt cho đến khi bạn tắt chế độ này
                  </p>
                  {doNotDisturb && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Chế độ không làm phiền đang bật
                      </span>
                    </div>
                  )}
                </div>
                <Switch
                  checked={doNotDisturb}
                  onCheckedChange={setDoNotDisturb}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-orange-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
