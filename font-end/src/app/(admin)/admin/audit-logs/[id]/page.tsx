"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Target,
  FileText,
  Calendar,
  AlertCircle,
  Shield,
  Activity,
  ExternalLink,
} from "lucide-react";

import { getAdminAuditLogDetails } from "@/lib/api/admin/audit-logs";
import {
  AdminActionType,
  TargetEntityType,
} from "@/types/admin/audit-log.types";
import { formatDate } from "@/lib/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import Link from "next/link";

// Helper function to get action type badge variant
const getActionTypeBadgeVariant = (actionType: AdminActionType) => {
  switch (actionType) {
    case AdminActionType.UserDeactivated:
    case AdminActionType.UserSoftDeleted:
    case AdminActionType.GroupSoftDeleted:
    case AdminActionType.PostSoftDeleted:
    case AdminActionType.RoleDeleted:
      return "destructive";
    case AdminActionType.UserReactivated:
    case AdminActionType.UserRestored:
    case AdminActionType.GroupRestored:
    case AdminActionType.PostRestored:
    case AdminActionType.UserCreatedByAdmin:
    case AdminActionType.GroupCreated:
    case AdminActionType.RoleCreated:
      return "default";
    case AdminActionType.UserUpdated:
    case AdminActionType.GroupUpdated:
    case AdminActionType.RoleUpdated:
    case AdminActionType.GroupSettingsChanged:
    case AdminActionType.UserPasswordForcedReset:
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
    case TargetEntityType.Setting:
      return "Cài đặt";
    default:
      return entityType;
  }
};

// Helper function to get action type icon
const getActionTypeIcon = (actionType: AdminActionType) => {
  switch (actionType) {
    case AdminActionType.UserCreatedByAdmin:
    case AdminActionType.GroupCreated:
    case AdminActionType.RoleCreated:
      return <FileText className="h-4 w-4" />;
    case AdminActionType.UserUpdated:
    case AdminActionType.GroupUpdated:
    case AdminActionType.RoleUpdated:
    case AdminActionType.GroupSettingsChanged:
      return <Activity className="h-4 w-4" />;
    case AdminActionType.UserDeactivated:
    case AdminActionType.UserSoftDeleted:
    case AdminActionType.GroupSoftDeleted:
    case AdminActionType.PostSoftDeleted:
    case AdminActionType.RoleDeleted:
      return <AlertCircle className="h-4 w-4" />;
    case AdminActionType.UserReactivated:
    case AdminActionType.UserRestored:
    case AdminActionType.GroupRestored:
    case AdminActionType.PostRestored:
      return <Shield className="h-4 w-4" />;
    case AdminActionType.UserPasswordForcedReset:
      return <Shield className="h-4 w-4" />;
    case AdminActionType.SettingsUpdated:
      return <Activity className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export default function AuditLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const logId = Number(params.id);

  const {
    data: auditLogData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audit-log-detail", logId],
    queryFn: () => getAdminAuditLogDetails(logId),
    enabled: !!logId && !isNaN(logId),
  });

  const auditLog = auditLogData?.data;

  const parseDetails = (details?: string) => {
    if (!details) return null;

    try {
      return JSON.parse(details);
    } catch {
      return details; // Return as string if not valid JSON
    }
  };

  const renderJsonDetails = (details: any) => {
    if (typeof details === "string") {
      return (
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto border border-border">
          <code className="text-foreground">{details}</code>
        </pre>
      );
    }

    return (
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto border border-border">
        <code className="text-foreground">
          {JSON.stringify(details, null, 2)}
        </code>
      </pre>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Đang tải thông tin nhật ký...</p>
        </div>
      </div>
    );
  }

  if (error || !auditLog) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải thông tin nhật ký. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const parsedDetails = parseDetails(auditLog.details);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <AdminPageHeader
        icon={Activity}
        title="Chi Tiết Nhật Ký"
        description={`ID: ${auditLog.id} • ${formatDate(auditLog.timestamp)}`}
        gradientColors="from-primary/5 via-chart-1/5 to-chart-2/5"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay Lại
        </Button>
        <Badge
          variant={getActionTypeBadgeVariant(auditLog.actionType)}
          className="flex items-center gap-1 px-3 py-1 text-sm font-medium"
        >
          {getActionTypeIcon(auditLog.actionType)}
          {getActionTypeDisplayName(auditLog.actionType)}
        </Badge>
      </AdminPageHeader>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Admin Info */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Thông Tin Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tên Admin
                  </label>
                  <p className="text-lg font-semibold mt-1">
                    {auditLog.adminFullName}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    ID Admin
                  </label>
                  <Link
                    href={`/admin/users/${auditLog.adminUserId}`}
                    className="inline-block mt-1 font-mono text-sm bg-background px-2 py-1 rounded border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {auditLog.adminUserId}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Entity Card */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Đối Tượng Mục Tiêu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Loại Đối Tượng
                  </label>
                  <p className="text-lg font-semibold mt-1">
                    {getEntityTypeDisplayName(auditLog.targetEntityType)}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    ID Đối Tượng
                  </label>
                  {/* <Link
                    href={`/admin/${auditLog.targetEntityType.toLowerCase()}/${
                      auditLog.targetEntityId
                    }`}
                    className="inline-block mt-1 font-mono text-sm bg-background px-2 py-1 rounded border hover:bg-accent hover:text-accent-foreground transition-colors"
                  > */}
                  {auditLog.targetEntityId}
                  {/* </Link> */}
                </div>

                {/* Batch ID - New Field */}
                {auditLog.batchId && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Batch ID
                    </label>
                    <p className="font-mono text-sm mt-1 bg-background px-2 py-1 rounded border">
                      {auditLog.batchId}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link
                      href={`/admin/${auditLog.targetEntityType.toLowerCase()}/${
                        auditLog.targetEntityId
                      }`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem Đối Tượng
                    </Link>
                  </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="xl:col-span-2">
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Thông Tin Chi Tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedDetails ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Dữ Liệu Chi Tiết
                    </label>
                    <div className="rounded-lg overflow-hidden">
                      {renderJsonDetails(parsedDetails)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Không có thông tin chi tiết bổ sung cho nhật ký này.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Summary - Bottom */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Tóm Tắt Thời Gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {getActionTypeIcon(auditLog.actionType)}
              </div>
              <div>
                <p className="font-medium">
                  {auditLog.adminFullName} đã thực hiện hành động "
                  {getActionTypeDisplayName(auditLog.actionType)}"
                </p>
                <p className="text-sm text-muted-foreground">
                  trên {getEntityTypeDisplayName(auditLog.targetEntityType)} #
                  {auditLog.targetEntityId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">
                {formatDate(auditLog.timestamp)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
