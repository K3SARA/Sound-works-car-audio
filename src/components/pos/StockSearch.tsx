"use client";

import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { searchStock, type StockResult } from "@/lib/actions/stock";
import { CategoryFilter } from "@/components/pos/CategoryFilter";

const STATUS_STYLES: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  SOLD: "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
  IN_REPAIR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  RETIRED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function StockSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [results, setResults] = useState<StockResult[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [searched, setSearched] = useState(false);

  function runSearch(q: string, cat: string | null) {
    startSearch(async () => {
      const found = await searchStock(q, cat ?? undefined);
      setResults(found);
      setSearched(q.trim().length > 0 || cat !== null);
    });
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    runSearch(q, category);
  }

  function handleCategoryChange(cat: string | null) {
    setCategory(cat);
    runSearch(query, cat);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Scan serial number or search product..."
          autoFocus
          className="w-full rounded-md border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-white/15 dark:bg-black"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-black/40" size={16} />
        )}
      </div>

      <CategoryFilter selected={category} onChange={handleCategoryChange} />

      {searched && !isSearching && results.length === 0 && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">No matching items found.</p>
      )}

      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.serialNumber} className="rounded-md border border-black/10 p-3 dark:border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{r.brand} {r.productName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">SN: {r.serialNumber} · {r.sku}</p>
              </div>
              <span className={clsx("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[r.status])}>
                {r.status.replace("_", " ")}
              </span>
            </div>
            {(r.location || r.sellingPrice) && (
              <p className="mt-1.5 text-xs text-black/60 dark:text-white/60">
                {r.location ? `Location: ${r.location}` : ""}
                {r.location && r.sellingPrice ? " · " : ""}
                {r.sellingPrice ? `Rs. ${r.sellingPrice.toFixed(2)}` : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
