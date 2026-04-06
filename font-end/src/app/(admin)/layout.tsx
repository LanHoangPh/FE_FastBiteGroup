// app/(admin)/layout.tsx
"use client";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Crown,
} from "lucide-react";

import { AdminSidebarNav } from "@/layout/admin/AdminSidebarNav";
import { UserNav } from "@/components/shared/UserNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import { SearchButton } from "@/components/shared/SearchButton";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { SignalRProvider } from "@/providers/SignalRProvider";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <SignalRProvider>
      <div
        className={cn(
          "grid h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out bg-background",
          isSidebarCollapsed
            ? "md:grid-cols-[70px_1fr]"
            : "md:grid-cols-[280px_1fr]"
        )}
      >
        {/* --- Enhanced Sidebar for Desktop --- */}
        <aside className="hidden border-r bg-gradient-to-b from-card via-card/95 to-muted/40 md:block shadow-sm sticky top-0">
          <div className="flex h-screen flex-col">
            {/* Logo Section with improved styling */}
            <div className="flex h-16 items-center border-b border-border/60 px-4 lg:px-6 bg-card/50 backdrop-blur-sm">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 font-semibold transition-all duration-300 group",
                  isSidebarCollapsed && "justify-center"
                )}
              >
                <div className="relative">
                  <MessageCircle className="h-7 w-7 text-primary shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <Crown className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
                </div>
                <span
                  className={cn(
                    "transition-all duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent font-bold",
                    isSidebarCollapsed
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100"
                  )}
                >
                  FastBite Admin
                </span>
              </Link>
            </div>

            {/* Sidebar Navigation - Fixed position */}
            <div className="flex-1">
              <AdminSidebarNav isCollapsed={isSidebarCollapsed} />
            </div>

            {/* Sidebar Footer */}
            <div
              className={cn(
                "border-t border-border/60 p-4 bg-card/30",
                isSidebarCollapsed && "px-2"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground",
                  isSidebarCollapsed && "justify-center"
                )}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span
                  className={cn(
                    "transition-opacity duration-300",
                    isSidebarCollapsed && "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  System Online
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <div className="flex flex-col h-screen min-h-0">
          {/* Enhanced Header */}
          <header className="flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 lg:px-6 shadow-sm">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden h-9 w-9 hover:bg-accent transition-colors"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex flex-col p-0 bg-gradient-to-b from-card to-muted/40"
              >
                <div className="flex h-16 items-center border-b border-border/60 px-4 bg-card/50">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 font-semibold group"
                  >
                    <div className="relative">
                      <MessageCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      <Crown className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent font-bold">
                      FastBite Admin
                    </span>
                  </Link>
                </div>
                <div className="py-2 flex-1">
                  <AdminSidebarNav isCollapsed={false} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sidebar Toggle for Desktop */}
            <Button
              onClick={toggleSidebar}
              size="icon"
              variant="ghost"
              className="h-9 w-9 hidden md:flex hover:bg-accent transition-colors"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>

            {/* Search Button */}
            <SearchButton />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationDropdown />

              {/* Admin Badge */}
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 transition-colors font-medium px-3 py-1 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300 dark:border-emerald-800"
              >
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>

              <UserNav />
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/20 to-muted/40 min-h-0">
            <div className="p-4 lg:p-6">
              <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-none">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </SignalRProvider>
  );
}
