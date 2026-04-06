"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { adminNavCommands } from "@/lib/utils/admin-nav-config";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, open, close } = useCommandPaletteStore();

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        open();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  // Function to run when an item is selected
  const runCommand = (command: () => unknown) => {
    close();
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput placeholder="Tìm kiếm trang hoặc lệnh..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
        <CommandGroup heading="Điều hướng">
          {adminNavCommands.map((nav) => (
            <CommandItem
              key={nav.href}
              value={`${nav.title} ${nav.keywords?.join(" ")}`}
              onSelect={() => runCommand(() => router.push(nav.href))}
            >
              <nav.icon className="mr-2 h-4 w-4" />
              <span>{nav.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
