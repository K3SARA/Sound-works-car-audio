"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct, type ActionResult } from "@/lib/actions/inventory";
import { getSuppliers, type SupplierOption } from "@/lib/actions/supplier";

const initialState: ActionResult = {};
const NEW_SUPPLIER = "";

export function AddProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, initialState);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [supplierId, setSupplierId] = useState(NEW_SUPPLIER);
  const [formKey, setFormKey] = useState(0);

  // A new `state` object is returned on every submit; when it flips to success,
  // reset the form (new key remounts it) and re-fetch suppliers so a supplier
  // created inline shows up as reusable next time. Done during render, per
  // React's guidance, rather than as a side effect keyed on `state`.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) {
      setFormKey((k) => k + 1);
      setSupplierId(NEW_SUPPLIER);
    }
  }

  useEffect(() => {
    getSuppliers().then(setSuppliers);
  }, [formKey]);

  return (
    <form key={formKey} action={formAction} className="space-y-2">
      <input name="name" placeholder="Name (e.g. TS-A1670F)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="brand" placeholder="Brand (e.g. Pioneer)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="category" placeholder="Category (e.g. Speakers)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="sku" placeholder="Model Number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="warrantyMonths" type="number" min="0" placeholder="Warranty (months)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />

      <div className="border-t border-black/10 pt-2 dark:border-white/10">
        <label className="text-xs font-medium text-black/60 dark:text-white/60">Supplier</label>
        <select
          name="supplierId"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        >
          <option value={NEW_SUPPLIER}>+ Add new supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {supplierId === NEW_SUPPLIER && (
          <div className="mt-2 space-y-2">
            <input name="newSupplierName" placeholder="Supplier name" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
            <input name="newSupplierAddress" placeholder="Supplier address" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
            <input name="newSupplierPhone" placeholder="Supplier mobile number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          </div>
        )}
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">{state.success}</p>}

      <button disabled={isPending} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {isPending ? "Adding..." : "Add product"}
      </button>
    </form>
  );
}
