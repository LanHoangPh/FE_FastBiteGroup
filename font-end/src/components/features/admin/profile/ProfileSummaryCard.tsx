"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminAvatar } from "@/lib/api/admin/users";
import { MyAdminProfileDto } from "@/types/admin/user.types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Loader2, CalendarIcon, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { formatUtcToIctString } from "@/lib/utils/dateUtils";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileSummaryCardProps {
  profileData: MyAdminProfileDto;
}

export function ProfileSummaryCard({ profileData }: ProfileSummaryCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const updateUserAvatar = useAuthStore((state) => state.updateUserAvatar);
  const user = useAuthStore((state) => state.user);

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate upload progress for better UX
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 90) {
            progress = 90;
            clearInterval(interval);
          }
          setUploadProgress(Math.min(progress, 90));
        }, 200);
        return interval;
      };

      const progressInterval = simulateProgress();

      try {
        const response = await updateAdminAvatar(file);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(null);
        throw error;
      }
    },
    onSuccess: (response) => {
      // Assuming the API response.data contains the new URL
      const newAvatarUrl = response.data.avatarUrl;

      // 1. Update the global state immediately for instant UI feedback
      updateUserAvatar(newAvatarUrl);

      // 2. Force re-render of avatar by updating the key
      setAvatarKey((prev) => prev + 1);

      // 3. Invalidate the query to refetch server data in the background
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["my-admin-profile"] });
      }, 100);

      // 4. Reset preview states
      setPreviewImage(null);
      setSelectedFile(null);
      setIsPreviewDialogOpen(false);

      toast.success("Cập nhật ảnh đại diện thành công!");
    },
    onError: (error: any) => {
      toast.error("Không thể cập nhật ảnh đại diện", {
        description:
          error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(null); // Reset progress after completion
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedFile(file);
      setIsPreviewDialogOpen(true);
    }
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      setIsUploading(true);
      updateAvatarMutation.mutate(selectedFile);
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setIsPreviewDialogOpen(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Extract initials from full name
  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    return names
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Avatar with Edit Overlay */}
            <div className="relative group">
              <Avatar
                className="h-32 w-32 cursor-pointer border-4 border-background shadow-xl ring-4 ring-primary/20"
                onClick={handleAvatarClick}
                key={avatarKey}
              >
                <AvatarImage
                  src={user?.avatarUrl || profileData.avatarUrl || undefined}
                  alt={profileData.fullName}
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>

              {/* Edit Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Edit className="h-6 w-6 text-white" />
              </div>

              {/* Upload Progress Overlay */}
              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-full">
                  <Progress value={uploadProgress} className="w-3/4 h-2 mb-2" />
                  <p className="text-white text-xs font-medium">
                    {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Loading Overlay (fallback) */}
              {isUploading && uploadProgress === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Profile Info */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">
                {profileData.fullName}
              </h2>
              <p className="text-lg text-muted-foreground">
                {profileData.email}
              </p>

              {/* Account Creation Date */}
              <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                <span>
                  Tài khoản tạo ngày:{" "}
                  {formatUtcToIctString(profileData.createdAt)}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="w-full bg-background/50 hover:bg-background/80 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Thay đổi ảnh đại diện
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" />
              Xem trước ảnh đại diện
            </DialogTitle>
            <DialogDescription className="text-base">
              Xem trước ảnh trước khi tải lên. Bạn có muốn tiếp tục với ảnh này?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview Image */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-48 w-48 border-4 border-background shadow-xl ring-4 ring-primary/20">
                  <AvatarImage src={previewImage || undefined} alt="Preview" />
                  <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {getInitials(profileData.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Tên file:</span>
                  <span className="text-muted-foreground">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Kích thước:</span>
                  <span className="text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Loại file:</span>
                  <span className="text-muted-foreground">
                    {selectedFile.type}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handleCancelPreview}
              disabled={isUploading}
              className="bg-background/50 hover:bg-background/80 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Xác nhận và tải lên
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
