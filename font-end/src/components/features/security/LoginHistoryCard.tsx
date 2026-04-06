"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyLoginHistory } from "@/lib/api/customer/me";
import { handleApiError } from "@/lib/utils/errorUtils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, Globe, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LoginHistoryCard() {
  const {
    data: loginHistoryResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["loginHistory"],
    queryFn: getMyLoginHistory,
  });

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
          Lịch sử đăng nhập
        </CardTitle>
        <CardDescription>
          Kiểm tra các hoạt động đăng nhập gần đây vào tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError || !loginHistoryResponse?.success ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <Clock className="mx-auto h-10 w-10 mb-2 text-slate-400" />
            <p>Không thể tải lịch sử đăng nhập. Vui lòng thử lại sau.</p>
          </div>
        ) : loginHistoryResponse.data.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400">
            <Clock className="mx-auto h-10 w-10 mb-2 text-slate-400" />
            <p>Chưa có lịch sử đăng nhập nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Địa chỉ IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistoryResponse.data.map((login, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {login.wasSuccessful ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Thành công
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Thất bại
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatDistanceToNow(new Date(login.loginTimestamp), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-slate-400" />
                        <span className="truncate max-w-[200px]">
                          {login.userAgent || "Không xác định"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        {login.ipAddress || "Không xác định"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
