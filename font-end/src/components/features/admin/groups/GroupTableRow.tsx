"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GroupForListAdminDto } from "@/types/admin/group.types";
import { GroupActionsCell } from "./GroupActionsCell";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { Users, FileText, Calendar, Clock } from "lucide-react";

interface GroupTableRowProps {
  group: GroupForListAdminDto;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
}

// Helper function to get group type badge color
const getGroupTypeBadgeVariant = (groupType: string) => {
  switch (groupType) {
    case "Public":
      return "default";
    case "Private":
      return "secondary";
    case "Community":
      return "outline";
    default:
      return "default";
  }
};
const getGroupPrivacyBadgeVariant = (privacy: string) => {
  switch (privacy) {
    case "Public":
      return "default";
    case "Private":
      return "secondary";
  }
};
const getGroupPrivacyDisplayName = (privacy: string) => {
  switch (privacy) {
    case "Public":
      return "Công khai";
    case "Private":
      return "Riêng tư";
  }
};

// Helper function to get group type display name
const getGroupTypeDisplayName = (groupType: string) => {
  switch (groupType) {
    case "Public":
      return "Công khai";
    case "Private":
      return "Riêng tư";
    case "Community":
      return "Cộng đồng";
    default:
      return groupType;
  }
};

// Wrap the entire component in React.memo
export const GroupTableRow = React.memo(
  ({ group, isSelected, onSelectionChange }: GroupTableRowProps) => {
    // This console log will now only fire for rows that *actually* change.
    console.log(`Rendering row for group: ${group.groupName}`);

    return (
      <TableRow
        className={cn("hover:bg-muted/50", group.isDeleted && "opacity-50")}
      >
        <TableCell>
          <Checkbox checked={isSelected} onCheckedChange={onSelectionChange} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/groups/${group.groupId}`}
              className="font-medium text-primary hover:underline"
            >
              {group.groupName}
            </Link>
            {group.pendingReportsCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                🚩 {group.pendingReportsCount} Báo cáo
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getGroupTypeBadgeVariant(group.groupType)}>
            {getGroupTypeDisplayName(group.groupType)}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={getGroupPrivacyBadgeVariant(group.privacy)}>
            {getGroupPrivacyDisplayName(group.privacy)}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-2">
            {group.isDeleted ? (
              <Badge variant="destructive">Xóa mềm</Badge>
            ) : group.isArchived ? (
              <Badge
                variant="secondary"
                className="bg-warning/10 text-warning border-warning/20"
              >
                Đã lưu trữ
              </Badge>
            ) : (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                Đang hoạt động
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {group.memberCount.toLocaleString()}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {group.postCount.toLocaleString()}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatRelativeTime(group.createdAt)}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {formatRelativeTime(group.lastActivityAt)}
          </div>
        </TableCell>
        <TableCell>
          <GroupActionsCell group={group} />
        </TableCell>
      </TableRow>
    );
  }
);

GroupTableRow.displayName = "GroupTableRow"; // For better debugging in React DevTools
