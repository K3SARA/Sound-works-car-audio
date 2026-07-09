"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileBarChart, ShieldCheck, Truck, ShoppingCart, X } from "lucide-react";
import { clsx } from "clsx";
import { BUSINESS } from "@/lib/business";
import { Logo } from "@/components/layout/Logo";
import { useSidebar } from "@/components/layout/SidebarProvider";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "Billing", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/warranty", label: "Warranty Claims", icon: ShieldCheck },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Overlay backdrop — visible when sidebar is open, click to close */}
      <div
        className={clsx(
          "no-print fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "no-print fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-black/10 bg-white transition-transform duration-300 ease-in-out dark:border-white/10 dark:bg-black",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-auto" />
            <div>
              <p className="text-sm font-bold leading-tight">{BUSINESS.name}</p>
              <p className="mt-0.5 text-[11px] text-black/50 dark:text-white/50">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close sidebar"
            className="rounded-md p-1 text-black/40 hover:bg-black/5 hover:text-black/70 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
    </>
  );
}
