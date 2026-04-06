"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";

import {
  createUserByAdmin,
  updateUserBasicInfo,
  deactivateUser,
  activateUser,
  deleteUser,
  restoreUser,
  forcePasswordReset,
  bulkUserAction,
  exportUsersToExcel,
  getAdminUsers,
} from "@/lib/api/admin/users";
import { getAllRoles } from "@/lib/api/admin/roles";

import {
  AdminUserListItemDTO,
  BulkUserActionType,
  GetUsersAdminParams,
  UserWithVersion,
} from "@/types/admin/user.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils/errorUtils";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { ExportButton } from "@/components/shared/ExportButton";
import UsersTable from "./UsersTable";
import CreateUserDialog from "./dialogs/CreateUserDialog";
import EditUserDialog from "./dialogs/EditUserDialog";
import DeactivateUserDialog from "./dialogs/DeactivateUserDialog";
import ConfirmationDialog from "./dialogs/ConfirmationDialog";
import BulkDeactivateDialog from "./dialogs/BulkDeactivateDialog";
import BulkRoleDialog from "./dialogs/BulkRoleDialog";

/**
 * UserManagement Component
 *
 * Enhanced with improved state management to prevent UI blocking issues:
 * - Individual loading states for better UX
 * - Proper dialog state management to prevent conflicts
 * - Optimized query invalidation
 * - Cleanup effects to prevent memory leaks
 * - Non-blocking dialog close handlers
 */
