"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  RotateCcw,
  Users,
  Search,
  X,
} from "lucide-react";

import { getAdminUsers } from "@/lib/api/admin/users";
import { getAllRoles } from "@/lib/api/admin/roles";
import {
  GetUsersAdminParams,
  BulkUserActionType,
  AdminUserListItemDTO,
  UserWithVersion,
} from "@/types/admin/user.types";
import { RoleDto } from "@/types/admin/role.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { UserTableRow } from "./UserTableRow";

interface UsersTableProps {
  onBulkAction: (action: BulkUserActionType, users: UserWithVersion[]) => void;
  selectedUserIds: string[];
  onFiltersChange?: (filters: GetUsersAdminParams) => void;
  onEdit?: (user: AdminUserListItemDTO) => void;
}

const PAGE_SIZE = 10;

export default function UsersTable({
  onBulkAction,
  selectedUserIds,
  onFiltersChange,
  onEdit,
}: UsersTableProps) {
  const [filters, setFilters] = useState<GetUsersAdminParams>({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(selectedUserIds)
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      pageNumber: 1, // Reset to first page when searching
    }));
  }, [debouncedSearchTerm]);

  // Sync selected users with parent component
  useEffect(() => {
    setSelectedUsers(new Set(selectedUserIds));
  }, [selectedUserIds]);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => getAdminUsers(filters),
  });

  // Fetch roles for filtering
  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });

  const users = usersData?.data?.items || [];
  const totalPages = usersData?.data?.totalPages || 0;
  const totalRecords = usersData?.data?.totalRecords || 0;

  // Handle filter changes
  const handleFilterChange = (
    key: keyof GetUsersAdminParams,
    value: string | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1, // Reset to first page when changing filters
    }));
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setFilters((prev) => ({ ...prev, pageNumber }));
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: newPageSize,
      pageNumber: 1, // Reset to first page when changing page size
    }));
  };

  // Handle user selection - STABILIZED WITH useCallback
  const createUserSelectionHandler = useCallback(
    (userId: string, isCurrentUser: boolean) => {
      // Prevent selection of current user
      if (isCurrentUser) {
        return () => {};
      }

      return (checked: boolean) => {
        setSelectedUsers((prevSelected) => {
          const newSelected = new Set(prevSelected);
          if (checked) {
            newSelected.add(userId);
          } else {
            newSelected.delete(userId);
          }
          return newSelected;
        });
      };
    },
    []
  );

  // Handle select all - STABILIZED WITH useCallback
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Only select users that are not the current user
        setSelectedUsers(
          new Set(
            users
              .filter((user) => !user.isCurrentUser)
              .map((user) => user.userId)
          )
        );
      } else {
        setSelectedUsers(new Set());
      }
    },
    [users]
  );

  // Helper function to get selected users with versions
  const getSelectedUsersWithVersions = useCallback((): UserWithVersion[] => {
    return users
      .filter((user) => selectedUsers.has(user.userId) && !user.isCurrentUser)
      .map((user) => ({
        userId: user.userId,
        rowVersion: user.rowVersion,
      }));
  }, [users, selectedUsers]);

  // Clear filters
  const clearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      searchTerm: undefined,
      role: undefined,
      isActive: undefined,
      isDeleted: undefined,
    });
    setSearchTerm("");
    setSelectedUsers(new Set());
  };

  // Check if all users are selected (excluding current user)
  const allSelected =
    users.length > 0 &&
    selectedUsers.size === users.filter((user) => !user.isCurrentUser).length &&
    users.every((user) => user.isCurrentUser || selectedUsers.has(user.userId));

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">
          Đã xảy ra lỗi khi tải dữ liệu người dùng.
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-lg">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              maxLength={60}
            />
          </div>

          {/* Role Filter */}
          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              handleFilterChange("role", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {rolesData?.data?.map((role: RoleDto) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={
              filters.isDeleted === undefined && filters.isActive === undefined
                ? "all"
                : filters.isDeleted
                ? "deleted"
                : filters.isActive
                ? "active"
                : "inactive"
            }
            onValueChange={(value) => {
              if (value === "all") {
                handleFilterChange("isActive", undefined);
                handleFilterChange("isDeleted", undefined);
              } else if (value === "deleted") {
                handleFilterChange("isActive", undefined);
                handleFilterChange("isDeleted", true);
              } else {
                handleFilterChange("isActive", value === "active");
                handleFilterChange("isDeleted", false);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
              <SelectItem value="deleted">Xóa mềm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {(filters.role ||
          filters.isActive !== undefined ||
          filters.isDeleted !== undefined ||
          searchTerm) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
          <span className="text-sm text-muted-foreground">
            Đã chọn {selectedUsers.size} người dùng
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
                onClick={() =>
                  onBulkAction("Activate", getSelectedUsersWithVersions())
                }
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Kích hoạt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onBulkAction("Deactivate", getSelectedUsersWithVersions())
                }
              >
                <UserX className="h-4 w-4 mr-2" />
                Vô hiệu hóa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onBulkAction("AssignRole", getSelectedUsersWithVersions())
                }
              >
                <Shield className="h-4 w-4 mr-2" />
                Gán vai trò
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  onBulkAction("SoftDelete", getSelectedUsersWithVersions())
                }
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa mềm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onBulkAction("Restore", getSelectedUsersWithVersions())
                }
                className="text-green-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Khôi phục
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Current User Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-primary mb-1">
              Lưu ý về tài khoản hiện tại
            </h4>
            <p className="text-sm text-muted-foreground">
              Tài khoản bạn đang đăng nhập sẽ được hiển thị với badge "Tài khoản
              hiện tại". Bạn không thể xem chi tiết hoặc thực hiện một số hành
              động trên tài khoản của chính mình. Để quản lý thông tin cá nhân,
              vui lòng sử dụng trang Hồ sơ cá nhân.
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Không tìm thấy người dùng nào.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.userId}
                  user={user}
                  isSelected={selectedUsers.has(user.userId)}
                  onSelectionChange={createUserSelectionHandler(
                    user.userId,
                    user.isCurrentUser
                  )}
                  onEdit={onEdit}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rows per page selector and pagination info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị{" "}
          {((filters.pageNumber || 1) - 1) * (filters.pageSize || PAGE_SIZE) +
            1}{" "}
          -{" "}
          {Math.min(
            (filters.pageNumber || 1) * (filters.pageSize || PAGE_SIZE),
            totalRecords
          )}{" "}
          trên tổng số {totalRecords} người dùng
        </div>

        <div className="flex items-center gap-4">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Số hàng mỗi trang:
            </span>
            <Select
              value={filters.pageSize?.toString() || PAGE_SIZE.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
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
                      handlePageChange(
                        Math.max(1, (filters.pageNumber || 1) - 1)
                      );
                    }}
                    className={
                      (filters.pageNumber || 1) <= 1
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
                        isActive={page === (filters.pageNumber || 1)}
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
                        Math.min(totalPages, (filters.pageNumber || 1) + 1)
                      );
                    }}
                    className={
                      (filters.pageNumber || 1) >= totalPages
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
  );
}
