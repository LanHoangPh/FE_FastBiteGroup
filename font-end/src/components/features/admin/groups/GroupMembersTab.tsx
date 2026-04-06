"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  UserX,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getAdminGroupMembers,
  updateAdminGroupMemberRole,
  removeAdminGroupMember,
} from "@/lib/api/admin/groups";
import { formatRelativeTime } from "@/lib/utils/dateUtils";
import { handleApiError } from "@/lib/utils/errorUtils";
import {
  GetGroupMembersParams,
  GroupAdminMemberDTO,
} from "@/types/admin/group.types";
import { AddMemberDialog } from "./AddMemberDialog";

interface GroupMembersTabProps {
  groupId: string;
  groupName: string;
  isReadOnly?: boolean;
}

export function GroupMembersTab({
  groupId,
  groupName,
  isReadOnly = false,
}: GroupMembersTabProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GetGroupMembersParams>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
    role: undefined,
  });

  // State to track which member is being removed (for inline confirmation)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // State for add member dialog
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

  // Fetch members data
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group-members", groupId, filters],
    queryFn: () => getAdminGroupMembers(groupId, filters),
    enabled: !!groupId,
  });

  const members = response?.data?.items || [];
  const totalRecords = response?.data?.totalRecords || 0;
  const totalPages = response?.data?.totalPages || 0;
  const currentPage = response?.data?.pageNumber || 1;

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: "Admin" | "Moderator" | "Member";
    }) => updateAdminGroupMemberRole(groupId, userId, { newRole }),
    onSuccess: () => {
      // Invalidate all queries related to this group's members
      queryClient.invalidateQueries({
        queryKey: ["group-members", groupId],
        exact: false,
      });
      // Also invalidate the group detail to refresh member count
      queryClient.invalidateQueries({
        queryKey: ["group-detail", groupId],
      });
      toast.success("Đã cập nhật vai trò thành viên");
    },
    onError: (error) => {
      handleApiError(error, "Lỗi khi cập nhật vai trò");
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeAdminGroupMember(groupId, userId),
    onSuccess: () => {
      // Invalidate all queries related to this group's members
      queryClient.invalidateQueries({
        queryKey: ["group-members", groupId],
        exact: false,
      });
      // Also invalidate the group detail to refresh member count
      queryClient.invalidateQueries({
        queryKey: ["group-detail", groupId],
      });

      // Reset member to remove
      setMemberToRemove(null);

      // Show success message
      toast.success("Đã xóa thành viên khỏi nhóm");

      // Check if we need to adjust pagination after deletion
      if (members.length === 1 && currentPage > 1) {
        // If we deleted the last member on the current page, go to previous page
        setFilters((prev) => ({
          ...prev,
          pageNumber: Math.max(1, currentPage - 1),
        }));
      }
    },
    onError: (error) => {
      // Reset member to remove
      setMemberToRemove(null);
      handleApiError(error, "Lỗi khi xóa thành viên");
    },
  });

  // Handler functions
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, pageNumber: 1 }));
  };

  const handleRoleFilterChange = (value: string) => {
    const role =
      value === "all" ? undefined : (value as "Admin" | "Moderator" | "Member");
    setFilters((prev) => ({ ...prev, role, pageNumber: 1 }));
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

  const handleRoleChange = (
    userId: string,
    newRole: "Admin" | "Moderator" | "Member"
  ) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const confirmRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId);
  };

  // Helper function to get role badge variant
  const getRoleBadgeVariant = (role: "Admin" | "Moderator" | "Member") => {
    switch (role) {
      case "Admin":
        return "default";
      case "Moderator":
        return "secondary";
      case "Member":
        return "outline";
      default:
        return "outline";
    }
  };

  // Calculate display range
  const startRecord = (currentPage - 1) * (filters.pageSize ?? 10) + 1;
  const endRecord = Math.min(
    currentPage * (filters.pageSize ?? 10),
    totalRecords
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Member Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              maxLength={50} // Limit search input length
            />
          </div>

          <Select
            value={filters.role || "all"}
            onValueChange={handleRoleFilterChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Moderator">Moderator</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isReadOnly && (
          <Button
            onClick={() => setIsAddMemberDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Thêm thành viên
          </Button>
        )}
      </div>

      {isReadOnly && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Chế độ chỉ xem</p>
              <p className="text-sm text-amber-700">
                Nhóm này đã bị xóa nên bạn không thể thêm hoặc xóa thành viên.
                Hãy khôi phục nhóm để tiếp tục quản lý.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">
            Đang tải danh sách thành viên...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            Có lỗi xảy ra khi tải danh sách thành viên
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Thành viên</th>
                <th className="text-left p-2 font-medium">Vai trò</th>
                <th className="text-left p-2 font-medium">Ngày tham gia</th>
                <th className="text-left p-2 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={member.avatarUrl}
                          alt={member.fullName}
                        />
                        <AvatarFallback>
                          {member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.fullName}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          member.userId,
                          value as "Admin" | "Moderator" | "Member"
                        )
                      }
                      disabled={updateRoleMutation.isPending || isReadOnly}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Moderator">Moderator</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">
                    {formatRelativeTime(member.joinedAt)}
                  </td>
                  <td className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        {!isReadOnly &&
                          (memberToRemove === member.userId ? (
                            // Inline confirmation
                            <div className="p-2 space-y-2">
                              <p className="text-sm">Xóa {member.fullName}?</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    confirmRemoveMember(member.userId)
                                  }
                                  disabled={removeMemberMutation.isPending}
                                >
                                  {removeMemberMutation.isPending
                                    ? "Đang xóa..."
                                    : "Xóa"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setMemberToRemove(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setMemberToRemove(member.userId);
                              }}
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              className="text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Xóa thành viên
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy thành viên nào
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startRecord}-{endRecord} trên tổng số{" "}
            {totalRecords.toLocaleString()} thành viên
          </div>

          <div className="flex items-center gap-4">
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

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Add Member Dialog */}
      {!isReadOnly && (
        <AddMemberDialog
          groupId={groupId}
          groupName={groupName}
          open={isAddMemberDialogOpen}
          onOpenChange={setIsAddMemberDialogOpen}
        />
      )}
    </div>
  );
}
