"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Save,
  AlertTriangle,
  Crown,
  Upload,
  Settings,
  Image,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import {
  updateAdminGroup,
  updateAdminGroupSettings,
  changeAdminGroupOwner,
  updateAdminGroupAvatar,
} from "@/lib/api/admin/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import { AdminGroupDetailDTO, GroupType } from "@/types/admin/group.types";
import { GroupMemberSearchResultDto } from "@/types/admin/group.types";
import { GroupMemberSearchCombobox } from "./GroupMemberSearchCombobox";

// Form schemas
const generalSettingsSchema = z.object({
  groupName: z.string().min(1, "Tên nhóm không được để trống"),
  description: z.string().optional(),
});

const groupTypeSchema = z.object({
  groupType: z.enum(["Public", "Private", "Community"]),
});

const changeOwnerSchema = z.object({
  newOwnerUserId: z.string().min(1, "Vui lòng chọn người dùng"),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
type GroupTypeFormData = z.infer<typeof groupTypeSchema>;
type ChangeOwnerFormData = z.infer<typeof changeOwnerSchema>;

interface GroupSettingsTabProps {
  groupId: string;
  group: AdminGroupDetailDTO;
  isReadOnly?: boolean;
}

export function GroupSettingsTab({
  groupId,
  group,
  isReadOnly = false,
}: GroupSettingsTabProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newOwnerUserId, setNewOwnerUserId] = useState("");
  const [newOwnerSearchQuery, setNewOwnerSearchQuery] = useState("");
  const [selectedNewOwner, setSelectedNewOwner] =
    useState<GroupMemberSearchResultDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form for general settings
  const generalForm = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      groupName: group.groupName,
      description: group.description || "",
    },
  });

  // Form for group type
  const groupTypeForm = useForm<GroupTypeFormData>({
    resolver: zodResolver(groupTypeSchema),
    defaultValues: {
      groupType: group.groupType, // Use the actual group type from group data
    },
  });

  // Update the newOwnerUserId when selectedNewOwner changes
  useEffect(() => {
    if (selectedNewOwner) {
      setNewOwnerUserId(selectedNewOwner.userId);
    } else {
      setNewOwnerUserId("");
    }
  }, [selectedNewOwner]);

  // Mutations
  const updateGroupMutation = useMutation({
    mutationFn: (data: GeneralSettingsFormData) =>
      updateAdminGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Đã cập nhật thông tin nhóm");
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi cập nhật thông tin nhóm");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: GroupTypeFormData) =>
      updateAdminGroupSettings(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Đã cập nhật loại nhóm");
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi cập nhật loại nhóm");
    },
  });

  const changeOwnerMutation = useMutation({
    mutationFn: (data: ChangeOwnerFormData) =>
      changeAdminGroupOwner(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Đã thay đổi chủ sở hữu nhóm");
      setNewOwnerUserId("");
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi thay đổi chủ sở hữu");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => updateAdminGroupAvatar(groupId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Đã cập nhật ảnh đại diện nhóm");
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi cập nhật ảnh đại diện");
    },
  });

  // Handler functions
  const handleGeneralSubmit = (data: GeneralSettingsFormData) => {
    updateGroupMutation.mutate(data);
  };

  const handleGroupTypeSubmit = (data: GroupTypeFormData) => {
    updateSettingsMutation.mutate(data);
  };

  const handleChangeOwner = () => {
    if (newOwnerUserId) {
      changeOwnerMutation.mutate({ newOwnerUserId });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUploadAvatar = () => {
    if (selectedFile) {
      updateAvatarMutation.mutate(selectedFile);
    }
  };

  // Helper function to get group type display name
  const getGroupTypeDisplayName = (groupType: GroupType) => {
    switch (groupType) {
      case "Public":
        return "Công khai";
      case "Private":
        return "Riêng tư";
      case "Community":
        return "Cộng đồng";
      default:
        return groupType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Cài đặt nhóm</h2>
        <p className="text-muted-foreground mt-2">
          {isReadOnly
            ? "Nhóm đã bị xóa. Các cài đặt chỉ hiển thị ở chế độ xem."
            : "Quản lý thông tin và cấu hình nhóm của bạn"}
        </p>
      </div>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Chế độ chỉ xem</p>
              <p className="text-sm text-amber-700">
                Nhóm này đã bị xóa nên bạn không thể chỉnh sửa thông tin. Hãy
                khôi phục nhóm để tiếp tục quản lý.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Cập nhật tên và mô tả của nhóm
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={generalForm.handleSubmit(handleGeneralSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="groupName" className="text-sm font-medium">
                      Tên nhóm *
                    </Label>
                    <Input
                      id="groupName"
                      {...generalForm.register("groupName")}
                      placeholder="Nhập tên nhóm"
                      className="h-11"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      maxLength={50}
                    />
                    {generalForm.formState.errors.groupName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {generalForm.formState.errors.groupName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Mô tả nhóm
                    </Label>
                    <Textarea
                      id="description"
                      {...generalForm.register("description")}
                      placeholder="Nhập mô tả chi tiết về nhóm (tùy chọn)"
                      rows={4}
                      className="resize-none"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mô tả sẽ hiển thị cho các thành viên mới khi họ tham gia
                      nhóm
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={updateGroupMutation.isPending || isReadOnly}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateGroupMutation.isPending
                      ? "Đang lưu..."
                      : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Group Type Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Quyền riêng tư</CardTitle>
                  <CardDescription>
                    Kiểm soát ai có thể xem và tham gia nhóm
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={groupTypeForm.handleSubmit(handleGroupTypeSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Loại nhóm</Label>
                  <Select
                    value={groupTypeForm.watch("groupType")}
                    onValueChange={(value) =>
                      groupTypeForm.setValue("groupType", value as GroupType)
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn loại nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Công khai</span>
                          <span className="text-sm text-muted-foreground">
                            Ai cũng có thể tìm thấy và tham gia nhóm
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Private" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Riêng tư</span>
                          <span className="text-sm text-muted-foreground">
                            Chỉ thành viên được mời mới có thể xem nhóm
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Community" className="py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Cộng đồng</span>
                          <span className="text-sm text-muted-foreground">
                            Mọi người có thể xem nhưng cần phê duyệt để tham gia
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending || isReadOnly}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending
                      ? "Đang lưu..."
                      : "Cập nhật"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Avatar & Dangerous Actions */}
        <div className="space-y-6">
          {/* Group Avatar Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Image className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
                  <CardDescription>Tùy chỉnh hình ảnh nhóm</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-muted shadow-lg">
                  <AvatarImage
                    src={group.groupAvatarUrl}
                    alt={group.groupName}
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {group.groupName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full space-y-3">
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm"
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">
                      Định dạng: JPG, PNG, GIF (tối đa 2MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">File đã chọn:</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedFile.name}
                      </p>
                    </div>
                  )}

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Ảnh đã chọn:</p>
                      <div className="flex items-center gap-2">
                        <img
                          src={previewUrl}
                          alt="Ảnh đại diện nhóm"
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-destructive hover:text-destructive/90"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUploadAvatar}
                    disabled={
                      !selectedFile ||
                      updateAvatarMutation.isPending ||
                      isReadOnly
                    }
                    size="sm"
                    className="w-full"
                  >
                    {updateAvatarMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Cập nhật ảnh
                      </>
                    )}
                  </Button>

                  {/* Progress Bar */}
                  {updateAvatarMutation.isPending && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full animate-pulse"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dangerous Actions Card */}
          <Card className="border-destructive/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-destructive">
                    Vùng nguy hiểm
                  </CardTitle>
                  <CardDescription>
                    Các thao tác không thể hoàn tác
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Chuyển quyền sở hữu
                  </Label>
                  <div className="relative">
                    <GroupMemberSearchCombobox
                      value={selectedNewOwner}
                      onSelectUser={setSelectedNewOwner}
                      searchQuery={newOwnerSearchQuery}
                      onSearchQueryChange={setNewOwnerSearchQuery}
                      groupId={groupId}
                      placeholder="Tìm kiếm thành viên để chuyển quyền sở hữu..."
                    />
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={
                        !newOwnerUserId ||
                        changeOwnerMutation.isPending ||
                        isReadOnly
                      }
                      size="sm"
                      className="w-full"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Chuyển quyền sở hữu
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Xác nhận chuyển quyền sở hữu
                      </AlertDialogTitle>
                      <div className="text-left space-y-2">
                        <AlertDialogDescription>
                          Bạn sắp chuyển quyền sở hữu nhóm cho người dùng có ID:
                        </AlertDialogDescription>
                        <Badge variant="outline" className="font-mono">
                          {newOwnerUserId}
                        </Badge>
                        <div className="text-destructive font-medium">
                          ⚠️ Hành động này không thể hoàn tác và bạn sẽ mất toàn
                          bộ quyền admin.
                        </div>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleChangeOwner}
                        disabled={changeOwnerMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {changeOwnerMutation.isPending
                          ? "Đang xử lý..."
                          : "Xác nhận chuyển"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-destructive">
                      Lưu ý quan trọng
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Bạn sẽ mất tất cả quyền quản trị nhóm</li>
                      <li>• Người mới sẽ có toàn quyền điều khiển nhóm</li>
                      <li>• Thao tác này không thể được hoàn tác</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
