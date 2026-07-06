"use client";

import { useActionState } from "react";
import { recordPayment } from "@/lib/actions/pos";

const initialState: { error?: string; success?: string } = {};

export function RecordPaymentForm({ invoiceId, balanceDue }: { invoiceId: string; balanceDue: number }) {
  const [state, formAction, isPending] = useActionState(recordPayment, initialState);

  return (
    <div className="no-print rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-amber-800 dark:text-amber-400">Credit sale — balance due</h2>
        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Rs. {balanceDue.toFixed(2)}</p>
      </div>
      <form action={formAction} className="mt-3 flex gap-2">
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          max={balanceDue}
          required
          placeholder="Payment amount (Rs.)"
          className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        <button disabled={isPending} className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          {isPending ? "Recording..." : "Record payment"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="mt-2 text-xs text-green-600">{state.success}</p>}
    </div>
  );
}
