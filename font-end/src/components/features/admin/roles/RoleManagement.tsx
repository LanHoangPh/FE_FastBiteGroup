"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Shield } from "lucide-react";

import { getAllRoles } from "@/lib/api/admin/roles";
import { handleApiError } from "@/lib/utils/errorUtils";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RolesTable } from "./RolesTable";
import { RoleDialog } from "./RoleDialog";

export function RoleManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch roles data
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAllRoles,
  });

  // Handle API error
  if (error) {
    handleApiError(error, "Không thể tải danh sách vai trò");
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <AdminPageHeader
        icon={Shield}
        title="Quản lý Vai trò"
        description="Quản lý vai trò người dùng và quyền hạn trong hệ thống"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo Vai trò Mới
        </Button>
      </AdminPageHeader>

      {/* Single Card Layout */}
      <Card>
        {/* Card Header */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danh sách Vai trò
          </CardTitle>
        </CardHeader>

        {/* Card Content */}
        <CardContent>
          <RolesTable roles={data?.data || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />
    </div>
  );
}
