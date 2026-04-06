// components/shared/ThemeToggleCustomer.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggleCustomer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Set system as default if no theme is set
  React.useEffect(() => {
    if (mounted && !theme) {
      setTheme("system");
    }
  }, [mounted, theme, setTheme]);

  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 dark:text-slate-400 animate-pulse">
        <Sun className="h-5 w-5" />
      </div>
    );
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const isLightMode = theme === "light";

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-lg text-white/80 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-slate-700/50 transition-all duration-200 group hover:scale-105"
    >
      <div className="relative">
        {/* Theme icons with smooth transitions */}
        <div className="relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </div>
      </div>
      <span className="sr-only">
        {isLightMode ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
      </span>
    </Button>
  );
}
