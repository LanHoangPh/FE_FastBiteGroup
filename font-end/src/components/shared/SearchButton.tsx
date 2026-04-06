"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandPaletteStore } from "@/store/commandPaletteStore";

export function SearchButton() {
  const { open } = useCommandPaletteStore();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={open}
      className="h-9 w-9 p-0"
      title="Tìm kiếm (Ctrl+K)"
    >
      <Search className="h-4 w-4" />
      <span className="sr-only">Tìm kiếm</span>
    </Button>
  );
}
