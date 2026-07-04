"use client";

import { useEffect, useState } from "react";
import { getSuppliers, type SupplierOption } from "@/lib/actions/supplier";

export function SupplierCombobox() {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getSuppliers().then(setSuppliers);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (q ? suppliers.filter((s) => s.name.toLowerCase().includes(q)) : suppliers).slice(0, 8);
  const isNew = selectedId === null && query.trim().length > 0;

  function selectSupplier(s: SupplierOption) {
    setSelectedId(s.id);
    setQuery(s.name);
    setOpen(false);
  }

  function handleChange(value: string) {
    setQuery(value);
    setSelectedId(null);
    setOpen(true);
  }

  return (
    <div className="border-t border-black/10 pt-2 dark:border-white/10">
      <label className="text-xs font-medium text-black/60 dark:text-white/60">Supplier</label>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type to search or add a supplier..."
          name={selectedId ? undefined : "newSupplierName"}
          required={!selectedId}
          autoComplete="off"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        <input type="hidden" name="supplierId" value={selectedId ?? ""} />

        {open && matches.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-black/15 bg-white text-sm shadow-md dark:border-white/15 dark:bg-black">
            {matches.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSupplier(s)}
                  className="block w-full px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isNew && (
        <div className="mt-2 space-y-2">
          <p className="text-[11px] text-black/50 dark:text-white/50">
            No matching supplier — this will add &quot;{query.trim()}&quot; as a new one.
          </p>
          <input name="newSupplierAddress" placeholder="Supplier address" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="newSupplierPhone" placeholder="Supplier mobile number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
        </div>
      )}
    </div>
  );
}
