"use client";

import { LoginHistoryDto } from "@/types/admin/user.types";
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
import { Clock, Monitor, Globe, CheckCircle, XCircle } from "lucide-react";

interface LoginHistoryTabProps {
  loginHistory: LoginHistoryDto[];
}

export function LoginHistoryTab({ loginHistory }: LoginHistoryTabProps) {
  const formatDate = (dateString: string) => {
    return formatUtcToIctString(dateString) || "Không xác định";
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return "Không xác định";

    // Simple device detection
    if (userAgent.includes("Mobile")) return "Di động";
    if (userAgent.includes("Tablet")) return "Máy tính bảng";
    return "Máy tính";
  };

  const getStatusBadge = (wasSuccessful: boolean) => {
    return wasSuccessful ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 hover:bg-green-100"
      >
        <CheckCircle className="mr-1 h-3 w-3" />
        Thành công
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Thất bại
      </Badge>
    );
  };

  if (loginHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Chưa có lịch sử đăng nhập
        </h3>
        <p className="text-muted-foreground">
          Lịch sử đăng nhập sẽ được hiển thị ở đây khi bạn đăng nhập.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lịch sử đăng nhập</h3>
        <p className="text-sm text-muted-foreground">
          Danh sách các lần đăng nhập gần đây của bạn.
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Thời gian
                </div>
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Địa chỉ IP
                </div>
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Thiết bị
                </div>
              </TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginHistory.map((login, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formatDate(login.loginTimestamp)}
                </TableCell>
                <TableCell>{login.ipAddress || "Không xác định"}</TableCell>
                <TableCell>{getDeviceInfo(login.userAgent)}</TableCell>
                <TableCell>{getStatusBadge(login.wasSuccessful)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Hiển thị {loginHistory.length} lần đăng nhập gần nhất
      </div>
    </div>
  );
}
