"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  X,
  Globe,
  Lock,
  Users,
  FileImage,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createCommunityGroupSchema,
  CreateCommunityGroupFormData,
} from "@/lib/schemas/customer/community.schema";
import { createCommunityGroup } from "@/lib/api/customer/groups";
import { EnumGroupPrivacy } from "@/types/customer/group";
import { handleApiError } from "@/lib/utils/errorUtils";
import { cn } from "@/lib/utils";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCommunityModal({
  isOpen,
  onOpenChange,
}: CreateCommunityModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateCommunityGroupFormData>({
    resolver: zodResolver(createCommunityGroupSchema),
    defaultValues: {
      groupName: "",
      description: "",
      privacy: EnumGroupPrivacy.Public,
      avatarFile: undefined,
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: createCommunityGroup,
    onSuccess: (response) => {
      toast.success(
        `Cộng đồng '${response.groupName}' đã được tạo thành công.`
      );

      // Invalidate queries to refresh the communities list
      queryClient.invalidateQueries({
        queryKey: ["myGroups"],
      });

      // Close modal and reset form
      onOpenChange(false);
      form.reset();
      setPreviewUrl(null);

      // Redirect to the new community's page
      router.push(`/communities/${response.groupId}`);
    },
    onError: (error) => {
      handleApiError(error, "Không thể tạo cộng đồng");
    },
  });

  const onSubmit = (data: CreateCommunityGroupFormData) => {
    createCommunityMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatarFile", file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    form.setValue("avatarFile", undefined);
    setPreviewUrl(null);

    // Reset file input
    const fileInput = document.getElementById(
      "avatar-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleClose = () => {
    if (!createCommunityMutation.isPending) {
      onOpenChange(false);
      form.reset();
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-gray-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Tạo cộng đồng mới
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Tạo một không gian để mọi người kết nối và chia sẻ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Community Name */}
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tên cộng đồng *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Nhập tên cộng đồng..."
                        {...field}
                        className="pr-12"
                        disabled={createCommunityMutation.isPending}
                        maxLength={25}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 25);
                          field.onChange(value);
                        }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 dark:bg-gray-800"
                        >
                          {field.value.length}/15
                        </Badge>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Tối đa 15 ký tự. Hãy chọn tên ngắn gọn và dễ nhớ.
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
                        placeholder="Mô tả ngắn về cộng đồng của bạn..."
                        {...field}
                        rows={3}
                        className="resize-none pr-12"
                        disabled={createCommunityMutation.isPending}
                        maxLength={30}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 30);
                          field.onChange(value);
                        }}
                      />
                      <div className="absolute right-3 bottom-3">
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 dark:bg-gray-800"
                        >
                          {(field.value || "").length}/30
                        </Badge>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                    Tối đa 30 ký tự. Giúp mọi người hiểu về cộng đồng của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Setting */}
            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quyền riêng tư *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                      disabled={createCommunityMutation.isPending}
                    >
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <RadioGroupItem
                          value={EnumGroupPrivacy.Public}
                          id="public"
                          className="text-green-600"
                        />
                        <Label
                          htmlFor="public"
                          className="flex-1 cursor-pointer"
                        >
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

                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <RadioGroupItem
                          value={EnumGroupPrivacy.Private}
                          id="private"
                          className="text-orange-600"
                        />
                        <Label
                          htmlFor="private"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-orange-600" />
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
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={removeFile}
                            disabled={createCommunityMutation.isPending}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <FileImage className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex justify-center">
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={createCommunityMutation.isPending}
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm font-medium",
                            createCommunityMutation.isPending &&
                              "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Upload className="h-4 w-4" />
                          {previewUrl ? "Thay đổi ảnh" : "Chọn ảnh"}
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

            <DialogFooter className="gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createCommunityMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createCommunityMutation.isPending}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {createCommunityMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo cộng đồng
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
