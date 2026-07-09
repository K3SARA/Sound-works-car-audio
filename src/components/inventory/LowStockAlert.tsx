"use client";

import { useState, useSyncExternalStore } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { LowStockProduct } from "@/lib/actions/inventory";

const STORAGE_KEY = "lowStockAlertDismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}
function getServerSnapshot() {
  return null;
}

/** Dismissal persists in localStorage, keyed by the exact set of low-stock product ids —
 * so closing it stays closed on refresh/nav, but it reappears the moment the set changes
 * (a new item drops low, or one gets restocked and drops off the list). */
export function LowStockAlert({ items }: { items: LowStockProduct[] }) {
  const currentKey = items.map((p) => p.id).sort().join(",");
  const persistedDismissedKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [locallyDismissedKey, setLocallyDismissedKey] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const dismissedKey = locallyDismissedKey ?? persistedDismissedKey;

  if (items.length === 0 || currentKey === dismissedKey) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, currentKey);
    setLocallyDismissedKey(currentKey);
  }

  return (
    <div className="relative rounded-lg border border-amber-300 bg-amber-50 p-4 pr-9 dark:border-amber-900 dark:bg-amber-950/40">
      <button
        onClick={dismiss}
        aria-label="Dismiss low stock alert"
        className="absolute right-2 top-2 rounded p-1 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-200"
      >
        <X size={16} />
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-amber-800 dark:text-amber-400">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          <p className="text-sm font-semibold">
            {items.length} item{items.length === 1 ? "" : "s"} running low on stock
          </p>
        </div>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-medium underline hover:text-amber-900 dark:hover:text-amber-200"
        >
          {isExpanded ? "Hide details" : "Show details"}
        </button>
      </div>
      {isExpanded && (
        <ul className="mt-3 max-h-40 overflow-y-auto border-t border-amber-200/50 pt-2 space-y-1 text-xs text-amber-800 dark:border-amber-800/30 dark:text-amber-400">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3">
              <span>
                {p.brand} {p.name}
              </span>
              <span className="shrink-0 font-medium">{p.inStock === 0 ? "Out of stock" : `${p.inStock} left`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
