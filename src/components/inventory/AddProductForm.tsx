"use client";

import { useActionState } from "react";
import { createProduct, type ActionResult } from "@/lib/actions/inventory";

const initialState: ActionResult = {};

export function AddProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input name="name" placeholder="Name (e.g. TS-A1670F)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="brand" placeholder="Brand (e.g. Pioneer)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="category" placeholder="Category (e.g. Speakers)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="sku" placeholder="Model Number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="warrantyMonths" type="number" min="0" placeholder="Warranty (months)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">{state.success}</p>}

      <button disabled={isPending} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {isPending ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
