"use client";

import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Trash2,
  UserX,
  UserCheck,
  RotateCcw,
  Eye,
  Shield,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AdminUserListItemDTO } from "@/types/admin/user.types";
import {
  deactivateUser,
  activateUser,
  deleteUser,
  restoreUser,
  forcePasswordReset,
} from "@/lib/api/admin/users";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError } from "@/lib/utils/errorUtils";

// Schema for deactivate user form
const deactivateUserSchema = z.object({
  reasonCategory: z.string().min(1, { message: "Vui lòng chọn lý do." }),
  reasonDetails: z.string().optional(),
});

type DeactivateUserFormData = z.infer<typeof deactivateUserSchema>;

// Reason categories for deactivation
const REASON_CATEGORIES = [
  { value: "Spam", label: "Spam" },
  { value: "Harassment", label: "Quấy rối" },
  { value: "PolicyViolation", label: "Vi phạm chính sách" },
  { value: "InappropriateContent", label: "Nội dung không phù hợp" },
  { value: "Other", label: "Khác" },
];

interface UserActionsCellProps {
  user: AdminUserListItemDTO;
  onEdit?: (user: AdminUserListItemDTO) => void;
}

export const UserActionsCell = React.memo(
  ({ user, onEdit }: UserActionsCellProps) => {
    const queryClient = useQueryClient();

    // Dialog states
    const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] =
      useState(false);

    // Form for deactivate user
    const deactivateForm = useForm<DeactivateUserFormData>({
      resolver: zodResolver(deactivateUserSchema),
      defaultValues: {
        reasonCategory: "",
        reasonDetails: "",
      },
    });

    // Mutations
    const activateMutation = useMutation({
      mutationFn: () =>
        activateUser(user.userId, { rowVersion: user.rowVersion }),
      onSuccess: () => {
        toast.success("Người dùng đã được kích hoạt thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        setIsActivateDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error);
        setIsActivateDialogOpen(false);
      },
    });

    const deactivateMutation = useMutation({
      mutationFn: (data: DeactivateUserFormData) =>
        deactivateUser(user.userId, { ...data, rowVersion: user.rowVersion }),
      onSuccess: () => {
        toast.success("Người dùng đã được vô hiệu hóa thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        setIsDeactivateDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi vô hiệu hóa người dùng");
        setIsDeactivateDialogOpen(false);
      },
    });

    const deleteMutation = useMutation({
      mutationFn: () =>
        deleteUser(user.userId, { rowVersion: user.rowVersion }),
      onSuccess: () => {
        toast.success("Người dùng đã được xóa thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error);
        setIsDeleteDialogOpen(false);
      },
    });

    const restoreMutation = useMutation({
      mutationFn: () =>
        restoreUser(user.userId, { rowVersion: user.rowVersion }),
      onSuccess: () => {
        toast.success("Người dùng đã được khôi phục thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        setIsRestoreDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi khôi phục người dùng");
        setIsRestoreDialogOpen(false);
      },
    });

    const passwordResetMutation = useMutation({
      mutationFn: () => forcePasswordReset(user.userId),
      onSuccess: () => {
        toast.success("Yêu cầu đặt lại mật khẩu đã được gửi thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        setIsPasswordResetDialogOpen(false);
      },
      onError: (error) => {
        handleApiError(error, "Lỗi khi đặt lại mật khẩu");
        setIsPasswordResetDialogOpen(false);
      },
    });

    const getActionTitle = (action: string) => {
      switch (action) {
        case "activate":
          return "Kích hoạt người dùng";
        case "deactivate":
          return "Vô hiệu hóa người dùng";
        case "delete":
          return "Xóa người dùng";
        case "restore":
          return "Khôi phục người dùng";
        case "passwordReset":
          return "Đặt lại mật khẩu";
        default:
          return "Thao tác";
      }
    };

    const getActionDescription = (action: string) => {
      switch (action) {
        case "activate":
          return `Bạn có chắc chắn muốn kích hoạt người dùng "${user.fullName}"? Người dùng sẽ có thể đăng nhập lại vào hệ thống.`;
        case "deactivate":
          return `Bạn có chắc chắn muốn vô hiệu hóa người dùng "${user.fullName}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`;
        case "delete":
          return `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`;
        case "restore":
          return `Bạn có chắc chắn muốn khôi phục người dùng "${user.fullName}"? Người dùng sẽ được hiển thị lại trong danh sách chính.`;
        case "passwordReset":
          return `Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng "${user.fullName}"? Người dùng sẽ nhận được email hướng dẫn đặt lại mật khẩu.`;
        default:
          return "Bạn có chắc chắn muốn thực hiện hành động này?";
      }
    };

    const getActionButtonText = (action: string) => {
      switch (action) {
        case "activate":
          return "Kích hoạt";
        case "deactivate":
          return "Vô hiệu hóa";
        case "delete":
          return "Xóa";
        case "restore":
          return "Khôi phục";
        case "passwordReset":
          return "Đặt lại mật khẩu";
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
            {/* Edit User - Only show if not current user and user is active */}
            {!user.isCurrentUser &&
              user.isActive &&
              !user.isDeleted &&
              onEdit && (
                <DropdownMenuItem onSelect={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa thông tin
                </DropdownMenuItem>
              )}

            <DropdownMenuItem
              asChild
              disabled={user.isCurrentUser}
              className={
                user.isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              <Link
                href={user.isCurrentUser ? "#" : `/admin/users/${user.userId}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                {user.isCurrentUser
                  ? "Không thể xem chi tiết (người dùng hiện tại)"
                  : "Xem chi tiết"}
              </Link>
            </DropdownMenuItem>

            {!user.isDeleted && !user.isCurrentUser && (
              <>
                {user.isActive ? (
                  <DropdownMenuItem
                    onSelect={() => setIsDeactivateDialogOpen(true)}
                    className="text-warning"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Vô hiệu hóa
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => setIsActivateDialogOpen(true)}
                    className="text-success"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onSelect={() => setIsPasswordResetDialogOpen(true)}
                  className="text-blue-600"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Đặt lại mật khẩu
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </>
            )}

            {user.isDeleted && (
              <DropdownMenuItem onSelect={() => setIsRestoreDialogOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Khôi phục
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Activate Dialog */}
        <AlertDialog
          open={isActivateDialogOpen}
          onOpenChange={setIsActivateDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getActionTitle("activate")}</AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("activate")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {activateMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("activate")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deactivate Dialog */}
        <Dialog
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{getActionTitle("deactivate")}</DialogTitle>
              <DialogDescription>
                {getActionDescription("deactivate")}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={deactivateForm.handleSubmit((data) =>
                deactivateMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Lý do vô hiệu hóa *
                </label>
                <Select
                  value={deactivateForm.watch("reasonCategory")}
                  onValueChange={(value) =>
                    deactivateForm.setValue("reasonCategory", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do vô hiệu hóa" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {deactivateForm.formState.errors.reasonCategory && (
                  <p className="text-sm text-destructive">
                    {deactivateForm.formState.errors.reasonCategory.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Chi tiết bổ sung (tùy chọn)
                </label>
                <Textarea
                  placeholder="Mô tả chi tiết lý do vô hiệu hóa..."
                  {...deactivateForm.register("reasonDetails")}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeactivateDialogOpen(false)}
                  disabled={deactivateMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                  disabled={deactivateMutation.isPending}
                >
                  {deactivateMutation.isPending
                    ? "Đang xử lý..."
                    : getActionButtonText("deactivate")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {restoreMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("restore")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Password Reset Dialog */}
        <AlertDialog
          open={isPasswordResetDialogOpen}
          onOpenChange={setIsPasswordResetDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {getActionTitle("passwordReset")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {getActionDescription("passwordReset")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => passwordResetMutation.mutate()}
                disabled={passwordResetMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {passwordResetMutation.isPending
                  ? "Đang xử lý..."
                  : getActionButtonText("passwordReset")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

UserActionsCell.displayName = "UserActionsCell"; // For better debugging in React DevTools
