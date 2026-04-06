"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { deleteRole } from "@/lib/api/admin/roles";
import { handleApiError } from "@/lib/utils/errorUtils";
import { RoleDto } from "@/types/admin/role.types";
import { toast } from "sonner";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { RoleDialog } from "./RoleDialog";
import { RoleTableRow } from "./RoleTableRow";
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

interface RolesTableProps {
  roles: RoleDto[];
  isLoading: boolean;
}

export function RolesTable({ roles, isLoading }: RolesTableProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Thành công", {
        description: "Vai trò đã được xóa.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      // Check for specific error code
      if (
        error?.response?.data?.errors?.some(
          (e: any) => e.errorCode === "ROLE_IN_USE"
        )
      ) {
        toast.error("Không thể xóa vai trò", {
          description: "Vai trò này đang được gán cho người dùng.",
        });
      } else {
        handleApiError(error, "Xóa vai trò thất bại");
      }
    },
  });

  // Handle edit button click - STABILIZED WITH useCallback
  const handleEdit = useCallback((role: RoleDto) => {
    // Prevent editing of system roles
    if (role.isSystemRole) {
      toast.error("Không thể sửa vai trò hệ thống", {
        description: "Vai trò hệ thống được bảo vệ và không thể sửa.",
      });
      return;
    }
    setSelectedRole(role);
    setEditDialogOpen(true);
  }, []);

  // Handle delete button click - STABILIZED WITH useCallback
  const handleDelete = useCallback((role: RoleDto) => {
    // Prevent deletion of system roles
    if (role.isSystemRole) {
      toast.error("Không thể xóa vai trò hệ thống", {
        description: "Vai trò hệ thống được bảo vệ và không thể xóa.",
      });
      return;
    }
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  }, []);

  // Handle confirm delete - STABILIZED WITH useCallback
  const handleConfirmDelete = useCallback(() => {
    if (selectedRole && !selectedRole.isSystemRole) {
      deleteMutation.mutate(selectedRole.id);
    }
  }, [selectedRole, deleteMutation]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground font-medium">
                Tên vai trò
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Số người dùng
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Loại
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Chưa có vai trò nào.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <RoleTableRow
                  key={role.id}
                  role={role}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <RoleDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          mode="edit"
          role={selectedRole}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa vai trò
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò{" "}
              <span className="font-semibold">'{selectedRole?.name}'</span>?
              <br />
              <span className="text-destructive font-medium">
                ⚠️ Hành động này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
