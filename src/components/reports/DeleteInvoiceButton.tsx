"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteInvoice } from "@/lib/actions/pos";

export function DeleteInvoiceButton({ invoiceId, redirectAfter }: { invoiceId: string; redirectAfter?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this invoice? Its sold item(s) will be returned to stock. This cannot be undone.")) return;
    startTransition(async () => {
      await deleteInvoice(invoiceId);
      if (redirectAfter) router.push(redirectAfter);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="no-print flex items-center gap-1.5 rounded-md border border-red-600/30 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/40"
    >
      <Trash2 size={14} />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
