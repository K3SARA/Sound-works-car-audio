"use client";

import { useActionState } from "react";
import { addInventoryUnits, type ActionResult } from "@/lib/actions/inventory";

const initialState: ActionResult = {};

export function AddSerialsForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(addInventoryUnits, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <textarea
        name="serialNumbers"
        required
        rows={4}
        placeholder="One serial number per line"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
      />
      <div className="flex gap-2">
        <input name="location" placeholder="Shelf / bin location" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
        <input name="costPrice" type="number" step="0.01" min="0" placeholder="Cost price" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      </div>

      {state.error && <p className="text-xs text-amber-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">{state.success}</p>}

      <button disabled={isPending} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {isPending ? "Adding..." : "Add serial numbers"}
      </button>
    </form>
  );
}
