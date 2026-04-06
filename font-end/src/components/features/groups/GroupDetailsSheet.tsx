"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  UserPlus,
  Users,
  ChevronRight,
  Trash2,
  LogOut,
  Link as FileEdit,
  Archive,
  Globe,
  Lock,
  Mail,
  Link,
  Shield,
} from "lucide-react";

import {
  getGroupDetails,
  leaveGroup,
  deleteGroup,
  archiveGroup,
  unarchiveGroup,
} from "@/lib/api/customer/groups";
import { GroupRole, EnumGroupPrivacy, GroupType } from "@/types/customer/group";
import { AddMemberModal } from "./AddMemberModal";
import { GroupMembersSheet } from "./GroupMembersSheet";
import { TransferOwnershipModal } from "./TransferOwnershipModal";
import { EditGroupModal } from "./EditGroupModal";
import { InviteMembersModal } from "./InviteMembersModal";
import { CreateInviteLinkModal } from "./CreateInviteLinkModal";
import { SentInvitationsModal } from "../invitations/SentInvitationsModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleApiError } from "@/lib/utils/errorUtils";

interface GroupDetailsSheetProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function GroupDetailsSheet({
  groupId,
  isOpen,
  onOpenChange,
}: GroupDetailsSheetProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isMembersSheetOpen, setIsMembersSheetOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isSentInvitationsModalOpen, setIsSentInvitationsModalOpen] =
    useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: group,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groupDetails", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: isOpen && !!groupId, // Only fetch when the sheet is open
  });

  // Leave group mutation
  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      toast.success("Bạn đã rời khỏi nhóm.");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      onOpenChange(false);
      router.push("/chat");
    },
    onError: (error) => {
      // Check for specific error code indicating last admin
      const axiosError = error as {
        response?: { data?: { errors?: Array<{ errorCode?: string }> } };
      };
      const errorCode = axiosError.response?.data?.errors?.[0]?.errorCode;

      if (errorCode === "LAST_ADMIN_LEAVE_ATTEMPT") {
        // Don't show error toast, open transfer modal instead
        setIsTransferModalOpen(true);
      } else {
        handleApiError(error, "Không thể rời nhóm");
      }
    },
  });

  // Archive group mutation
  const archiveMutation = useMutation({
    mutationFn: () => archiveGroup(groupId),
    onSuccess: () => {
      toast.success("Nhóm đã được lưu trữ.");
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      setIsArchiveDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error, "Không thể lưu trữ nhóm");
      setIsArchiveDialogOpen(false);
    },
  });

  // Unarchive group mutation
  const unarchiveMutation = useMutation({
    mutationFn: () => unarchiveGroup(groupId),
    onSuccess: () => {
      toast.success("Nhóm đã được khôi phục.");
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      setIsUnarchiveDialogOpen(false);
    },
    onError: (error) => {
      handleApiError(error, "Không thể khôi phục nhóm");
      setIsUnarchiveDialogOpen(false);
    },
  });

  // Delete group mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      toast.success("Nhóm đã được xóa vĩnh viễn.");
      // Invalidate all queries that might contain this group
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["publicGroups"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      // Close the sheet and redirect the user away from the deleted page
      onOpenChange(false);
      router.push("/discover");
    },
    onError: (error) => {
      handleApiError(error, "Không thể xóa nhóm");
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

  const handleCopyLink = () => {
    const groupLink = `talo.me/g/nhom${groupId}`;
    navigator.clipboard.writeText(groupLink);
    toast.success("Đã sao chép link nhóm");
  };

  const handleShareLink = () => {
    const groupLink = `talo.me/g/nhom${groupId}`;
    if (navigator.share) {
      navigator.share({
        title: group?.groupName || "Nhóm chat",
        url: groupLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleOpenAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleOpenMembersSheet = () => {
    setIsMembersSheetOpen(true);
  };

  const handleCloseMembersSheet = () => {
    setIsMembersSheetOpen(false);
  };

  const handleLeaveGroup = () => {
    setIsLeaveDialogOpen(true);
  };

  const handleLeaveConfirmed = () => {
    setIsLeaveDialogOpen(false);
    leaveMutation.mutate();
  };

  const handleEditGroup = () => {
    setIsEditModalOpen(true);
  };

  const handleInviteMembers = () => {
    setIsInviteModalOpen(true);
  };

  const handleCreateInviteLink = () => {
    setIsCreateLinkModalOpen(true);
  };

  const handleViewSentInvitations = () => {
    setIsSentInvitationsModalOpen(true);
  };

  const handleContentModeration = () => {
    onOpenChange(false); // Close the sheet
    router.push(`/groups/${groupId}/moderation`);
  };

  const handleArchiveGroup = () => {
    if (group?.isArchived) {
      // If group is archived, show unarchive confirmation
      setIsUnarchiveDialogOpen(true);
    } else {
      // If group is not archived, show archive confirmation
      setIsArchiveDialogOpen(true);
    }
  };

  const handleArchiveConfirmed = () => {
    setIsArchiveDialogOpen(false);
    archiveMutation.mutate();
  };

  const handleUnarchiveConfirmed = () => {
    setIsUnarchiveDialogOpen(false);
    unarchiveMutation.mutate();
  };

  const handleDeleteGroup = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md p-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-center text-lg font-semibold">
                Thông tin nhóm
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {isLoading ? (
              <DetailsSkeleton />
            ) : isError || !group ? (
              <p className="text-red-500 text-center">
                Không thể tải thông tin nhóm.
              </p>
            ) : (
              <>
                {/* Group Avatar and Name */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={group.groupAvatarUrl} />
                      <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-lg">
                        {getInitials(group.groupName)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gray-600 text-white text-xs"
                    >
                      {group.memberCount}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {group.groupName}
                      </h2>
                      {/* <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 italic">
                        {group.description}
                      </h4>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                      {/* Archived Status */}
                      {group.isArchived && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          Đã lưu trữ
                        </Badge>
                      )}

                      {/* Privacy Status */}
                      <Badge
                        variant={
                          group.privacy === EnumGroupPrivacy.Public
                            ? "default"
                            : "secondary"
                        }
                        className={
                          group.privacy === EnumGroupPrivacy.Public
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }
                      >
                        {group.privacy === EnumGroupPrivacy.Public ? (
                          <>
                            <Globe className="mr-1 h-3 w-3" />
                            Nhóm công khai
                          </>
                        ) : (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Nhóm riêng tư
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={() =>
                          setNotificationsEnabled(!notificationsEnabled)
                        }
                      >
                        {notificationsEnabled ? (
                          <BellOff className="h-5 w-5" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </Button>
                      <span className="text-xs mt-1 text-center">
                        {notificationsEnabled
                          ? "Tắt thông báo"
                          : "Bật thông báo"}
                      </span>
                    </div>
                    {group.canInviteMembers && (
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={handleOpenAddMemberModal}
                          disabled={group.isArchived}
                        >
                          <UserPlus className="h-5 w-5" />
                        </Button>
                        <span className="text-xs mt-1 text-center">
                          Thêm thành viên
                        </span>
                      </div>
                    )}

                    {group.canInviteMembers && (
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={handleInviteMembers}
                          disabled={group.isArchived}
                        >
                          <Mail className="h-5 w-5" />
                        </Button>
                        <span className="text-xs mt-1 text-center">
                          Mời thành viên
                        </span>
                      </div>
                    )}

                    {group.canArchive && (
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={handleViewSentInvitations}
                          disabled={group.isArchived}
                        >
                          <Users className="h-5 w-5" />
                        </Button>
                        <span className="text-xs mt-1 text-center">
                          Quản lý lời mời đã gửi
                        </span>
                      </div>
                    )}

                    {group.canEdit && (
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={handleEditGroup}
                          disabled={group.isArchived}
                        >
                          <FileEdit className="h-5 w-5" />
                        </Button>
                        <span className="text-xs mt-1 text-center">
                          Sửa thông tin
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Management Actions
                {(group.currentUserRole === GroupRole.Admin || group.currentUserRole === GroupRole.Moderator) && (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={handleContentModeration}
                      disabled={group.isArchived}
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">
                          Kiểm duyệt nội dung
                        </span>
                      </div>
                    </Button>
                  </div>
                )} */}

                {group.canArchive && (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={handleArchiveGroup}
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium">
                          {group.isArchived ? "Khôi phục nhóm" : "Lưu trữ nhóm"}
                        </span>
                      </div>
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Group Members Section */}
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={handleOpenMembersSheet}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">
                        Thành viên ({group.memberCount})
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                {/* Group Link */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Link tham gia nhóm
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateInviteLink}
                      disabled={group.isArchived}
                      className="flex items-center gap-2"
                    >
                      <Link className="h-4 w-4" />
                      Tạo link mời
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Media & Files Sections */}
                <div className="space-y-1">
                  {[
                    {
                      label: "Bảng tin nhóm",
                      icon: ChevronRight,
                      color: "text-purple-500",
                    },
                    {
                      label: "Ảnh/Video",
                      icon: ChevronRight,
                      color: "text-pink-500",
                    },
                    {
                      label: "File",
                      icon: ChevronRight,
                      color: "text-blue-500",
                    },
                    {
                      label: "Link",
                      icon: ChevronRight,
                      color: "text-green-500",
                    },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <Separator />

                {/* Danger Zone */}
                <div className="space-y-3 pb-6">
                  {group.canDelete && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950"
                      onClick={handleDeleteGroup}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {group.groupType === GroupType.Chat
                            ? "Xóa lịch sử trò chuyện"
                            : "Xóa nhóm vĩnh viễn"}
                        </span>
                      </div>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={handleLeaveGroup}
                    className="w-full justify-start p-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-medium">Rời nhóm</span>
                    </div>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {group && (
          <AddMemberModal
            isOpen={isAddMemberModalOpen}
            onClose={handleCloseAddMemberModal}
            groupId={groupId}
            groupName={group.groupName}
          />
        )}

        {/* Group Members Sheet */}
        {group && (
          <GroupMembersSheet
            isOpen={isMembersSheetOpen}
            onOpenChange={setIsMembersSheetOpen}
            groupId={groupId}
            groupName={group.groupName}
            memberCount={group.memberCount}
            currentUserRole={GroupRole.Member}
          />
        )}

        {/* Leave Group Confirmation Dialog */}
        <AlertDialog
          open={isLeaveDialogOpen}
          onOpenChange={setIsLeaveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận rời nhóm</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn rời khỏi nhóm này? Hành động này không thể
                hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeaveConfirmed}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? "Đang rời..." : "Rời nhóm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Transfer Ownership Modal */}
        <TransferOwnershipModal
          groupId={groupId}
          isOpen={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
        />

        {/* Invite Members Modal */}
        {group && (
          <InviteMembersModal
            isOpen={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
            groupId={groupId}
            groupName={group.groupName}
          />
        )}

        {/* Create Invite Link Modal */}
        {group && (
          <CreateInviteLinkModal
            isOpen={isCreateLinkModalOpen}
            onOpenChange={setIsCreateLinkModalOpen}
            groupId={groupId}
            groupName={group.groupName}
          />
        )}

        {/* Sent Invitations Modal */}
        <SentInvitationsModal
          groupId={groupId}
          isOpen={isSentInvitationsModalOpen}
          onOpenChange={setIsSentInvitationsModalOpen}
        />

        {/* Edit Group Modal */}
        {group && (
          <EditGroupModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            group={group}
          />
        )}

        {/* Archive Group Confirmation Dialog */}
        <AlertDialog
          open={isArchiveDialogOpen}
          onOpenChange={setIsArchiveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Lưu trữ nhóm</AlertDialogTitle>
              <AlertDialogDescription>
                Khi lưu trữ nhóm, bạn chỉ ở chế độ xem và không thể thực hiện
                bất kỳ hành động nào. Bạn có chắc chắn muốn lưu trữ nhóm này
                không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchiveConfirmed}
                disabled={archiveMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {archiveMutation.isPending ? "Đang lưu trữ..." : "Lưu trữ nhóm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unarchive Group Confirmation Dialog */}
        <AlertDialog
          open={isUnarchiveDialogOpen}
          onOpenChange={setIsUnarchiveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Khôi phục nhóm</AlertDialogTitle>
              <AlertDialogDescription>
                Khi khôi phục nhóm, bạn sẽ có thể thực hiện mọi hành động như
                bình thường. Bạn có chắc chắn muốn khôi phục nhóm này không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnarchiveConfirmed}
                disabled={unarchiveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {unarchiveMutation.isPending
                  ? "Đang khôi phục..."
                  : "Khôi phục nhóm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Group Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Toàn bộ dữ liệu và thành viên
                của nhóm sẽ bị xóa vĩnh viễn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirmed}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending
                  ? "Đang xóa..."
                  : "Tôi hiểu, Xóa nhóm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 flex flex-col items-center">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
