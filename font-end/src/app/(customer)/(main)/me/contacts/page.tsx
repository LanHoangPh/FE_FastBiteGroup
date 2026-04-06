"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyContacts } from "@/lib/api/customer/me";
import { handleApiError } from "@/lib/utils/errorUtils";
import { usePresenceStore } from "@/store/presenceStore";
import { ContactDto } from "@/types/customer/user.types";
import {
  Users,
  Search,
  UserPlus,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: contactsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: getMyContacts,
  });

  // Hydrate presence store when contacts data is loaded
  useEffect(() => {
    if (contactsResponse?.success && contactsResponse.data) {
      // Get the batch update action from the presence store
      const { setStatusesBatch } = usePresenceStore.getState();

      // Format the data and update the store
      const statusesToSet = contactsResponse.data.map(
        (contact: ContactDto) => ({
          userId: contact.userId,
          presenceStatus: contact.presenceStatus,
        })
      );
      setStatusesBatch(statusesToSet);
    }
  }, [contactsResponse]);

  // Filter contacts based on search query
  const filteredContacts = contactsResponse?.data?.filter(
    (contact: ContactDto) =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
              Danh bạ
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Quản lý danh sách liên hệ của bạn
            </p>
          </div>
        </div>

        {/* Contact Stats */}
        {!isLoading && contactsResponse?.success && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Tổng cộng: {contactsResponse.data?.length || 0} liên hệ
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Đang hoạt động:{" "}
                  {contactsResponse.data?.filter(
                    (c) => c.presenceStatus === "Online"
                  ).length || 0}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Kết quả tìm kiếm: {filteredContacts?.length || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Search and Add Contact */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Tìm kiếm liên hệ..."
            className="pl-12 h-12 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg focus:shadow-xl transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={50}
          />
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <UserPlus className="h-5 w-5 mr-2" />
          Thêm liên hệ
        </Button>
      </div>

      {/* Enhanced Contacts List */}
      <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            Liên hệ của tôi
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Danh sách người dùng bạn đã kết nối
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-500/5 to-gray-600/5"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40 bg-gradient-to-r from-gray-400/20 to-gray-500/20" />
                        <Skeleton className="h-4 w-24 bg-gradient-to-r from-gray-400/20 to-gray-500/20" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                  </div>
                ))}
            </div>
          ) : isError || !contactsResponse?.success ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                Không thể tải danh sách liên hệ. Vui lòng thử lại sau.
              </AlertDescription>
            </Alert>
          ) : filteredContacts?.length === 0 ? (
            <div className="text-center py-10">
              {searchQuery ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Không tìm thấy liên hệ phù hợp với "{searchQuery}"
                  </p>
                </>
              ) : (
                <>
                  <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Bạn chưa có liên hệ nào
                  </p>
                  <Button variant="outline" className="mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm liên hệ đầu tiên
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts?.map((contact: ContactDto) => (
                <div
                  key={contact.userId}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatarWithStatus
                      userId={contact.userId}
                      src={contact.avatarUrl}
                      fallback={contact.fullName.charAt(0)}
                      initialStatus={contact.presenceStatus}
                    />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {contact.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">Nhắn tin</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Tùy chọn</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                        <DropdownMenuItem>Chặn liên hệ</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Xóa liên hệ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
