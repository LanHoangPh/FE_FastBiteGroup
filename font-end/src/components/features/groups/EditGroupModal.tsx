"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";

import { GroupDetailsDto, EnumGroupPrivacy } from "@/types/customer/group";
import {
  updateGroupInfoSchema,
  UpdateGroupInfoFormData,
} from "@/lib/schemas/customer/group.schema";
import { updateGroupInfo, updateGroupAvatar } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditGroupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  group: GroupDetailsDto;
}

export function EditGroupModal({
  isOpen,
  onOpenChange,
  group,
}: EditGroupModalProps) {
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Form setup with default values from group prop
  const form = useForm<UpdateGroupInfoFormData>({
    resolver: zodResolver(updateGroupInfoSchema),
    defaultValues: {
      groupName: group.groupName,
      description: group.description || "",
      privacy: group.privacy,
    },
  });

  // Update group info mutation
  const updateInfoMutation = useMutation({
    mutationFn: (data: UpdateGroupInfoFormData) =>
      updateGroupInfo(group.groupId, data),
    onSuccess: () => {
      toast.success("Thông tin nhóm đã được cập nhật.");
      queryClient.invalidateQueries({
        queryKey: ["groupDetails", group.groupId],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      handleApiError(error, "Không thể cập nhật thông tin nhóm");
    },
  });

  // Update group avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => updateGroupAvatar(group.groupId, file),
    onSuccess: () => {
      toast.success("Cập nhật ảnh đại diện thành công.");
      queryClient.invalidateQueries({
        queryKey: ["groupDetails", group.groupId],
      });
      setIsAvatarLoading(false);
    },
    onError: (error) => {
      handleApiError(error, "Không thể cập nhật ảnh đại diện");
      setIsAvatarLoading(false);
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const acceptedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!acceptedTypes.includes(file.type)) {
        toast.error("Chỉ hỗ trợ các định dạng .jpg, .jpeg, .png và .webp.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Ảnh đại diện không được lớn hơn 2MB.");
        return;
      }

      setIsAvatarLoading(true);
      updateAvatarMutation.mutate(file);
    }
  };

  const onSubmit = (data: UpdateGroupInfoFormData) => {
    updateInfoMutation.mutate(data);
  };

  // Reset form when group changes
  React.useEffect(() => {
    if (group) {
      form.reset({
        groupName: group.groupName,
        description: group.description || "",
        privacy: group.privacy,
      });
    }
  }, [group, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin nhóm</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và cài đặt của nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Update Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={group.groupAvatarUrl} />
                <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-lg">
                  {getInitials(group.groupName)}
                </AvatarFallback>
              </Avatar>

              {/* Edit overlay */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isAvatarLoading}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              >
                {isAvatarLoading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Nhấn vào ảnh để thay đổi ảnh đại diện
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Group Info Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Group Name */}
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên nhóm</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên nhóm..."
                        {...field}
                        disabled={updateInfoMutation.isPending}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 20);
                          field.onChange(value);
                        }}
                        maxLength={20}
                      />
                    </FormControl>
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
                    <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả nhóm..."
                        className="min-h-[80px]"
                        {...field}
                        disabled={updateInfoMutation.isPending}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 50);
                          field.onChange(value);
                        }}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Privacy Settings */}
              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quyền riêng tư</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={updateInfoMutation.isPending}
                        className="grid grid-cols-1 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={EnumGroupPrivacy.Public}
                            id="public"
                          />
                          <Label htmlFor="public" className="flex-1">
                            <div>
                              <p className="font-medium">Nhóm công khai</p>
                              <p className="text-sm text-gray-500">
                                Bất kỳ ai cũng có thể tìm thấy và tham gia nhóm
                              </p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={EnumGroupPrivacy.Private}
                            id="private"
                          />
                          <Label htmlFor="private" className="flex-1">
                            <div>
                              <p className="font-medium">Nhóm riêng tư</p>
                              <p className="text-sm text-gray-500">
                                Chỉ có thể tham gia nhóm qua lời mời
                              </p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateInfoMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateInfoMutation.isPending}
                  className="min-w-[120px]"
                >
                  {updateInfoMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
