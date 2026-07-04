"use client";

import { useActionState } from "react";
import { updateProduct, type ActionResult } from "@/lib/actions/inventory";
import { SupplierCombobox } from "@/components/inventory/SupplierCombobox";

const initialState: ActionResult = {};

export function EditProductForm({
  product,
}: {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    sku: string;
    warrantyMonths: number;
    supplierId: string | null;
    supplierName: string;
  };
}) {
  const boundAction = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input name="name" defaultValue={product.name} placeholder="Name" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="brand" defaultValue={product.brand} placeholder="Brand" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="category" defaultValue={product.category} placeholder="Category" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="sku" defaultValue={product.sku} placeholder="Model Number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
      <input name="warrantyMonths" type="number" min="0" defaultValue={product.warrantyMonths} placeholder="Warranty (months)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />

      <SupplierCombobox initialSupplierId={product.supplierId} initialSupplierName={product.supplierName} />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button disabled={isPending} className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-40">
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
