"use client";

import { useActionState, useState } from "react";
import { createProduct, type ActionResult } from "@/lib/actions/inventory";
import { SupplierCombobox } from "@/components/inventory/SupplierCombobox";

const initialState: ActionResult = {};

export function AddProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, initialState);
  const [formKey, setFormKey] = useState(0);

  // A new `state` object is returned on every submit; when it flips to success,
  // reset the form (new key remounts it, which also re-fetches suppliers inside
  // SupplierCombobox). Done during render, per React's guidance, rather than as
  // a side effect keyed on `state`.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setFormKey((k) => k + 1);
  }

  return (
    <form key={formKey} action={formAction} className="space-y-2">
      <input name="name" placeholder="Name (e.g. TS-A1670F)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="brand" placeholder="Brand (e.g. Pioneer)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="category" placeholder="Category (e.g. Speakers)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="sku" placeholder="Model Number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="sellingPrice" type="number" step="0.01" min="0" placeholder="Selling price (Rs.)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="warrantyMonths" type="number" min="0" placeholder="Warranty (months)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />

      <SupplierCombobox />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">{state.success}</p>}

      <button disabled={isPending} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {isPending ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
