"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AdminAuditLogDto,
  AdminActionType,
  TargetEntityType,
} from "@/types/admin/audit-log.types";
import { formatDate } from "@/lib/utils/dateUtils";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditLogTableRowProps {
  log: AdminAuditLogDto;
}

// Helper function to get action type badge variant and color
const getActionTypeBadgeVariant = (actionType: AdminActionType) => {
  switch (actionType) {
    case AdminActionType.UserDeactivated:
    case AdminActionType.UserSoftDeleted:
    case AdminActionType.GroupSoftDeleted:
    case AdminActionType.PostSoftDeleted:
      return "destructive";
    case AdminActionType.UserReactivated:
    case AdminActionType.UserRestored:
    case AdminActionType.GroupRestored:
    case AdminActionType.PostRestored:
      return "default";
    case AdminActionType.UserCreatedByAdmin:
    case AdminActionType.GroupCreated:
    case AdminActionType.RoleCreated:
      return "default";
    case AdminActionType.UserUpdated:
    case AdminActionType.GroupUpdated:
    case AdminActionType.RoleUpdated:
    case AdminActionType.GroupSettingsChanged:
      return "secondary";
    case AdminActionType.SettingsUpdated:
      return "outline";
    default:
      return "secondary";
  }
};

// Helper function to get action type display name
const getActionTypeDisplayName = (actionType: AdminActionType) => {
  switch (actionType) {
    case AdminActionType.UserDeactivated:
      return "Vô hiệu hóa người dùng";
    case AdminActionType.UserReactivated:
      return "Kích hoạt lại người dùng";
    case AdminActionType.UserPasswordForcedReset:
      return "Đặt lại mật khẩu";
    case AdminActionType.GroupCreated:
      return "Tạo nhóm";
    case AdminActionType.GroupArchived:
      return "Lưu trữ nhóm";
    case AdminActionType.GroupUnarchived:
      return "Bỏ lưu trữ nhóm";
    case AdminActionType.GroupSoftDeleted:
      return "Xóa mềm nhóm";
    case AdminActionType.GroupRestored:
      return "Khôi phục nhóm";
    case AdminActionType.PostSoftDeleted:
      return "Xóa mềm bài viết";
    case AdminActionType.PostRestored:
      return "Khôi phục bài viết";
    case AdminActionType.UserSoftDeleted:
      return "Xóa mềm người dùng";
    case AdminActionType.UserRestored:
      return "Khôi phục người dùng";
    case AdminActionType.UserCreatedByAdmin:
      return "Tạo người dùng";
    case AdminActionType.UserUpdated:
      return "Cập nhật người dùng";
    case AdminActionType.RoleCreated:
      return "Tạo vai trò";
    case AdminActionType.RoleUpdated:
      return "Cập nhật vai trò";
    case AdminActionType.RoleDeleted:
      return "Xóa vai trò";
    case AdminActionType.SettingsUpdated:
      return "Cập nhật cài đặt";
    default:
      return actionType;
  }
};

// Helper function to get entity type display name
const getEntityTypeDisplayName = (entityType: TargetEntityType) => {
  switch (entityType) {
    case TargetEntityType.User:
      return "Người dùng";
    case TargetEntityType.Group:
      return "Nhóm";
    case TargetEntityType.Post:
      return "Bài viết";
    case TargetEntityType.Role:
      return "Vai trò";
    case TargetEntityType.Comment:
      return "Bình luận";
    case TargetEntityType.GroupMember:
      return "Thành viên nhóm";
    default:
      return entityType;
  }
};

// Wrap the entire component in React.memo
export const AuditLogTableRow = React.memo(({ log }: AuditLogTableRowProps) => {
  // This console log will now only fire for rows that *actually* change.
  console.log(`Rendering row for audit log: ${log.id}`);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        {/* <Link
          href={`/admin/users/${log.adminUserId}`}
          className="text-primary hover:underline"
        > */}
        {log.adminFullName}
        {/* </Link> */}
      </TableCell>
      <TableCell>
        <Badge variant={getActionTypeBadgeVariant(log.actionType)}>
          {getActionTypeDisplayName(log.actionType)}
        </Badge>
      </TableCell>
      <TableCell>
        <Link
          href={`/admin/${log.targetEntityType.toLowerCase()}/${
            log.targetEntityId
          }`}
          className="text-primary hover:underline"
        >
          {getEntityTypeDisplayName(log.targetEntityType)} -{" "}
          {log.targetEntityId}
        </Link>
      </TableCell>
      <TableCell>
        {log.batchId ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  {log.batchId.slice(0, 8)}...
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Batch ID: {log.batchId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>{formatDate(log.timestamp)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/audit-logs/${log.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

AuditLogTableRow.displayName = "AuditLogTableRow"; // For better debugging in React DevTools
