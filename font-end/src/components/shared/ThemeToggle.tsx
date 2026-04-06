// components/shared/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Tránh hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="h-9 w-9 rounded-lg bg-accent/50 animate-pulse"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg relative overflow-hidden group hover:bg-accent/80 hover:shadow-sm transition-all duration-200 hover:scale-105 border border-border/40 hover:border-border/60"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Theme icons with smooth transitions */}
          <div className="relative z-10">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover/95 backdrop-blur-md border border-border/60 shadow-xl rounded-lg p-1"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Chọn theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />

        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`
            group relative flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-accent/80 focus:bg-accent/80 text-sm
            ${
              theme === "light"
                ? "bg-accent/60 text-accent-foreground font-medium"
                : "text-foreground"
            }
          `}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-200 dark:to-amber-300 group-hover:scale-110 transition-transform duration-200">
            <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-700" />
          </div>
          <div>
            <div className="font-medium">Sáng</div>
            <div className="text-xs text-muted-foreground">Giao diện sáng</div>
          </div>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`
            group relative flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-accent/80 focus:bg-accent/80 text-sm
            ${
              theme === "dark"
                ? "bg-accent/60 text-accent-foreground font-medium"
                : "text-foreground"
            }
          `}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 group-hover:scale-110 transition-transform duration-200">
            <Moon className="h-3.5 w-3.5 text-slate-200" />
          </div>
          <div>
            <div className="font-medium">Tối</div>
            <div className="text-xs text-muted-foreground">Giao diện tối</div>
          </div>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`
            group relative flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-accent/80 focus:bg-accent/80 text-sm
            ${
              theme === "system"
                ? "bg-accent/60 text-accent-foreground font-medium"
                : "text-foreground"
            }
          `}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-200 dark:to-blue-300 group-hover:scale-110 transition-transform duration-200">
            <Monitor className="h-3.5 w-3.5 text-blue-600 dark:text-blue-700" />
          </div>
          <div>
            <div className="font-medium">Hệ thống</div>
            <div className="text-xs text-muted-foreground">Theo hệ thống</div>
          </div>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
