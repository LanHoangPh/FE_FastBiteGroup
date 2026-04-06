import { Metadata } from "next";
import UserManagement from "@/components/features/admin/users/UserManagement";

export const metadata: Metadata = {
  title: "Quản lý người dùng | FastBite Admin",
  description:
    "Quản lý tài khoản người dùng, vai trò và quyền hạn trong hệ thống FastBite",
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
