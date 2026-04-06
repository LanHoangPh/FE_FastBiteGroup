"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updatePrivacySettings } from "@/lib/api/customer/me";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  updatePrivacySettingsSchema,
  UpdatePrivacySettingsFormData,
} from "@/lib/schemas/customer/user.schema";
import { handleApiError } from "@/lib/utils/errorUtils";
import { toast } from "sonner";
import { Lock, Save, MessageCircle, Users, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MessagingPrivacy } from "@/types/customer/user.types";

export default function PrivacySettingsPage() {
  const queryClient = useQueryClient();

  // Re-use the data from the main profile query.
  // TanStack Query will provide the cached data instantly.
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile, // This won't re-fetch if data is fresh
  });

  const form = useForm<UpdatePrivacySettingsFormData>({
    resolver: zodResolver(updatePrivacySettingsSchema),
    defaultValues: {
      messagingPrivacy: MessagingPrivacy.FromSharedGroupMembers,
    },
  });

  // Update form value when profile data is loaded
  useEffect(() => {
    if (profileResponse?.data?.messagingPrivacy !== undefined) {
      form.reset({
        messagingPrivacy: profileResponse.data
          .messagingPrivacy as MessagingPrivacy,
      });
    }
  }, [profileResponse?.data?.messagingPrivacy, form]);

  const mutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Cài đặt quyền riêng tư đã được cập nhật");
    },
    onError: (error) => {
      handleApiError(error, "Không thể cập nhật cài đặt quyền riêng tư");
    },
  });

  const onSubmit = (data: UpdatePrivacySettingsFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Đang tải cài đặt...</div>;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
              Quyền riêng tư
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Quản lý cài đặt quyền riêng tư cho tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Privacy Status */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Cài đặt quyền riêng tư hiện tại:
              <span className="font-bold">
                {profileResponse?.data?.messagingPrivacy ===
                "FromSharedGroupMembers"
                  ? "Thành viên nhóm chung"
                  : "Tất cả mọi người"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/10 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cài đặt Tin nhắn
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Chọn người có thể gửi tin nhắn cho bạn.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="messagingPrivacy"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Ai có thể nhắn tin cho tôi
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value as MessagingPrivacy);
                          }}
                          value={
                            field.value ||
                            MessagingPrivacy.FromSharedGroupMembers
                          }
                        >
                          <SelectTrigger className="h-12 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <SelectValue placeholder="Chọn cài đặt quyền riêng tư" />
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl">
                            <SelectItem
                              value={MessagingPrivacy.FromSharedGroupMembers}
                              className="rounded-lg hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300"
                            >
                              <div className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                  <Users className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    Chỉ thành viên trong nhóm chung
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Chỉ người cùng nhóm mới có thể nhắn tin
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value={MessagingPrivacy.FromAnyone}
                              className="rounded-lg hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-300"
                            >
                              <div className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                                  <Globe className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    Tất cả mọi người
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Bất kỳ ai cũng có thể gửi tin nhắn cho bạn
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  {mutation.isPending ? (
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
