"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Users, Globe, Lock } from "lucide-react";

import {
  createChatGroupSchema,
  CreateChatGroupFormData,
} from "@/lib/schemas/customer/group.schema";
import { GroupType } from "@/types/customer/group";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateGroupDetailsFormProps {
  onSuccess: (data: CreateChatGroupFormData) => void;
  isLoading: boolean;
}

export function CreateGroupDetailsForm({
  onSuccess,
  isLoading,
}: CreateGroupDetailsFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<CreateChatGroupFormData>({
    resolver: zodResolver(createChatGroupSchema),
    defaultValues: {
      groupName: "",
      description: "",
      groupType: GroupType.Private,
      avatarFile: undefined,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before setting
      const maxSize = 2 * 1024 * 1024; // 2MB
      const acceptedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (file.size > maxSize) {
        form.setError("avatarFile", {
          message: "Ảnh đại diện không được lớn hơn 2MB.",
        });
        return;
      }

      if (!acceptedTypes.includes(file.type)) {
        form.setError("avatarFile", {
          message: "Chỉ hỗ trợ các định dạng .jpg, .jpeg, .png và .webp.",
        });
        return;
      }

      // Clear any previous errors
      form.clearErrors("avatarFile");

      // Set the file in form
      form.setValue("avatarFile", file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatarFile", undefined);
    setAvatarPreview(null);
    form.clearErrors("avatarFile");
  };

  const onSubmit = (data: CreateChatGroupFormData) => {
    // Extra validation layer to ensure no bypassing of limits
    console.log("Form data before submission:", {
      groupName: data.groupName,
      groupNameLength: data.groupName?.length,
      description: data.description,
      descriptionLength: data.description?.length,
    });

    // Additional client-side validation as a safeguard
    if (data.groupName && data.groupName.length > 20) {
      form.setError("groupName", {
        message: "Tên nhóm không được vượt quá 20 ký tự.",
      });
      return;
    }

    if (data.description && data.description.length > 100) {
      form.setError("description", {
        message: "Mô tả không được vượt quá 100 ký tự.",
      });
      return;
    }

    onSuccess(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <FormField
          control={form.control}
          name="avatarFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ảnh đại diện
              </FormLabel>
              <FormControl>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <>
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={avatarPreview}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl">
                            {form
                              .watch("groupName")
                              ?.charAt(0)
                              ?.toUpperCase() || "N"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleRemoveAvatar}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarPreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                    </Label>
                  </div>
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                Tối đa 2MB. Hỗ trợ JPG, PNG, WebP.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Group Name */}
        <FormField
          control={form.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tên nhóm *
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Nhập tên nhóm..."
                    {...field}
                    className="pr-12"
                    disabled={isLoading}
                    maxLength={30}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 30);
                      field.onChange(value);
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-50 dark:bg-gray-800"
                    >
                      {field.value.length}/20
                    </Badge>
                  </div>
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                Tối đa 20 ký tự. Hãy chọn tên ngắn gọn và dễ nhớ.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Mô tả
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Mô tả ngắn về nhóm của bạn..."
                    {...field}
                    rows={3}
                    className="resize-none pr-12"
                    disabled={isLoading}
                    maxLength={100}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 100);
                      field.onChange(value);
                    }}
                  />
                  <div className="absolute right-3 bottom-3">
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-50 dark:bg-gray-800"
                    >
                      {(field.value || "").length}/100
                    </Badge>
                  </div>
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                Tối đa 100 ký tự. Giúp mọi người hiểu về nhóm của bạn.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Group Type */}
        <FormField
          control={form.control}
          name="groupType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Loại nhóm *
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="space-y-3"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <RadioGroupItem
                      value={GroupType.Private}
                      id="private"
                      className="text-blue-600"
                    />
                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            Riêng tư
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Chỉ tham gia được qua lời mời
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <RadioGroupItem
                      value={GroupType.Public}
                      id="public"
                      className="text-green-600"
                    />
                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            Công khai
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mọi người có thể tìm thấy và tham gia
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Đang tạo...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Tạo nhóm
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
