"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Pin,
  Users,
  ChevronRight,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  Image,
  File,
  Link as LinkIcon,
  Edit,
} from "lucide-react";

import { ConversationPartnerDto } from "@/types/customer/user.types";
import { UserPresenceStatus } from "@/types/customer/models";
import { MutualGroupsSheet } from "../users/MutualGroupsSheet";
import { deleteConversation } from "@/lib/api/customer/conversations";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleApiError } from "@/lib/utils/errorUtils";

interface DirectDetailsSheetProps {
  conversationId: number;
  partner?: ConversationPartnerDto | null;
  displayName: string;
  avatarUrl?: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DirectDetailsSheet({
  conversationId,
  partner,
  displayName,
  avatarUrl,
  isOpen,
  onOpenChange,
}: DirectDetailsSheetProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMutualGroupsSheetOpen, setIsMutualGroupsSheetOpen] = useState(false);
  const [showSections, setShowSections] = useState({
    media: false,
    files: false,
    links: false,
    security: false,
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteConversation(conversationId);
    },
    onSuccess: () => {
      toast.success("Cuộc trò chuyện đã được ẩn.");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onOpenChange(false);
      router.push("/chat");
    },
    onError: (error) => {
      handleApiError(error, "Không thể ẩn cuộc trò chuyện");
      setIsDeleteDialogOpen(false);
    },
  });

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "?";
    }
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPresenceText = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "Đang hoạt động";
      case UserPresenceStatus.Busy:
        return "Bận";
      case UserPresenceStatus.Absent:
        return "Vắng mặt";
      case UserPresenceStatus.Offline:
      default:
        return "Không hoạt động";
    }
  };

  const getPresenceColor = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "text-green-500";
      case UserPresenceStatus.Busy:
        return "text-red-500";
      case UserPresenceStatus.Absent:
        return "text-yellow-500";
      case UserPresenceStatus.Offline:
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const handleCreateGroup = () => {
    // TODO: Navigate to create group with this user pre-selected
    toast.info("Tính năng tạo nhóm sẽ được triển khai sớm");
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled
        ? "Đã tắt thông báo cuộc trò chuyện"
        : "Đã bật thông báo cuộc trò chuyện"
    );
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    toast.success(
      isPinned ? "Đã bỏ ghim cuộc trò chuyện" : "Đã ghim cuộc trò chuyện"
    );
  };

  const toggleSection = (section: keyof typeof showSections) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
          <SheetHeader className="p-6 pb-4 flex-shrink-0">
            <SheetTitle className="text-center text-lg font-semibold">
              Thông tin hội thoại
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col space-y-6 px-6 pb-6">
              {/* User Profile Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-lg">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {displayName}
                    </h2>
                  </div>
                  {partner && (
                    <p
                      className={`text-sm mt-1 ${getPresenceColor(
                        partner.presenceStatus
                      )}`}
                    >
                      {getPresenceText(partner.presenceStatus)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={handleToggleNotifications}
                    >
                      {notificationsEnabled ? (
                        <BellOff className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </Button>
                    <span className="text-xs mt-1 text-center">
                      {notificationsEnabled ? "Tắt thông báo" : "Bật thông báo"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={handleTogglePin}
                    >
                      <Pin
                        className={`h-5 w-5 ${isPinned ? "text-blue-500" : ""}`}
                      />
                    </Button>
                    <span className="text-xs mt-1 text-center">
                      {isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={handleCreateGroup}
                    >
                      <Users className="h-5 w-5" />
                    </Button>
                    <span className="text-xs mt-1 text-center">
                      Tạo nhóm trò chuyện
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reminders Section */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() =>
                    toast.info("Tính năng nhắc nhẹ sẽ được triển khai sớm")
                  }
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">
                      Danh sách nhắc nhẹ
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Groups Section */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => setIsMutualGroupsSheetOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">
                      {partner?.mutualGroupsCount || 0} Nhóm chung
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Media & Files Sections */}
              <div className="space-y-1">
                {/* Photos/Videos */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => toggleSection("media")}
                >
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-medium">Ảnh/Video</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Files */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => toggleSection("files")}
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">File</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Links */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => toggleSection("links")}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Link</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Security Settings */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => toggleSection("security")}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Thiết lập bảo mật
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Warning & Danger Actions */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Ẩn cuộc trò chuyện
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ẩn cuộc trò chuyện này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ ẩn cuộc trò chuyện khỏi danh sách của bạn. Nó sẽ
              tự động xuất hiện trở lại nếu có tin nhắn mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang ẩn..." : "Đồng ý ẩn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mutual Groups Sheet */}
      {partner && (
        <MutualGroupsSheet
          partnerUserId={partner.userId}
          partnerFullName={displayName}
          isOpen={isMutualGroupsSheetOpen}
          onOpenChange={setIsMutualGroupsSheetOpen}
        />
      )}
    </>
  );
}
