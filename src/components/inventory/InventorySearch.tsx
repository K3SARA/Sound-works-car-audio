"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";
import { Search } from "lucide-react";

export function InventorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("search") ?? "";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search input on mount
  useEffect(() => {
    if (current && inputRef.current) {
      inputRef.current.focus();
    }
  }, [current]);

  function handleChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      router.replace(`/inventory?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
      <input
        ref={inputRef}
        defaultValue={current}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by product name, brand, or model number..."
        className="w-full rounded-md border border-black/15 bg-white py-2 pl-10 pr-3 text-sm dark:border-white/15 dark:bg-black"
      />
    </div>
  );
}
