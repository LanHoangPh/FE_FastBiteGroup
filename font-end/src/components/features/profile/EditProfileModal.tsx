"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile } from "@/lib/api/customer/me";
import { handleApiError } from "@/lib/utils/errorUtils";
import { toast } from "sonner";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils/index";

import {
  updateProfileSchema,
  UpdateProfileFormData,
} from "@/lib/schemas/customer/user.schema";
import { MyProfileDto } from "@/types/customer/user.types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MyProfileDto;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: EditProfileModalProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();

  // Parse dateOfBirth if it exists
  const dateOfBirth = profile.dateOfBirth
    ? new Date(profile.dateOfBirth)
    : undefined;

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      dateOfBirth: dateOfBirth,
      bio: profile.bio || "",
      twoFactorEnabled: profile.twoFactorEnabled || false,
    },
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      // Extract firstName and lastName from fullName if needed
      let firstName = profile.firstName || "";
      let lastName = profile.lastName || "";

      // If firstName or lastName is missing but we have fullName, extract from there
      if ((!firstName || !lastName) && profile.fullName) {
        // Safer name splitting
        const nameParts = profile.fullName.trim().split(" ");
        firstName = firstName || nameParts[0] || "";
        lastName = lastName || nameParts.slice(1).join(" ") || "";
      }

      // Parse date of birth
      let dateOfBirth: Date | undefined = undefined;
      try {
        if (profile.dateOfBirth) {
          const parsedDate = new Date(profile.dateOfBirth);
          if (!isNaN(parsedDate.getTime())) {
            dateOfBirth = parsedDate;
          }
        }
      } catch (error) {
        console.warn("Invalid date format:", profile.dateOfBirth);
      }

      form.reset({
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        bio: profile.bio || "",
        twoFactorEnabled: profile.twoFactorEnabled || false,
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => {
      // Transform the data for API submission
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        // Always send a string for dateOfBirth
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : undefined,
        bio: data.bio?.trim() || "",
        twoFactorEnabled: data.twoFactorEnabled,
      };

      console.log("Submitting profile data:", payload);
      return updateMyProfile(payload);
    },
    onSuccess: () => {
      toast.success("Hồ sơ đã được cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      onClose();
    },
    onError: (error) => {
      handleApiError(error, "Không thể cập nhật hồ sơ");
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="customer-glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-white">
            Chỉnh sửa hồ sơ
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Cập nhật thông tin cá nhân của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                {profile.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">
                {profile.fullName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profile.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Thành viên từ{" "}
                {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày sinh</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: vi })
                          ) : (
                            <span>Chọn ngày sinh</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          console.log("Date selected:", date);
                          field.onChange(date);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Thông tin này sẽ không được hiển thị công khai
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới thiệu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Viết một vài điều về bạn"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tối đa 500 ký tự. Thông tin này sẽ được hiển thị trên trang
                    hồ sơ của bạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Xác thực hai yếu tố
                    </FormLabel>
                    <FormDescription>
                      Bật xác thực hai yếu tố để tăng cường bảo mật cho tài
                      khoản của bạn
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-2"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="mt-2"
              >
                {mutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
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
