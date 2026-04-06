// components/layout/admin/AdminSidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Users,
  Package,
  FileText,
  Settings,
  Shield,
  BarChart3,
  Activity,
} from "lucide-react";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: Home,
    category: "main",
  },
  {
    href: "/admin/users",
    label: "Quản lý Người dùng",
    icon: Users,
    category: "main",
  },
  {
    href: "/admin/roles",
    label: "Quản lý Vai trò",
    icon: Shield,
    category: "main",
  },
  {
    href: "/admin/groups",
    label: "Quản lý Nhóm",
    icon: Package,
    category: "main",
  },
  {
    href: "/admin/audit-logs",
    label: "Nhật Ký Kiểm Toán",
    icon: FileText,
    category: "monitoring",
  },
  {
    href: "/admin/analytics",
    label: "Thống kê",
    icon: BarChart3,
    category: "monitoring",
  },
];

const settingsItems = [
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

interface AdminSidebarNavProps {
  isCollapsed: boolean;
}

export function AdminSidebarNav({ isCollapsed }: AdminSidebarNavProps) {
  const pathname = usePathname();

  const mainItems = navItems.filter((item) => item.category === "main");
  const monitoringItems = navItems.filter(
    (item) => item.category === "monitoring"
  );

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;

    if (isCollapsed) {
      return (
        <Tooltip key={item.label} delayDuration={100}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-105",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "hover:bg-accent/80 hover:shadow-sm"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="sr-only">{item.label}</span>
              {isActive && (
                <div className="absolute -right-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-popover border-border/60 text-popover-foreground font-medium"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
          isActive
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isActive ? "scale-110" : "group-hover:scale-105"
          )}
        />
        <span className="truncate">{item.label}</span>
        {isActive && (
          <div className="absolute -right-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary-foreground/30" />
        )}
      </Link>
    );
  };

  const renderSectionHeader = (title: string, icon: React.ElementType) => {
    if (isCollapsed) return null;

    const Icon = icon;
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
        <Icon className="h-3 w-3" />
        <span>{title}</span>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex-1 py-3">
        <nav className="space-y-1 px-3">
          {/* Main Section */}
          {renderSectionHeader("Quản lý", Home)}
          <div className={cn("space-y-1", !isCollapsed && "mb-4")}>
            {mainItems.map((item) =>
              renderNavItem(item, pathname === item.href)
            )}
          </div>

          {/* Monitoring Section */}
          {renderSectionHeader("Giám sát", Activity)}
          <div className={cn("space-y-1", !isCollapsed && "mb-4")}>
            {monitoringItems.map((item) =>
              renderNavItem(item, pathname === item.href)
            )}
          </div>

          {/* Separator */}
          <div
            className={cn(
              "my-4",
              isCollapsed
                ? "border-t border-border/60 mx-2"
                : "border-t border-border/60 mx-0"
            )}
          />

          {/* Settings Section */}
          {renderSectionHeader("Hệ thống", Settings)}
          <div className="space-y-1">
            {settingsItems.map((item) =>
              renderNavItem(item, pathname === item.href)
            )}
          </div>
        </nav>

        {/* Quick Stats - Only show when expanded */}
        {!isCollapsed && (
          <div className="mt-6 mx-3 p-3 rounded-xl bg-gradient-to-r from-accent/40 to-accent/20 border border-border/40">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Trạng thái hệ thống
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Người dùng online</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  24
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hiệu suất</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  98%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
