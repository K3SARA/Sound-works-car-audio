"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarProvider";

export function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="rounded-md p-1.5 text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
    >
      <Menu size={20} />
    </button>
  );
}
