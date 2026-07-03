"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { getCategories } from "@/lib/actions/catalog";

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (category: string | null) => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      <button
        onClick={() => onChange(null)}
        className={clsx(
          "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
          selected === null
            ? "bg-red-600 text-white"
            : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c === selected ? null : c)}
          className={clsx(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            selected === c
              ? "bg-red-600 text-white"
              : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
