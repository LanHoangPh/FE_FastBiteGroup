"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import {
  GroupReportedContentDto,
  ModerationAction,
  ReportedContentType,
} from "@/types/customer/moderation";
import { takeModerationAction } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface ReportCardProps {
  report: GroupReportedContentDto;
  groupId: string;
}

export function ReportCard({ report, groupId }: ReportCardProps) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<ModerationAction | null>(
    null
  );

  // Mutation for taking moderation actions
  const moderationMutation = useMutation({
    mutationFn: (action: ModerationAction) =>
      takeModerationAction(groupId, report.reportId, { action }),
    onSuccess: (_, action) => {
      const actionMessages = {
        [ModerationAction.DismissReport]: "Báo cáo đã được bỏ qua",
        [ModerationAction.RemoveContent]: "Nội dung đã được xóa",
        [ModerationAction.RemoveContentAndWarnUser]:
          "Nội dung đã được xóa và người dùng đã được cảnh báo",
        [ModerationAction.RemoveContentAndBanUser]:
          "Nội dung đã được xóa và người dùng đã bị cấm",
      };

      toast.success(actionMessages[action]);

      // Invalidate queries to refresh the report list
      queryClient.invalidateQueries({ queryKey: ["pendingReports", groupId] });

      setConfirmAction(null);
    },
    onError: (error) => {
      handleApiError(error, "Không thể thực hiện hành động");
      setConfirmAction(null);
    },
  });

  const handleActionClick = (action: ModerationAction) => {
    // Actions that require confirmation
    const destructiveActions = [
      ModerationAction.RemoveContent,
      ModerationAction.RemoveContentAndWarnUser,
      ModerationAction.RemoveContentAndBanUser,
    ];

    if (destructiveActions.includes(action)) {
      setConfirmAction(action);
    } else {
      moderationMutation.mutate(action);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      moderationMutation.mutate(confirmAction);
    }
  };

  const getContentTypeIcon = (type: ReportedContentType) => {
    switch (type) {
      case ReportedContentType.Post:
        return <FileText className="w-4 h-4" />;
      case ReportedContentType.Comment:
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeLabel = (type: ReportedContentType) => {
    switch (type) {
      case ReportedContentType.Post:
        return "Bài viết";
      case ReportedContentType.Comment:
        return "Bình luận";
      default:
        return "Nội dung";
    }
  };

  const getActionLabel = (action: ModerationAction) => {
    switch (action) {
      case ModerationAction.DismissReport:
        return "Bỏ qua";
      case ModerationAction.RemoveContent:
        return "Xóa nội dung";
      case ModerationAction.RemoveContentAndWarnUser:
        return "Xóa & Cảnh báo";
      case ModerationAction.RemoveContentAndBanUser:
        return "Xóa & Cấm";
      default:
        return "Hành động";
    }
  };

  const getActionDescription = (action: ModerationAction) => {
    switch (action) {
      case ModerationAction.RemoveContent:
        return "Nội dung sẽ bị xóa khỏi nhóm. Hành động này không thể hoàn tác.";
      case ModerationAction.RemoveContentAndWarnUser:
        return "Nội dung sẽ bị xóa và tác giả sẽ nhận được cảnh báo. Hành động này không thể hoàn tác.";
      case ModerationAction.RemoveContentAndBanUser:
        return "Nội dung sẽ bị xóa và tác giả sẽ bị cấm khỏi nhóm. Hành động này không thể hoàn tác.";
      default:
        return "Bạn có chắc chắn muốn thực hiện hành động này?";
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                {getContentTypeIcon(report.contentType)}
                <span>{getContentTypeLabel(report.contentType)}</span>
              </Badge>
              <Badge
                variant="destructive"
                className="flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Báo cáo</span>
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {format(new Date(report.reportedAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Content Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Nội dung được báo cáo:
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {report.contentPreview}
            </p>
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Tác giả:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {report.authorName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Người báo cáo:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {report.reporterName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Lý do:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {report.reason}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick(ModerationAction.DismissReport)}
              disabled={moderationMutation.isPending}
            >
              {getActionLabel(ModerationAction.DismissReport)}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleActionClick(ModerationAction.RemoveContent)}
              disabled={moderationMutation.isPending}
            >
              {getActionLabel(ModerationAction.RemoveContent)}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleActionClick(ModerationAction.RemoveContentAndWarnUser)
              }
              disabled={moderationMutation.isPending}
            >
              {getActionLabel(ModerationAction.RemoveContentAndWarnUser)}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleActionClick(ModerationAction.RemoveContentAndBanUser)
              }
              disabled={moderationMutation.isPending}
            >
              {getActionLabel(ModerationAction.RemoveContentAndBanUser)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hành động</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction && getActionDescription(confirmAction)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={moderationMutation.isPending}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={moderationMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {moderationMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
