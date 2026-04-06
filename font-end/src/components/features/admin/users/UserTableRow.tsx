"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminUserListItemDTO } from "@/types/admin/user.types";
import { UserActionsCell } from "./UserActionsCell";
import { formatDate } from "@/lib/utils/dateUtils";
import { Calendar } from "lucide-react";

interface UserTableRowProps {
  user: AdminUserListItemDTO;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onEdit?: (user: AdminUserListItemDTO) => void;
}

// Helper function to get user initials for avatar
const getUserInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Wrap the entire component in React.memo
export const UserTableRow = React.memo(
  ({ user, isSelected, onSelectionChange, onEdit }: UserTableRowProps) => {
    // This console log will now only fire for rows that *actually* change.
    console.log(`Rendering row for user: ${user.fullName}`);

    return (
      <TableRow>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            disabled={user.isCurrentUser}
            className={
              user.isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
            }
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getUserInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-2">
            {user.isDeleted ? (
              <Badge variant="destructive">Xóa mềm</Badge>
            ) : user.isActive ? (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                Đang hoạt động
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Vô hiệu hóa
              </Badge>
            )}
            {user.isCurrentUser && (
              <Badge
                variant="default"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              >
                Tài khoản hiện tại
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatDate(user.createdAt)}
          </div>
        </TableCell>
        <TableCell>
          <UserActionsCell user={user} onEdit={onEdit} />
        </TableCell>
      </TableRow>
    );
  }
);

UserTableRow.displayName = "UserTableRow"; // For better debugging in React DevTools
