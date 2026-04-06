"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/index";
import { User, Shield, Bell, Settings, Lock, Users, UserX } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

function SidebarLink({ href, icon: Icon, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:transform hover:scale-105",
        active
          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 font-semibold text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20"
          : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border hover:border-blue-500/20"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
          active
            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            : "bg-gradient-to-br from-gray-400/20 to-gray-500/20 group-hover:from-blue-500/20 group-hover:to-purple-500/20"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            active
              ? "text-white"
              : "text-gray-600 dark:text-gray-400 group-hover:text-blue-500"
          )}
        />
      </div>
      <span className="font-medium">{label}</span>
      {active && (
        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      )}
    </Link>
  );
}

export function SettingsSidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/me/profile",
      icon: User,
      label: "Hồ sơ cá nhân",
    },
    {
      href: "/me/security",
      icon: Shield,
      label: "Bảo mật",
    },
    {
      href: "/me/contacts",
      icon: Users,
      label: "Danh bạ",
    },
    {
      href: "/me/privacy",
      icon: Lock,
      label: "Quyền riêng tư",
    },
    {
      href: "/me/notifications",
      icon: Bell,
      label: "Thông báo",
    },
    {
      href: "/me/preferences",
      icon: Settings,
      label: "Tùy chọn",
    },
  ];

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
          Cài đặt
        </h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={pathname === link.href}
          />
        ))}

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

        <SidebarLink
          href="/me/security"
          icon={UserX}
          label="Vô hiệu hóa tài khoản"
          active={false}
        />
      </nav>
    </div>
  );
}
