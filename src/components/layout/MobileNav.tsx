"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanBarcode, ShoppingCart } from "lucide-react";
import { clsx } from "clsx";

const TABS = [
  { href: "/pos", label: "Billing", icon: ShoppingCart },
  { href: "/stock", label: "Stock Check", icon: ScanBarcode },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print grid grid-cols-2 border-t border-black/10 bg-white dark:border-white/10 dark:bg-black">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
              active ? "text-red-600" : "text-black/50 dark:text-white/50"
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
