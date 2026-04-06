"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Camera } from "lucide-react";
import { MyProfileDto } from "@/types/customer/user.types";
import { updateMyAvatar } from "@/lib/api/customer/me";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/utils/errorUtils";
import { toast } from "sonner";
import { EditProfileModal } from "@/components/features/profile/EditProfileModal";
import { ImagePreviewModal } from "@/components/features/profile/ImagePreviewModal";
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";

interface ProfileHeaderProps {
  profile: MyProfileDto;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const avatarMutation = useMutation({
    mutationFn: updateMyAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Cập nhật ảnh đại diện thành công");
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error) => {
      handleApiError(error, "Cập nhật ảnh đại diện thất bại");
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn", {
          description: "Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Định dạng file không hợp lệ", {
          description: "Vui lòng chọn file ảnh (jpg, png, gif, etc.)",
        });
        return;
      }

      // Create preview URL and open modal
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
      setIsImagePreviewOpen(true);
    }
  };

  const handleConfirmAvatar = () => {
    if (selectedFile) {
      avatarMutation.mutate(selectedFile);
      setIsImagePreviewOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div
            className="relative rounded-full h-24 w-24 overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <UserAvatarWithStatus
              userId={profile.userId}
              src={profile.avatarUrl}
              fallback={profile.fullName.charAt(0)}
              initialStatus={profile.presenceStatus}
              className="h-24 w-24"
            />
            {isHovering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-white flex flex-col items-center"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs mt-1">Thay đổi</span>
                </label>
                <input
                  id="avatar-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            )}
          </div>
          {avatarMutation.isPending && (
            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {profile.fullName}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            {profile.email}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {isImagePreviewOpen && selectedFile && (
        <ImagePreviewModal
          isOpen={isImagePreviewOpen}
          onClose={() => {
            setIsImagePreviewOpen(false);
            URL.revokeObjectURL(previewUrl);
          }}
          onConfirm={handleConfirmAvatar}
          file={selectedFile}
          imageUrl={previewUrl}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
}
