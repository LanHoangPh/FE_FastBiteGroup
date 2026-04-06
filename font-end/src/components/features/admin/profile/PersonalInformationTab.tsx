"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminProfile } from "@/lib/api/admin/users";
import { MyAdminProfileDto } from "@/types/admin/user.types";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/lib/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit, CalendarIcon, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { formatUtcToIctString } from "@/lib/utils/dateUtils";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Controller } from "react-hook-form";

interface PersonalInformationTabProps {
  profileData: MyAdminProfileDto;
}

export function PersonalInformationTab({
  profileData,
}: PersonalInformationTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: undefined, // Changed from new Date() to undefined
      bio: "",
      twoFactorEnabled: false,
    },
  });

  // UPDATE: Form initialization with new required fields
  useEffect(() => {
    if (profileData?.fullName) {
      // Safer name splitting
      const nameParts = profileData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // UPDATE: Use the new required dateOfBirth field
      let dateOfBirth: Date | undefined = undefined;
      try {
        const parsedDate = new Date(profileData.dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          dateOfBirth = parsedDate;
        }
      } catch (error) {
        console.warn("Invalid date format:", profileData.dateOfBirth);
      }

      form.reset({
        firstName,
        lastName,
        dateOfBirth,
        bio: profileData.bio || "",
        twoFactorEnabled: profileData.twoFactorEnabled || false,
      });
    }
  }, [profileData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => {
      // FIX: Better data transformation and validation
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        // FIX: Always send a string for dateOfBirth
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : new Date().toISOString(),
        bio: data.bio?.trim() || "",
        twoFactorEnabled: data.twoFactorEnabled,
      };

      console.log("Submitting payload:", payload);
      return updateAdminProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-admin-profile"] });
      toast.success("Cập nhật thông tin thành công!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error("Không thể cập nhật thông tin", {
        description:
          error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    console.log("Form data being submitted:", data);
    updateProfileMutation.mutate(data);
  };

  // FIX: Safer name extraction with null checks
  const getFirstName = () => {
    if (!profileData?.fullName) return "";
    return profileData.fullName.trim().split(" ")[0] || "";
  };

  const getLastName = () => {
    if (!profileData?.fullName) return "";
    const parts = profileData.fullName.trim().split(" ");
    return parts.slice(1).join(" ") || "";
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin cá nhân và cài đặt bảo mật
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cá nhân và cài đặt bảo mật của bạn. Nhấn Lưu
                thay đổi khi hoàn tất.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Nhập họ"
                    maxLength={50}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Nhập tên"
                    maxLength={50}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Controller
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            (() => {
                              try {
                                return formatUtcToIctString(
                                  field.value.toISOString()
                                );
                              } catch (error) {
                                console.warn("Date formatting error:", error);
                                return field.value.toLocaleDateString("vi-VN");
                              }
                            })()
                          ) : (
                            <span>Chọn ngày sinh</span>
                          )}
                        </Button>
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
                  )}
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu</Label>
                <Textarea
                  id="bio"
                  {...form.register("bio")}
                  placeholder="Nhập giới thiệu về bản thân (tùy chọn)"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả ngắn gọn về bản thân hoặc vai trò của bạn trong tổ chức
                </p>
              </div>

              {/* Two-Factor Authentication Setting */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium">
                    Xác thực hai yếu tố (2FA)
                  </Label>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {form.watch("twoFactorEnabled")
                        ? "Bảo mật nâng cao"
                        : "Bảo mật cơ bản"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {form.watch("twoFactorEnabled")
                        ? "Tài khoản của bạn được bảo vệ bởi xác thực hai yếu tố"
                        : "Bật 2FA để tăng cường bảo mật cho tài khoản"}
                    </p>
                  </div>
                  <Controller
                    control={form.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Read-only Information Display */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Thông tin hiện tại
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Họ và tên
              </Label>
              <p className="text-sm font-medium">
                {profileData?.fullName || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <p className="text-sm font-medium">
                {profileData?.email || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Ngày sinh
              </Label>
              <p className="text-sm font-medium">
                {(() => {
                  try {
                    return formatUtcToIctString(profileData.dateOfBirth);
                  } catch (error) {
                    console.warn("Date display error:", error);
                    return new Date(profileData.dateOfBirth).toLocaleDateString(
                      "vi-VN"
                    );
                  }
                })()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Giới thiệu
              </Label>
              <p className="text-sm font-medium">
                {profileData?.bio || "Chưa có thông tin giới thiệu"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Xác thực hai yếu tố
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    profileData?.twoFactorEnabled ? "bg-success" : "bg-gray-400"
                  )}
                />
                <p className="text-sm font-medium">
                  {profileData?.twoFactorEnabled ? "Đã bật" : "Đã tắt"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
