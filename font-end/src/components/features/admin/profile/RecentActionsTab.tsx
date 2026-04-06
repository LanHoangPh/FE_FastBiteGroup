"use client";

import { AdminActionLogDto } from "@/types/admin/user.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatUtcToIctString } from "@/lib/utils/dateUtils";
import { Activity, Clock, Target, Hash } from "lucide-react";

interface RecentActionsTabProps {
  recentActions: AdminActionLogDto[];
}

export function RecentActionsTab({ recentActions }: RecentActionsTabProps) {
  const formatDate = (dateString: string) => {
    return formatUtcToIctString(dateString) || "Không xác định";
  };

  const getActionTypeBadge = (actionType: string) => {
    const actionColors: Record<string, string> = {
      CREATE:
        "bg-success/10 text-success border-success/20 hover:bg-success/20",
      UPDATE: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      DELETE: "bg-red-100 text-red-800 hover:bg-red-100",
      VIEW: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      LOGIN: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      LOGOUT: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };

    const color =
      actionColors[actionType] || "bg-gray-100 text-gray-800 hover:bg-gray-100";

    return (
      <Badge variant="default" className={color}>
        {actionType}
      </Badge>
    );
  };

  const getEntityTypeLabel = (entityType: string) => {
    const entityLabels: Record<string, string> = {
      USER: "Người dùng",
      GROUP: "Nhóm",
      POST: "Bài viết",
      COMMENT: "Bình luận",
      NOTIFICATION: "Thông báo",
      SETTING: "Cài đặt",
      SYSTEM: "Hệ thống",
    };

    return entityLabels[entityType] || entityType;
  };

  if (recentActions.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Chưa có hoạt động gần đây
        </h3>
        <p className="text-muted-foreground">
          Các hoạt động quản trị sẽ được hiển thị ở đây khi bạn thực hiện các
          thao tác.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Hoạt động gần đây</h3>
        <p className="text-sm text-muted-foreground">
          Danh sách các hoạt động quản trị gần đây của bạn.
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Hành động
                </div>
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Đối tượng
                </div>
              </TableHead>
              <TableHead className="w-[120px]">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ID
                </div>
              </TableHead>
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Thời gian
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActions.map((action, index) => (
              <TableRow key={index}>
                <TableCell>{getActionTypeBadge(action.actionType)}</TableCell>
                <TableCell className="font-medium">
                  {getEntityTypeLabel(action.targetEntityType)}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {action.targetEntityId.slice(0, 8)}...
                </TableCell>
                <TableCell>{formatDate(action.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Hiển thị {recentActions.length} hoạt động gần nhất
      </div>
    </div>
  );
}
