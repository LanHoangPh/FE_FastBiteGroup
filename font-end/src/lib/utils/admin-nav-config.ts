import {
  Home,
  Users,
  Package,
  Settings,
  UserCircle,
  ClipboardList,
  Shield,
  TrendingUp,
  LucideProps,
} from "lucide-react";
import React from "react";

export interface NavCommand {
  title: string;
  href: string;
  icon: React.FC<LucideProps>;
  keywords?: string[];
}

export const adminNavCommands: NavCommand[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    keywords: ["home", "main", "overview", "trang chu"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
    keywords: ["analytics", "charts", "statistics", "thong ke", "bieu do"],
  },
  {
    title: "Quản lý Người dùng",
    href: "/admin/users",
    icon: Users,
    keywords: ["users", "accounts", "members", "nguoi dung", "tai khoan"],
  },
  {
    title: "Quản lý Vai trò",
    href: "/admin/roles",
    icon: Shield,
    keywords: ["roles", "permissions", "vai tro", "quyen han"],
  },
  {
    title: "Quản lý Nhóm",
    href: "/admin/groups",
    icon: Package,
    keywords: ["groups", "communities", "nhom"],
  },
  {
    title: "Nhật ký Hoạt động",
    href: "/admin/audit-logs",
    icon: ClipboardList,
    keywords: ["audit", "logs", "activity", "hoat dong", "nhat ky"],
  },
  {
    title: "Cài đặt Hệ thống",
    href: "/admin/settings",
    icon: Settings,
    keywords: ["settings", "configuration", "cai dat", "he thong"],
  },
  {
    title: "Hồ sơ của tôi",
    href: "/admin/profile",
    icon: UserCircle,
    keywords: ["profile", "my account", "ho so", "ca nhan"],
  },
];
