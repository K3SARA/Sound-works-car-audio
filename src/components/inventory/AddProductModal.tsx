"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AddProductForm } from "@/components/inventory/AddProductForm";

export function AddProductModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
      >
        <Plus size={16} />
        Add product
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12 sm:pt-20">
          <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">Add product</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <AddProductForm />
          </div>
        </div>
      )}
    </>
  );
}
