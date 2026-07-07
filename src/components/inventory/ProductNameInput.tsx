"use client";

import { useEffect, useState } from "react";
import { getProductNames } from "@/lib/actions/catalog";

export function ProductNameInput() {
  const [names, setNames] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getProductNames().then(setNames);
  }, []);

  const q = value.trim().toLowerCase();
  const matches = q ? names.filter((n) => n.toLowerCase().includes(q)).slice(0, 8) : [];

  return (
    <div className="relative">
      <input
        name="name"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Name (e.g. TS-A1670F)"
        required
        autoComplete="off"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
      />

      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-black/15 bg-white text-sm shadow-md dark:border-white/15 dark:bg-black">
          {matches.map((n) => (
            <li key={n}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(n);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
