"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Settings,
  Globe,
  Users,
  Shield,
  Upload,
  Bell,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/lib/api/admin/settings";
import {
  AdminSettingsDto,
  UpdateSettingsRequest,
} from "@/types/admin/settings.types";
import { PushNotificationSettings } from "@/components/shared/PushNotificationSettings";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";

// Form data type with parsed values
interface SettingsFormData {
  // General Settings
  SiteName: string;
  MaintenanceMode: boolean;

  // User Management
  AllowNewRegistrations: boolean;
  RequireEmailConfirmation: boolean;
  DefaultRoleForNewUsers: string;

  // Content & Moderation
  ForbiddenKeywords: string;
  AutoLockAccountThreshold: number;

  // File Uploads
  MaxFileSizeMb: number;
  MaxAvatarSizeMb: number;
  AllowedFileTypes: string;
}

// Enhanced Form field component for consistent layout
interface FormFieldProps {
  label: string;
  description: string;
  children: React.ReactNode;
  status?: "default" | "warning" | "success";
  icon?: React.ComponentType<{ className?: string }>;
}

function EnhancedFormField({
  label,
  description,
  children,
  status = "default",
  icon: Icon,
}: FormFieldProps) {
  const statusColors = {
    default: "border-border/50",
    warning: "border-warning/20 bg-warning/5",
    success: "border-success/20 bg-success/5",
  };

  return (
    <div
      className={`relative group grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl border ${statusColors[status]} hover:border-border/80 transition-all duration-200`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <Label className="text-sm font-semibold text-foreground">
            {label}
          </Label>
          {status === "warning" && (
            <Badge
              variant="outline"
              className="text-xs bg-warning/10 text-warning border-warning/20"
            >
              Cảnh báo
            </Badge>
          )}
          {status === "success" && (
            <Badge
              variant="outline"
              className="text-xs bg-success/10 text-success border-success/20"
            >
              Hoạt động
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="md:col-span-2 flex items-center">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  // Fetch current settings
  const {
    data: settingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const response = await getAdminSettings();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch settings");
      }
      return response.data;
    },
    retry: 2,
  });

  // Form setup
  const form = useForm<SettingsFormData>({
    defaultValues: {
      SiteName: "",
      MaintenanceMode: false,
      AllowNewRegistrations: true,
      RequireEmailConfirmation: false,
      DefaultRoleForNewUsers: "Member",
      ForbiddenKeywords: "",
      AutoLockAccountThreshold: 5,
      MaxFileSizeMb: 10,
      MaxAvatarSizeMb: 2,
      AllowedFileTypes: "",
    },
  });

  const { register, handleSubmit, formState, reset, watch, setValue } = form;

  // Parse API data and populate form when data is loaded
  React.useEffect(() => {
    if (settingsData) {
      const parsedData: SettingsFormData = {
        SiteName: settingsData.SiteName || "",
        MaintenanceMode: settingsData.MaintenanceMode === "true",
        AllowNewRegistrations: settingsData.AllowNewRegistrations === "true",
        RequireEmailConfirmation:
          settingsData.RequireEmailConfirmation === "true",
        DefaultRoleForNewUsers: settingsData.DefaultRoleForNewUsers || "Member",
        ForbiddenKeywords: settingsData.ForbiddenKeywords || "",
        AutoLockAccountThreshold: parseInt(
          settingsData.AutoLockAccountThreshold || "5",
          10
        ),
        MaxFileSizeMb: parseInt(settingsData.MaxFileSizeMb || "10", 10),
        MaxAvatarSizeMb: parseInt(settingsData.MaxAvatarSizeMb || "2", 10),
        AllowedFileTypes: settingsData.AllowedFileTypes || "",
      };
      reset(parsedData);
    }
  }, [settingsData, reset]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Cài đặt đã được lưu thành công!", {
        description: "Tất cả thay đổi đã được áp dụng.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Không thể cập nhật cài đặt";
      toast.error("Lưu cài đặt thất bại", {
        description: errorMessage,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SettingsFormData) => {
    // Only include dirty fields in the request
    const dirtyFields = formState.dirtyFields;
    const changedSettings: Partial<AdminSettingsDto> = {};

    // Convert form data back to string format for API
    Object.keys(dirtyFields).forEach((key) => {
      const fieldKey = key as keyof SettingsFormData;
      const value = data[fieldKey];

      if (typeof value === "boolean") {
        changedSettings[fieldKey as keyof AdminSettingsDto] = value.toString();
      } else if (typeof value === "number") {
        changedSettings[fieldKey as keyof AdminSettingsDto] = value.toString();
      } else {
        changedSettings[fieldKey as keyof AdminSettingsDto] = value as string;
      }
    });

    if (Object.keys(changedSettings).length === 0) {
      toast.info("Không có thay đổi để lưu", {
        description: "Vui lòng chỉnh sửa ít nhất một cài đặt trước khi lưu.",
      });
      return;
    }

    const request: UpdateSettingsRequest = {
      settings: changedSettings,
    };

    updateMutation.mutate(request);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8">
          {/* Enhanced Loading Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-chart-1/5 to-chart-2/5 rounded-3xl" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                  <div className="relative bg-primary/10 p-3 rounded-xl">
                    <Settings className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Cài đặt Hệ thống
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Quản lý cấu hình toàn hệ thống
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-lg">Đang tải cài đặt...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8">
          {/* Enhanced Error Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-destructive/3 to-destructive/5 rounded-3xl" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-destructive/20 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-xl blur-lg" />
                  <div className="relative bg-destructive/10 p-3 rounded-xl">
                    <AlertTriangle className="h-7 w-7 text-destructive" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Lỗi Tải Cài đặt
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Không thể kết nối đến máy chủ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-destructive">
                    Không thể tải cài đặt
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error
                      ? error.message
                      : "Đã xảy ra lỗi không xác định"}
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="bg-background/80"
                >
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header Section */}
        <AdminPageHeader
          icon={Settings}
          title="Cài đặt Hệ thống"
          description="Quản lý cấu hình toàn hệ thống và thông số hoạt động"
        >
          <Button
            variant="outline"
            className="bg-background/80"
            onClick={() => reset()}
            disabled={!formState.isDirty}
          >
            Khôi phục
          </Button>
        </AdminPageHeader>

        {/* Status Information */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 rounded-lg p-3">
          <Clock className="h-4 w-4" />
          Các thay đổi sẽ được áp dụng ngay lập tức
          {formState.isDirty && (
            <Badge
              variant="outline"
              className="bg-warning/10 text-warning border-warning/20 ml-2"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Có thay đổi chưa lưu
            </Badge>
          )}
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="h-6 w-6 text-chart-1" />
                      Cấu hình Hệ thống
                    </CardTitle>
                    <CardDescription className="text-base">
                      Quản lý cài đặt toàn hệ thống. Chỉ những cài đặt đã thay
                      đổi sẽ được lưu.
                    </CardDescription>
                  </div>
                  {!formState.isDirty && (
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/20"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã đồng bộ
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="general"
                      className="rounded-lg flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden sm:inline">Chung</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="users"
                      className="rounded-lg flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Người dùng</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="moderation"
                      className="rounded-lg flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Kiểm duyệt</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="files"
                      className="rounded-lg flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Tải file</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* General Settings Tab */}
                  <TabsContent value="general" className="space-y-6 mt-8">
                    <div className="space-y-6">
                      <EnhancedFormField
                        label="Tên Ứng dụng"
                        description="Tên hiển thị trên tiêu đề trang, email và các thông báo của hệ thống"
                        icon={Globe}
                      >
                        <Input
                          {...register("SiteName")}
                          placeholder="Nhập tên ứng dụng"
                          className="w-full bg-background/50"
                        />
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Chế độ Bảo trì"
                        description="Bật/tắt toàn bộ trang web đối với người dùng thường. Admin vẫn có thể truy cập"
                        status={
                          watch("MaintenanceMode") ? "warning" : "default"
                        }
                        icon={Settings}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={watch("MaintenanceMode")}
                            onCheckedChange={(checked) =>
                              setValue("MaintenanceMode", checked, {
                                shouldDirty: true,
                              })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {watch("MaintenanceMode") ? "Đã bật" : "Đã tắt"}
                          </span>
                        </div>
                      </EnhancedFormField>
                    </div>
                  </TabsContent>

                  {/* User Management Tab */}
                  <TabsContent value="users" className="space-y-6 mt-8">
                    <div className="space-y-6">
                      <EnhancedFormField
                        label="Cho phép Đăng ký mới"
                        description="Cho phép người dùng tự đăng ký tài khoản mới trên hệ thống"
                        status={
                          watch("AllowNewRegistrations") ? "success" : "warning"
                        }
                        icon={Users}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={watch("AllowNewRegistrations")}
                            onCheckedChange={(checked) =>
                              setValue("AllowNewRegistrations", checked, {
                                shouldDirty: true,
                              })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {watch("AllowNewRegistrations")
                              ? "Cho phép"
                              : "Tạm khóa"}
                          </span>
                        </div>
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Yêu cầu Xác thực Email"
                        description="Bắt buộc người dùng phải kích hoạt tài khoản qua email trước khi sử dụng"
                        icon={Bell}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={watch("RequireEmailConfirmation")}
                            onCheckedChange={(checked) =>
                              setValue("RequireEmailConfirmation", checked, {
                                shouldDirty: true,
                              })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {watch("RequireEmailConfirmation")
                              ? "Bắt buộc"
                              : "Tùy chọn"}
                          </span>
                        </div>
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Vai trò Mặc định"
                        description="Vai trò mặc định được gán cho tất cả người dùng mới đăng ký"
                        icon={Shield}
                      >
                        <Select
                          value={watch("DefaultRoleForNewUsers")}
                          onValueChange={(value) =>
                            setValue("DefaultRoleForNewUsers", value, {
                              shouldDirty: true,
                            })
                          }
                        >
                          <SelectTrigger className="w-full bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIP">Khách hàng VIP</SelectItem>
                            <SelectItem value="Customer">Khách hàng</SelectItem>
                            <SelectItem value="Admin">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </EnhancedFormField>
                    </div>
                  </TabsContent>

                  {/* Content & Moderation Tab */}
                  <TabsContent value="moderation" className="space-y-6 mt-8">
                    <div className="space-y-6">
                      <EnhancedFormField
                        label="Từ khóa Bị cấm"
                        description="Danh sách các từ khóa bị cấm trong nội dung, cách nhau bởi dấu phẩy"
                        icon={Shield}
                      >
                        <Textarea
                          {...register("ForbiddenKeywords")}
                          placeholder="spam, không phù hợp, từ xấu"
                          className="w-full bg-background/50"
                          rows={3}
                        />
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Ngưỡng Tự động Khóa"
                        description="Tự động khóa tài khoản sau X báo cáo vi phạm. Đặt 0 để tắt tính năng"
                        status={
                          watch("AutoLockAccountThreshold") > 0
                            ? "success"
                            : "warning"
                        }
                        icon={AlertTriangle}
                      >
                        <div className="flex items-center gap-3">
                          <Input
                            {...register("AutoLockAccountThreshold", {
                              valueAsNumber: true,
                              min: 0,
                              max: 20,
                            })}
                            type="number"
                            min="0"
                            max="20"
                            className="w-32 bg-background/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            {watch("AutoLockAccountThreshold") === 0
                              ? "Đã tắt"
                              : `${watch("AutoLockAccountThreshold")} báo cáo`}
                          </span>
                        </div>
                      </EnhancedFormField>
                    </div>
                  </TabsContent>

                  {/* File Uploads Tab */}
                  <TabsContent value="files" className="space-y-6 mt-8">
                    <div className="space-y-6">
                      <EnhancedFormField
                        label="Kích thước File Tối đa"
                        description="Giới hạn kích thước tối đa cho các file đính kèm trong hệ thống"
                        icon={Upload}
                      >
                        <div className="flex items-center gap-3">
                          <Input
                            {...register("MaxFileSizeMb", {
                              valueAsNumber: true,
                              min: 1,
                              max: 100,
                            })}
                            type="number"
                            min="1"
                            max="100"
                            className="w-32 bg-background/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            MB
                          </span>
                        </div>
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Kích thước Avatar Tối đa"
                        description="Giới hạn kích thước riêng cho ảnh đại diện người dùng"
                        icon={Users}
                      >
                        <div className="flex items-center gap-3">
                          <Input
                            {...register("MaxAvatarSizeMb", {
                              valueAsNumber: true,
                              min: 1,
                              max: 10,
                            })}
                            type="number"
                            min="1"
                            max="10"
                            className="w-32 bg-background/50"
                          />
                          <span className="text-sm text-muted-foreground">
                            MB
                          </span>
                        </div>
                      </EnhancedFormField>

                      <EnhancedFormField
                        label="Các loại File được phép"
                        description="Danh sách đuôi file được phép tải lên, cách nhau bởi dấu phẩy"
                        icon={Upload}
                      >
                        <Input
                          {...register("AllowedFileTypes")}
                          placeholder="jpg, png, gif, pdf, doc, docx"
                          className="w-full bg-background/50"
                        />
                      </EnhancedFormField>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex justify-between items-center pt-6 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  {formState.isDirty ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-warning" />
                      Có {Object.keys(formState.dirtyFields).length} thay đổi
                      chưa lưu
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Tất cả thay đổi đã được lưu
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!formState.isDirty || updateMutation.isPending}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
                  size="lg"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </FormProvider>

        {/* Enhanced Push Notification Settings */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bell className="h-6 w-6 text-primary" />
              Cài đặt Thông báo Đẩy
            </CardTitle>
            <CardDescription className="text-base">
              Quản lý cấu hình thông báo đẩy cho ứng dụng. Các thay đổi sẽ được
              áp dụng ngay lập tức.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 rounded-xl p-6 border border-border/50">
              <PushNotificationSettings />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
