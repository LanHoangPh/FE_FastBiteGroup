"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminGroups,
  bulkGroupAction,
  exportGroupsToExcel,
} from "@/lib/api/admin/groups";
import {
  GetGroupsAdminParams,
  GroupType,
  MyGroupFilterType,
  GroupStatusFilter,
  BulkGroupActionType,
  BulkGroupActionRequest,
} from "@/types/admin/group.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Search,
  Plus,
  X,
  Trash2,
  Archive,
  RotateCcw,
  Users,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { ExportButton } from "@/components/shared/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupTableRow } from "@/components/features/admin/groups/GroupTableRow";
import { CreateGroupDialog } from "@/components/features/admin/groups/CreateGroupDialog";

export default function AdminGroupsPage() {
  // State for filters and pagination
  const [filters, setFilters] = useState<GetGroupsAdminParams>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
    groupType: undefined,
    status: "All",
  });

  // State for bulk actions
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    action: BulkGroupActionType;
    groupIds: string[];
  } | null>(null);

  // State for create group dialog
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);

  // Fetch data using TanStack Query
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-groups", filters],
    queryFn: () => getAdminGroups(filters),
  });

  const groups = useMemo(
    () => response?.data?.items || [],
    [response?.data?.items]
  );
  const totalRecords = response?.data?.totalRecords || 0;
  const totalPages = response?.data?.totalPages || 0;
  const currentPage = response?.data?.pageNumber || 1;

  // Handler functions
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, pageNumber: 1 }));
  };

  const handleGroupTypeChange = (value: string) => {
    const groupType =
      value === "all" ? undefined : (value as MyGroupFilterType);
    setFilters((prev) => ({ ...prev, groupType, pageNumber: 1 }));
  };

  const handleStatusFilterChange = (value: string) => {
    const status = value as GroupStatusFilter;
    setFilters((prev) => ({ ...prev, status, pageNumber: 1 }));
  };

  const handlePageSizeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: parseInt(value),
      pageNumber: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleClearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      searchTerm: "",
      groupType: undefined,
      status: "All",
    });
    setSelectedGroups(new Set());
  };

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: (data: BulkGroupActionRequest) => bulkGroupAction(data),
    onSuccess: () => {
      setSelectedGroups(new Set());
      setBulkActionDialog(null);
      toast.info("Yêu cầu đã được gửi", {
        description: "Hành động hàng loạt đang được xử lý trong nền.",
      });
    },
    onError: (error: any) => {
      toast.error("Lỗi", {
        description: "Không thể thực hiện hành động hàng loạt",
      });
    },
  });

  // Helper functions for bulk actions - STABILIZED WITH useCallback
  // Create a stable callback that can be reused for all rows
  const createSelectionHandler = useCallback((groupId: string) => {
    return (checked: boolean) => {
      setSelectedGroups((prevSelected) => {
        const newSelected = new Set(prevSelected);
        if (checked) {
          newSelected.add(groupId);
        } else {
          newSelected.delete(groupId);
        }
        return newSelected;
      });
    };
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedGroups(new Set(groups.map((group) => group.groupId)));
      } else {
        setSelectedGroups(new Set());
      }
    },
    [groups]
  );

  const handleBulkAction = useCallback(
    (action: BulkGroupActionType) => {
      const groupIds = Array.from(selectedGroups);
      setBulkActionDialog({ action, groupIds });
    },
    [selectedGroups]
  );

  const executeBulkAction = useCallback(() => {
    if (bulkActionDialog) {
      bulkActionMutation.mutate({
        action: bulkActionDialog.action,
        groupIds: bulkActionDialog.groupIds,
      });
    }
  }, [bulkActionDialog, bulkActionMutation]);

  const getBulkActionTitle = (action: BulkGroupActionType): string => {
    switch (action) {
      case "Archive":
        return "Lưu trữ";
      case "Unarchive":
        return "Bỏ lưu trữ";
      case "SoftDelete":
        return "Xóa mềm";
      case "Restore":
        return "Khôi phục";
      default:
        return action;
    }
  };

  const getBulkActionDescription = (action: BulkGroupActionType): string => {
    switch (action) {
      case "Archive":
        return "lưu trữ";
      case "Unarchive":
        return "bỏ lưu trữ";
      case "SoftDelete":
        return "xóa mềm";
      case "Restore":
        return "khôi phục";
      default:
        return action;
    }
  };

  // Export functionality
  const handleExportGroups = useCallback(async () => {
    const exportParams = {
      ...filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    };
    return exportGroupsToExcel(exportParams);
  }, [filters]);

  // Calculate display range
  const startRecord = (currentPage - 1) * (filters.pageSize ?? 10) + 1;
  const endRecord = Math.min(
    currentPage * (filters.pageSize ?? 10),
    totalRecords
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <AdminPageHeader
        icon={Users}
        title="Quản lý Nhóm"
        description="Quản lý tất cả nhóm trong hệ thống với các tính năng tìm kiếm, lọc và hành động"
      >
        <ExportButton onExport={handleExportGroups} />
        <Button onClick={() => setCreateGroupDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Nhóm Mới
        </Button>
      </AdminPageHeader>

      {/* Single Card Layout */}
      <Card>
        {/* Card Header with Filters */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách Nhóm
          </CardTitle>

          {/* Filter Bar */}
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedGroups.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Đã chọn {selectedGroups.size} nhóm
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Hành động hàng loạt
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("Archive")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Lưu trữ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("Unarchive")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Bỏ lưu trữ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("SoftDelete")}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa mềm
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("Restore")}
                      className="text-green-600"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Khôi phục
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Regular Filter Bar - Only show when no groups are selected */}
            {selectedGroups.size === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm nhóm..."
                      value={filters.searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Group Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Loại nhóm
                  </label>
                  <Select
                    value={filters.groupType || "all"}
                    onValueChange={handleGroupTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="Chat">Trò chuyện</SelectItem>
                      <SelectItem value="Community">Cộng đồng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Trạng thái
                  </label>
                  <Select
                    value={filters.status || "All"}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Tất cả trạng thái</SelectItem>
                      <SelectItem value="Active">Đang hoạt động</SelectItem>
                      <SelectItem value="Archived">Đã lưu trữ</SelectItem>
                      <SelectItem value="Deleted">Đã xóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    &nbsp;
                  </label>
                  {(filters.groupType ||
                    filters.status !== "All" ||
                    filters.searchTerm) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Card Content - Data Table */}
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">
                Có lỗi xảy ra khi tải dữ liệu
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        groups.length > 0 &&
                        selectedGroups.size === groups.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Tên Nhóm
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Loại nhóm
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Loại hình nhóm
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Thành viên
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Bài viết
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="text-foreground font-medium">
                    Hoạt động cuối
                  </TableHead>
                  <TableHead className="w-[100px] text-foreground font-medium">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Không tìm thấy nhóm nào
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <GroupTableRow
                      key={group.groupId}
                      group={group}
                      isSelected={selectedGroups.has(group.groupId)}
                      onSelectionChange={createSelectionHandler(group.groupId)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Card Footer - Pagination */}
        <div className="border-t bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Hiển thị {startRecord}-{endRecord} trên tổng số{" "}
              {totalRecords.toLocaleString()} nhóm
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
                  onValueChange={handlePageSizeChange}
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

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={!!bulkActionDialog}
        onOpenChange={(open) => !open && setBulkActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Hành động hàng loạt:{" "}
              {bulkActionDialog && getBulkActionTitle(bulkActionDialog.action)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn{" "}
              {bulkActionDialog &&
                getBulkActionDescription(bulkActionDialog.action)}{" "}
              {bulkActionDialog?.groupIds.length} nhóm đã chọn?
              <br />
              <span className="text-destructive font-medium">
                ⚠️ Hành động này sẽ ảnh hưởng đến tất cả các nhóm được chọn.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              className={
                bulkActionDialog?.action === "SoftDelete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : bulkActionDialog?.action === "Restore"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-warning text-warning-foreground hover:bg-warning/90"
              }
              disabled={bulkActionMutation.isPending}
            >
              {bulkActionDialog && getBulkActionTitle(bulkActionDialog.action)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
      />
    </div>
  );
}
