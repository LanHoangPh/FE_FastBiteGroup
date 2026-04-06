"use client";

import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Trash2, Archive, RotateCcw, Eye } from "lucide-react";
import Link from "next/link";

import { GroupForListAdminDto } from "@/types/admin/group.types";
import {
  deleteAdminGroup,
  archiveAdminGroup,
  unarchiveAdminGroup,
  restoreAdminGroup,
} from "@/lib/api/admin/groups";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { handleApiError } from "@/lib/utils/errorUtils";

interface GroupActionsCellProps {
  group: GroupForListAdminDto;
}

export const GroupActionsCell = React.memo(
  ({ group }: GroupActionsCellProps) => {
    const queryClient = useQueryClient();

    // Dialog states
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

    // Mutations
    const archiveMutation = useMutation({
      mutationFn: () => archiveAdminGroup(group.groupId),
      onSuccess: () => {
        toast.success("Nhóm đã được lưu trữ thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        setIsArchiveDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi lưu trữ nhóm");
        setIsArchiveDialogOpen(false);
      },
    });

    const unarchiveMutation = useMutation({
      mutationFn: () => unarchiveAdminGroup(group.groupId),
      onSuccess: () => {
        toast.success("Nhóm đã được bỏ lưu trữ thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        setIsUnarchiveDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi bỏ lưu trữ nhóm");
        setIsUnarchiveDialogOpen(false);
      },
    });

    const deleteMutation = useMutation({
      mutationFn: () => deleteAdminGroup(group.groupId),
      onSuccess: () => {
        toast.success("Nhóm đã được xóa thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi xóa nhóm");
        setIsDeleteDialogOpen(false);
      },
    });

    const restoreMutation = useMutation({
      mutationFn: () => restoreAdminGroup(group.groupId),
      onSuccess: () => {
        toast.success("Nhóm đã được khôi phục thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
        setIsRestoreDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi khôi phục nhóm");
        setIsRestoreDialogOpen(false);
      },
    });

    const getActionTitle = (action: string) => {
      switch (action) {
        case "archive":
          return "Lưu trữ nhóm";
        case "unarchive":
          return "Bỏ lưu trữ nhóm";
        case "delete":
          return "Xóa nhóm";
        case "restore":
          return "Khôi phục nhóm";
        default:
          return "Thao tác";
      }
    };

    const getActionDescription = (action: string) => {
      switch (action) {
        case "archive":
          return `Bạn có chắc chắn muốn lưu trữ nhóm "${group.groupName}"? Nhóm sẽ không hiển thị trong danh sách chính.`;
        case "unarchive":
          return `Bạn có chắc chắn muốn bỏ lưu trữ nhóm "${group.groupName}"? Nhóm sẽ được hiển thị lại trong danh sách chính.`;
        case "delete":
          return `Bạn có chắc chắn muốn xóa nhóm "${group.groupName}"? Hành động này không thể hoàn tác.`;
        case "restore":
          return `Bạn có chắc chắn muốn khôi phục nhóm "${group.groupName}"? Nhóm sẽ được hiển thị lại trong danh sách chính.`;
        default:
          return "Bạn có chắc chắn muốn thực hiện hành động này?";
      }
    };

    const getActionButtonText = (action: string) => {
      switch (action) {
        case "archive":
          return "Lưu trữ";
        case "unarchive":
          return "Bỏ lưu trữ";
        case "delete":
          return "Xóa";
        case "restore":
          return "Khôi phục";
        default:
          return "Xác nhận";
      }
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/groups/${group.groupId}`}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </Link>
            </DropdownMenuItem>

            {!group.isArchived && !group.isDeleted && (
              <DropdownMenuItem onSelect={() => setIsArchiveDialogOpen(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Lưu trữ
              </DropdownMenuItem>
            )}

            {group.isArchived && !group.isDeleted && (
              <DropdownMenuItem onSelect={() => setIsUnarchiveDialogOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Bỏ lưu trữ
              </DropdownMenuItem>
            )}

            {!group.isDeleted && (
              <DropdownMenuItem
                onSelect={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}

            {group.isDeleted && (
              <DropdownMenuItem onSelect={() => setIsRestoreDialogOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Khôi phục
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Archive Dialog */}
        <AlertDialog
          open={isArchiveDialogOpen}
          onOpenChange={setIsArchiveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getActionTitle("archive")}</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("archive")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("archive")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unarchive Dialog */}
        <AlertDialog
          open={isUnarchiveDialogOpen}
          onOpenChange={setIsUnarchiveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getActionTitle("unarchive")}</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("unarchive")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => unarchiveMutation.mutate()}
                disabled={unarchiveMutation.isPending}
              >
                {unarchiveMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("unarchive")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getActionTitle("delete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("delete")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Restore Dialog */}
        <AlertDialog
          open={isRestoreDialogOpen}
          onOpenChange={setIsRestoreDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getActionTitle("restore")}</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("restore")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => restoreMutation.mutate()}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("restore")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

GroupActionsCell.displayName = "GroupActionsCell"; // For better debugging in React DevTools
