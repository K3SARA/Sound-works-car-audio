"use client";

import { useActionState, useState } from "react";
import { clsx } from "clsx";
import { addInventoryUnits, generateInventoryUnits, type ActionResult } from "@/lib/actions/inventory";

const initialState: ActionResult = {};

export function AddSerialsForm({ productId }: { productId: string }) {
  const [mode, setMode] = useState<"serials" | "quantity">("serials");
  const [serialsState, serialsAction, isAddingSerials] = useActionState(addInventoryUnits, initialState);
  const [quantityState, quantityAction, isGenerating] = useActionState(generateInventoryUnits, initialState);

  const state = mode === "serials" ? serialsState : quantityState;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("serials")}
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            mode === "serials" ? "bg-red-600 text-white" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          )}
        >
          Enter serial numbers
        </button>
        <button
          type="button"
          onClick={() => setMode("quantity")}
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            mode === "quantity" ? "bg-red-600 text-white" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          )}
        >
          No serial numbers — generate by quantity
        </button>
      </div>

      {mode === "serials" ? (
        <form action={serialsAction} className="space-y-2">
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
          <button disabled={isAddingSerials} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
            {isAddingSerials ? "Adding..." : "Add serial numbers"}
          </button>
        </form>
      ) : (
        <form action={quantityAction} className="space-y-2">
          <input type="hidden" name="productId" value={productId} />
          <p className="text-xs text-black/50 dark:text-white/50">
            For stock with no manufacturer serial (cables, hardware, accessories) — each unit still gets its own
            shop-assigned ID, so it&apos;s tracked and sellable exactly like any serialized item.
          </p>
          <input
            name="quantity"
            type="number"
            min="1"
            max="500"
            required
            placeholder="Quantity received"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
          <div className="flex gap-2">
            <input name="location" placeholder="Shelf / bin location" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
            <input name="costPrice" type="number" step="0.01" min="0" placeholder="Cost price" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          </div>
          <button disabled={isGenerating} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
            {isGenerating ? "Adding..." : "Add units"}
          </button>
        </form>
      )}

      {state.error && <p className="text-xs text-amber-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">{state.success}</p>}
    </div>
  );
}
