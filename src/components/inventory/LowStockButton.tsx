"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { LowStockProduct } from "@/lib/actions/inventory";

export function LowStockButton({ items }: { items: LowStockProduct[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Low stock alerts"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
      >
        <AlertTriangle size={20} />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {items.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-amber-300 bg-white p-3 shadow-lg dark:border-amber-900 dark:bg-black">
            <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-400">
              {items.length} item{items.length === 1 ? "" : "s"} running low on stock
            </p>
            <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
              {items.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-black/70 dark:text-white/70">
                  <span>
                    {p.brand} {p.name}
                  </span>
                  <span className="shrink-0 font-medium text-amber-700 dark:text-amber-400">
                    {p.inStock === 0 ? "Out of stock" : `${p.inStock} left`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
