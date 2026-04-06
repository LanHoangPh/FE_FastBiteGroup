// layout/customer/CustomerSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  MessageCircle,
  Compass,
  User,
  Settings,
  Search,
  Bell,
  Sparkles,
  Activity,
  Mail,
  Phone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggleCustomer } from "@/components/shared/ThemeToggleCustomer";
import { UserCustomerNavSidebar } from "@/components/shared/UserCustomerNavSidebar";
import { NotificationBell } from "@/components/features/notifications/NotificationBell";

interface CustomerSidebarProps {
  isCollapsed?: boolean;
}

export function CustomerSidebar({ isCollapsed = true }: CustomerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Get current active nav item based on pathname
  const getCurrentNavItem = (path: string) => {
    if (path.includes("/chat")) return "chats";
    if (path.includes("/groups")) return "groups";
    if (path.includes("/invitations")) return "invitations";
    if (path.includes("/discover")) return "discover";
    if (path.includes("/communities")) return "communities";
    if (path.includes("/call-history")) return "call-history";
    if (path.includes("/profile")) return "profile";
    if (path.includes("/me")) return "settings";
    return null; // No default selection
  };

  const currentNavItem = getCurrentNavItem(pathname);

  const navigationItems = [
    {
      id: "chats",
      icon: MessageCircle,
      label: "Tin nhắn",
      path: "/chat",
      // badge: 3,
    },
    {
      id: "call-history",
      icon: Phone,
      label: "Lịch sử cuộc gọi",
      path: "/call-history",
    },
    // {
    //   id: "groups",
    //   icon: Users,
    //   label: "Nhóm chat",
    //   path: "/groups",
    //   badge: 1,
    // },
    {
      id: "invitations",
      icon: Mail,
      label: "Lời mời",
      path: "/invitations",
      // badge: 2,
    },
    {
      id: "discover",
      icon: Search,
      label: "Khám phá",
      path: "/discover",
    },
    {
      id: "communities",
      icon: Compass,
      label: "Cộng đồng",
      path: "/communities",
    },
  ];

  const settingsItems = [
    { id: "settings", icon: Settings, label: "Cài đặt", path: "/me" },
  ];

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;

    return (
      <Tooltip key={item.id} delayDuration={100}>
        <TooltipTrigger asChild>
          <Link
            href={item.path}
            className={cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105",
              isActive
                ? "bg-white/20 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-purple-600 text-white shadow-lg"
                : "text-white/80 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-slate-700/50"
            )}
          >
            <Icon className="h-5 w-5 transition-transform duration-200" />
            <span className="sr-only">{item.label}</span>
            {isActive && (
              <div className="absolute -right-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-purple-600" />
            )}
            {item.badge && item.badge > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-10 shadow-lg border border-red-600">
                {item.badge}
              </div>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 dark:bg-slate-800 border-slate-700 text-white font-medium"
        >
          <div className="text-center">
            <div className="font-semibold">{item.label}</div>
            {item.badge && item.badge > 0 && (
              <div className="text-xs text-slate-300 mt-1">
                {item.badge} thông báo mới
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderSectionHeader = (title: string, icon: React.ElementType) => {
    // Always return null since we want minimal sidebar with only icons
    return null;
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed left-0 top-0 flex flex-col h-screen overflow-hidden z-50 transition-all duration-300 group",
          // Always minimal width - only icons and numbers
          "w-16",
          // Cyan-to-purple gradient for light mode, dark slate for dark mode
          "bg-gradient-to-b from-cyan-500 to-purple-600 dark:from-slate-900 dark:to-slate-800 backdrop-blur-md border-r border-cyan-400/30 dark:border-slate-700/50 shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header với Logo */}
          <div className="flex-shrink-0 p-3 flex items-center justify-center">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/">
                  <img
                    src="/favicon.ico"
                    alt="FastBite Group"
                    className="h-8 w-8 rounded"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-800 border-slate-700 text-white"
              >
                <div className="text-center">
                  <div className="font-semibold text-lg">FastBite Group</div>
                  <div className="text-xs text-slate-300 mt-1">
                    Nền tảng trò chuyện
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-cyan-400/30 mb-4" />

          {/* Navigation Items */}
          <ScrollArea className="flex-1 scrollbar-hide">
            <div className="px-3 pt-2 space-y-2">
              {/* Main Navigation */}
              {navigationItems.map((item) =>
                renderNavItem(item, currentNavItem === item.id)
              )}

              {/* Separator */}
              <div className="my-4 border-t border-white/20 dark:border-white/10" />

              {/* Settings Navigation */}
              {settingsItems.map((item) =>
                renderNavItem(item, currentNavItem === item.id)
              )}
            </div>
          </ScrollArea>

          {/* Bottom Controls */}
          <div className="flex-shrink-0 p-3 pt-2">
            <div className="space-y-2">
              {/* Theme Toggle */}
              <ThemeToggleCustomer />

              {/* Notification Bell */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* User Profile */}
              <UserCustomerNavSidebar />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
