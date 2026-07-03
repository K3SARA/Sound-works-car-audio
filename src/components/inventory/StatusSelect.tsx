"use client";

import { useTransition } from "react";
import { updateUnitStatus } from "@/lib/actions/inventory";

const STATUS_OPTIONS = ["IN_STOCK", "IN_REPAIR", "RETIRED"] as const;

export function StatusSelect({
  unitId,
  productId,
  status,
}: {
  unitId: string;
  productId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updateUnitStatus(unitId, productId, e.target.value as "IN_STOCK" | "IN_REPAIR" | "RETIRED");
        })
      }
      className="rounded-md border border-black/15 bg-transparent px-2 py-1 text-xs disabled:opacity-50 dark:border-white/15"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