export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItemDTO | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [isBulkDeactivateDialogOpen, setIsBulkDeactivateDialogOpen] =
    useState(false);
  const [isBulkRoleDialogOpen, setIsBulkRoleDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] =
    useState<BulkUserActionType | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsersWithVersions, setSelectedUsersWithVersions] = useState<
    UserWithVersion[]
  >([]);
  const [confirmationAction, setConfirmationAction] = useState<{
    title: string;
    description: string;
    action: () => void;
    variant?: "default" | "destructive";
  } | null>(null);
  const [currentFilters, setCurrentFilters] = useState<GetUsersAdminParams>({
    pageNumber: 1,
    pageSize: 10,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users data to check for current user
  const { data: usersData } = useQuery({
    queryKey: ["admin-users", currentFilters],
    queryFn: () => getAdminUsers(currentFilters),
    enabled: !!currentFilters,
  });

  // Cleanup effect to prevent state conflicts
  useEffect(() => {
    return () => {
      // Reset all states when component unmounts
      setSelectedUser(null);
      setSelectedUserIds([]);
      setBulkActionType(null);
      setConfirmationAction(null);
    };
  }, []);

  // Export functionality
  const handleExportUsers = useCallback(async () => {
    const exportParams = {
      ...currentFilters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    };
    return exportUsersToExcel(exportParams);
  }, [currentFilters]);

  // Fetch available roles for bulk actions
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUserByAdmin,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo người dùng mới thành công.",
        variant: "success",
      });
      setIsCreateDialogOpen(false);
      // Optimize query invalidation
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
        exact: false,
      });
    },
    onError: (error) => {
      handleApiError(error);
      // Don't close dialog on error to allow user to retry
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateUserBasicInfo(userId, {
        ...data,
        rowVersion: selectedUser?.rowVersion || "",
      }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng thành công.",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      // Optimize query invalidation
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail"],
        exact: false,
      });
    },
    onError: (error) => {
      handleApiError(error);
      // Don't close dialog on error to allow user to retry
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      deactivateUser(userId, data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã vô hiệu hóa người dùng thành công.",
        variant: "success",
      });
      setIsDeactivateDialogOpen(false);
      setSelectedUser(null);
      // Optimize query invalidation
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-user-detail"],
        exact: false,
      });
    },
    onError: (error) => {
      handleApiError(error);
      // Don't close dialog on error to allow user to retry
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: ({
      userId,
      rowVersion,
    }: {
      userId: string;
      rowVersion: string;
    }) => activateUser(userId, { rowVersion }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã kích hoạt người dùng thành công.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail"] });
    },
    onError: (error) => handleApiError(error),
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({
      userId,
      rowVersion,
    }: {
      userId: string;
      rowVersion: string;
    }) => deleteUser(userId, { rowVersion }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => handleApiError(error),
  });

  const restoreUserMutation = useMutation({
    mutationFn: ({
      userId,
      rowVersion,
    }: {
      userId: string;
      rowVersion: string;
    }) => restoreUser(userId, { rowVersion }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã khôi phục người dùng thành công.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => handleApiError(error),
  });

  const forcePasswordResetMutation = useMutation({
    mutationFn: forcePasswordReset,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu đặt lại mật khẩu thành công.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => handleApiError(error),
  });

  const bulkActionMutation = useMutation({
    mutationFn: bulkUserAction,
    onSuccess: () => {
      toast({
        title: "Yêu cầu đã được gửi",
        description: "Hành động hàng loạt đang được xử lý trong nền.",
        variant: "info",
      });
      // Reset all bulk action states
      setSelectedUserIds([]);
      setSelectedUsersWithVersions([]);
      setBulkActionType(null);
      setIsBulkDeactivateDialogOpen(false);
      setIsBulkRoleDialogOpen(false);
      setIsConfirmationDialogOpen(false);
      setConfirmationAction(null);
      // Optimize query invalidation
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
        exact: false,
      });
    },
    onError: (error) => {
      handleApiError(error, "Hành động hàng loạt thất bại");
      // Reset bulk action states on error
      setBulkActionType(null);
      setIsBulkDeactivateDialogOpen(false);
      setIsBulkRoleDialogOpen(false);
    },
  });

  // Event handlers
  const handleEditUser = (user: AdminUserListItemDTO) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeactivateUser = (user: AdminUserListItemDTO) => {
    setSelectedUser(user);
    setIsDeactivateDialogOpen(true);
  };

  // Bulk action handlers
  const handleBulkAction = (
    action: BulkUserActionType,
    users: UserWithVersion[]
  ) => {
    // Filter out current user from the selection
    const filteredUsers = users.filter((user) => {
      const fullUser = usersData?.data?.items.find(
        (u: AdminUserListItemDTO) => u.userId === user.userId
      );
      return !fullUser?.isCurrentUser;
    });

    // If no users left after filtering, show a message and return
    if (filteredUsers.length === 0) {
      toast({
        title: "Không thể thực hiện hành động",
        description: "Không thể thực hiện hành động trên tài khoản hiện tại.",
        variant: "warning",
      });
      return;
    }

    // Show warning if some users were filtered out
    if (filteredUsers.length < users.length) {
      toast({
        title: "Đã loại bỏ tài khoản hiện tại",
        description:
          "Không thể thực hiện hành động trên tài khoản hiện tại của bạn.",
        variant: "warning",
      });
    }

    setBulkActionType(action);
    setSelectedUsersWithVersions(filteredUsers);
    setSelectedUserIds(filteredUsers.map((user) => user.userId));

    switch (action) {
      case "Activate":
      case "SoftDelete":
      case "Restore":
        // Simple actions - show confirmation dialog
        setConfirmationAction({
          title: `Hành động hàng loạt: ${getBulkActionTitle(action)}`,
          description: `Bạn có chắc chắn muốn ${getBulkActionDescription(
            action
          )} cho ${users.length} người dùng đã chọn?`,
          action: () => executeBulkAction(action, users),
        });
        setIsConfirmationDialogOpen(true);
        break;
      case "Deactivate":
        setIsBulkDeactivateDialogOpen(true);
        break;
      case "AssignRole":
        setBulkActionType("AssignRole");
        setIsBulkRoleDialogOpen(true);
        break;
    }
  };

  const executeBulkAction = (
    action: BulkUserActionType,
    users: UserWithVersion[],
    additionalData?: any
  ) => {
    const requestData = {
      action,
      users,
      ...additionalData,
    };
    bulkActionMutation.mutate(requestData);
  };

  const getBulkActionTitle = (action: BulkUserActionType): string => {
    switch (action) {
      case "Activate":
        return "Kích hoạt";
      case "Deactivate":
        return "Vô hiệu hóa";
      case "SoftDelete":
        return "Xóa mềm";
      case "Restore":
        return "Khôi phục";
      case "AssignRole":
        return "Gán vai trò";
      default:
        return action;
    }
  };

  const getBulkActionDescription = (action: BulkUserActionType): string => {
    switch (action) {
      case "Activate":
        return "kích hoạt";
      case "Deactivate":
        return "vô hiệu hóa";
      case "SoftDelete":
        return "xóa mềm";
      case "Restore":
        return "khôi phục";
      case "AssignRole":
        return "gán vai trò";
      default:
        return action;
    }
  };

  const handleBulkDeactivateConfirm = (data: {
    reasonCategory: string;
    reasonDetails?: string;
  }) => {
    executeBulkAction("Deactivate", selectedUsersWithVersions, {
      reasonCategory: data.reasonCategory,
      reasonDetails: data.reasonDetails,
    });
    // Dialog will be closed in mutation success/error handlers
  };

  const handleBulkRoleConfirm = (data: { roleName: string }) => {
    if (bulkActionType === "AssignRole") {
      executeBulkAction(bulkActionType, selectedUsersWithVersions, {
        roleName: data.roleName,
      });
      // Dialog will be closed in mutation success/error handlers
    }
  };

  const handleCreateUser = (data: any) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: any) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.userId, data });
    }
  };

  const handleDeactivateUserConfirm = (data: any) => {
    if (selectedUser) {
      deactivateUserMutation.mutate({ userId: selectedUser.userId, data });
    }
  };

  // Individual loading states for better UX
  const isCreateLoading = createUserMutation.isPending;
  const isUpdateLoading = updateUserMutation.isPending;
  const isDeactivateLoading = deactivateUserMutation.isPending;
  const isActivateLoading = activateUserMutation.isPending;
  const isDeleteLoading = deleteUserMutation.isPending;
  const isRestoreLoading = restoreUserMutation.isPending;
  const isPasswordResetLoading = forcePasswordResetMutation.isPending;
  const isBulkActionLoading = bulkActionMutation.isPending;

  // Global loading state only for critical operations
  const isGlobalLoading =
    isCreateLoading || isUpdateLoading || isDeactivateLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        icon={Users}
        title="Quản lý người dùng"
        description="Quản lý tài khoản người dùng, vai trò và quyền hạn trong hệ thống"
      >
        <ExportButton onExport={handleExportUsers} />
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isGlobalLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo người dùng mới
        </Button>
      </AdminPageHeader>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách người dùng
          </CardTitle>
          <CardDescription>
            Quản lý tất cả người dùng trong hệ thống với các tính năng tìm kiếm,
            lọc và hành động hàng loạt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            onBulkAction={handleBulkAction}
            selectedUserIds={selectedUserIds}
            onFiltersChange={setCurrentFilters}
            onEdit={(user) => {
              setSelectedUser(user);
              setIsEditDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          if (!isCreateLoading) {
            setIsCreateDialogOpen(false);
          }
        }}
        onSubmit={handleCreateUser}
        isLoading={isCreateLoading}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          if (!isUpdateLoading) {
            setIsEditDialogOpen(false);
            setSelectedUser(null);
          }
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        isLoading={isUpdateLoading}
      />

      {/* Deactivate User Dialog */}
      <DeactivateUserDialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => {
          if (!isDeactivateLoading) {
            setIsDeactivateDialogOpen(false);
            setSelectedUser(null);
          }
        }}
        onSubmit={handleDeactivateUserConfirm}
        user={selectedUser}
        isLoading={isDeactivateLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => {
          if (
            !isActivateLoading &&
            !isDeleteLoading &&
            !isRestoreLoading &&
            !isPasswordResetLoading &&
            !isBulkActionLoading
          ) {
            setIsConfirmationDialogOpen(false);
            setConfirmationAction(null);
          }
        }}
        onConfirm={() => {
          if (confirmationAction) {
            confirmationAction.action();
            setIsConfirmationDialogOpen(false);
            setConfirmationAction(null);
          }
        }}
        title={confirmationAction?.title || ""}
        description={confirmationAction?.description || ""}
        variant={confirmationAction?.variant || "default"}
        isLoading={
          isActivateLoading ||
          isDeleteLoading ||
          isRestoreLoading ||
          isPasswordResetLoading ||
          isBulkActionLoading
        }
      />

      {/* Bulk Deactivate Dialog */}
      <BulkDeactivateDialog
        isOpen={isBulkDeactivateDialogOpen}
        onClose={() => {
          if (!isBulkActionLoading) {
            setIsBulkDeactivateDialogOpen(false);
          }
        }}
        onConfirm={handleBulkDeactivateConfirm}
        selectedCount={selectedUserIds.length}
        isLoading={isBulkActionLoading}
      />

      {/* Bulk Role Dialog */}
      <BulkRoleDialog
        isOpen={isBulkRoleDialogOpen}
        onClose={() => {
          if (!isBulkActionLoading) {
            setIsBulkRoleDialogOpen(false);
          }
        }}
        onConfirm={handleBulkRoleConfirm}
        selectedCount={selectedUserIds.length}
        roles={rolesData?.data || []}
        isLoading={isBulkActionLoading}
      />
    </div>
  );
}
