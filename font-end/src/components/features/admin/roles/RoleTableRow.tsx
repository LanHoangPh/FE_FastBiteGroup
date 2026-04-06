"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleDto } from "@/types/admin/role.types";
import { Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleTableRowProps {
  role: RoleDto;
  onEdit: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
}

// Helper function to determine if a role is the Admin role (legacy check)
const isAdminRole = (role: RoleDto) => role.name === "Admin";

// Wrap the entire component in React.memo
export const RoleTableRow = React.memo(
  ({ role, onEdit, onDelete }: RoleTableRowProps) => {
    // This console log will now only fire for rows that *actually* change.
    console.log(`Rendering row for role: ${role.name}`);

    // Check if actions should be disabled (either system role or admin role)
    const isDisabled = role.isSystemRole || isAdminRole(role);

    return (
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">{role.name}</TableCell>
        <TableCell className="text-muted-foreground">
          {role.userCount}
        </TableCell>
        <TableCell>
          {role.isSystemRole ? (
            <Badge variant="secondary">Hệ thống</Badge>
          ) : (
            <Badge variant="outline">Tùy chỉnh</Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(role)}
                      disabled={isDisabled}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent>
                    <p>Không thể sửa vai trò hệ thống.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(role)}
                      disabled={isDisabled}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent>
                    <p>Không thể xóa vai trò hệ thống.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

RoleTableRow.displayName = "RoleTableRow"; // For better debugging in React DevTools
