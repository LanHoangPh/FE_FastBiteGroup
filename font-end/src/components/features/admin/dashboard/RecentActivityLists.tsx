import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  RecentUser,
  RecentGroup,
  RecentPendingReport,
  RecentAdminAction,
} from "@/types/admin/dashboard.types";
import { formatUtcToIctString } from "@/lib/utils/dateUtils";
import { Users, MessageCircle, AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";

interface RecentActivityListsProps {
  recentUsers: RecentUser[];
  recentGroups: RecentGroup[];
  recentPendingReports: RecentPendingReport[];
  recentAdminActions: RecentAdminAction[];
}

export function RecentActivityLists({
  recentUsers,
  recentGroups,
  recentPendingReports,
  recentAdminActions,
}: RecentActivityListsProps) {
  const formatDate = (dateString: string) => {
    return formatUtcToIctString(dateString);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Người dùng mới nhất
          </CardTitle>
          <Users className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.userId} className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có người dùng mới
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Groups */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Nhóm mới nhất</CardTitle>
          <MessageCircle className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGroups.length > 0 ? (
              recentGroups.map((group) => (
                <div
                  key={group.groupId}
                  className="flex items-center space-x-4"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(group.groupName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {group.groupName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(group.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có nhóm mới
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pending Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Báo cáo chờ xử lý
          </CardTitle>
          <AlertTriangle className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPendingReports.length > 0 ? (
              recentPendingReports.map((report) => (
                <Link
                  key={report.reportId}
                  href={report.urlToContent}
                  className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                        {report.contentType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(report.reportedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-none">
                      {report.reason}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Báo cáo bởi: {report.reportedByUser}</p>
                      <p>Nhóm: {report.groupName}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có báo cáo chờ xử lý
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Hành động Admin gần đây
          </CardTitle>
          <Shield className="ml-auto h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAdminActions.length > 0 ? (
              recentAdminActions.map((action, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium leading-none">
                    {action.adminFullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.actionDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(action.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có hành động admin gần đây
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
