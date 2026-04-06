import { Metadata } from "next";
import { RoleManagement } from "@/components/features/admin/roles/RoleManagement";

export const metadata: Metadata = {
  title: "Quản lý Vai trò | FastBite Group",
  description: "Quản lý vai trò người dùng trong hệ thống",
};

export default function RolesPage() {
  return <RoleManagement />;
}
