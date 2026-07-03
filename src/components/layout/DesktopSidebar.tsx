"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileBarChart, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { BUSINESS } from "@/lib/business";
import { Logo } from "@/components/layout/Logo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/warranty", label: "Warranty Claims", icon: ShieldCheck },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex w-60 shrink-0 flex-col border-r border-black/10 bg-white dark:border-white/10 dark:bg-black">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Logo className="h-9 w-auto" />
        <div>
          <p className="text-sm font-bold leading-tight">{BUSINESS.name}</p>
          <p className="mt-0.5 text-[11px] text-black/50 dark:text-white/50">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-red-600 text-white"
                  : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
