"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Filter, X, RefreshCw } from "lucide-react";

import {
  getAdminAuditLogs,
  exportAuditLogsToExcel,
} from "@/lib/api/admin/audit-logs";
import {
  AdminActionType,
  GetAdminAuditLogsParams,
  TargetEntityType,
} from "@/types/admin/audit-log.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { ExportButton } from "@/components/shared/ExportButton";
import { AuditLogTableRow } from "@/components/features/admin/audit-logs/AuditLogTableRow";

const PAGE_SIZE = 10;

// Simple helper functions for filter dropdowns
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

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<GetAdminAuditLogsParams>({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const {
    data: auditLogsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: () => getAdminAuditLogs(filters),
  });

  const auditLogs = auditLogsData?.data?.items || [];
  const totalRecords = auditLogsData?.data?.totalRecords || 0;
  const totalPages = auditLogsData?.data?.totalPages || 0;
  const currentPage = auditLogsData?.data?.pageNumber || 1;

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: 1, // Reset to first page when applying filters
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handlePageChange = (pageNumber: number) => {
    setFilters((prev) => ({ ...prev, pageNumber }));
  };

  const handleFilterChange = (
    key: keyof GetAdminAuditLogsParams,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      pageNumber: 1, // Reset to first page when changing filters
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: newPageSize,
      pageNumber: 1, // Reset to first page when changing page size
    }));
  };

  // Export functionality
  const handleExportAuditLogs = useCallback(async () => {
    const exportParams = {
      ...filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    };
    return exportAuditLogsToExcel(exportParams);
  }, [filters]);

  // Calculate display range
  const startRecord = (currentPage - 1) * (filters.pageSize ?? 10) + 1;
  const endRecord = Math.min(
    currentPage * (filters.pageSize ?? 10),
    totalRecords
  );

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Đã xảy ra lỗi khi tải dữ liệu nhật ký kiểm toán.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <AdminPageHeader
        icon={Filter}
        title="Nhật ký Hoạt động"
        description="Theo dõi và quản lý tất cả hoạt động của admin trong hệ thống"
      >
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
        <ExportButton onExport={handleExportAuditLogs} />
      </AdminPageHeader>

      {/* Single Card Layout */}
      <Card>
        {/* Card Header with Filters */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ Lọc
          </CardTitle>

          {/* Filter Bar */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Admin ID Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ID Admin
                </label>
                <Input
                  placeholder="Nhập ID admin..."
                  value={filters.adminId || ""}
                  onChange={(e) =>
                    handleFilterChange("adminId", e.target.value || undefined)
                  }
                />
              </div>

              {/* Action Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Loại Hành Động
                </label>
                <Select
                  value={filters.actionType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "actionType",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả hành động</SelectItem>
                    {Object.values(AdminActionType).map((actionType) => (
                      <SelectItem key={actionType} value={actionType}>
                        {getActionTypeDisplayName(actionType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Entity Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Loại Đối Tượng
                </label>
                <Select
                  value={filters.targetEntityType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "targetEntityType",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đối tượng</SelectItem>
                    {Object.values(TargetEntityType).map((entityType) => (
                      <SelectItem key={entityType} value={entityType}>
                        {getEntityTypeDisplayName(entityType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Entity ID Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ID Đối Tượng
                </label>
                <Input
                  placeholder="Nhập ID đối tượng..."
                  value={filters.targetEntityId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "targetEntityId",
                      e.target.value || undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Second Row of Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Batch ID Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Batch ID
                </label>
                <Input
                  placeholder="Nhập Batch ID..."
                  value={filters.batchId || ""}
                  onChange={(e) =>
                    handleFilterChange("batchId", e.target.value || undefined)
                  }
                />
              </div>

              {/* Date Range Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Từ Ngày
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Chọn ngày bắt đầu"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Đến Ngày
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Chọn ngày kết thúc"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Áp Dụng Bộ Lọc
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Xóa Bộ Lọc
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Card Content - Data Table */}
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Hành Động</TableHead>
                    <TableHead>Đối Tượng</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Thời Gian</TableHead>
                    <TableHead className="w-[100px]">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-center">
                          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Không tìm thấy nhật ký nào
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <AuditLogTableRow key={log.id} log={log} />
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>

        {/* Card Footer - Pagination */}
        <div className="border-t bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Hiển thị {startRecord}-{endRecord} trên tổng số{" "}
              {totalRecords.toLocaleString()} bản ghi
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Số hàng mỗi trang:
                </span>
                <Select
                  value={filters.pageSize?.toString()}
                  onValueChange={(value) =>
                    handlePageSizeChange(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          handlePageChange(Math.max(1, currentPage - 1));
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          );
                        }}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
