"use client";

import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import {
  lookupWarranty,
  logWarrantyClaim,
  updateWarrantyClaim,
  type WarrantyLookupResult,
} from "@/lib/actions/warranty";

const CLAIM_STATUSES = ["PENDING", "IN_REPAIR", "REPLACED", "RESOLVED", "REJECTED"] as const;

export function WarrantyLookup() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<WarrantyLookupResult | null | undefined>(undefined);
  const [issueDescription, setIssueDescription] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  function runLookup() {
    startSearch(async () => {
      const r = await lookupWarranty(query);
      setResult(r);
    });
  }

  function refresh() {
    startSearch(async () => {
      const r = await lookupWarranty(query);
      setResult(r);
    });
  }

  function submitClaim() {
    if (!result || !issueDescription.trim()) return;
    startSubmit(async () => {
      await logWarrantyClaim({ unitId: result.unitId, issueDescription });
      setIssueDescription("");
      refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runLookup()}
            placeholder="Enter serial number..."
            className="w-full rounded-md border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-white/15 dark:bg-black"
          />
        </div>
        <button
          onClick={runLookup}
          disabled={!query.trim() || isSearching}
          className="rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isSearching ? <Loader2 className="animate-spin" size={16} /> : "Look up"}
        </button>
      </div>

      {result === null && (
        <p className="text-sm text-black/50 dark:text-white/50">No unit found with that serial number.</p>
      )}

      {result && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-black">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-bold">{result.brand} {result.productName}</p>
                <p className="font-mono text-xs text-black/50 dark:text-white/50">SN: {result.serialNumber}</p>
                {result.supplierName && (
                  <p className="text-xs text-black/50 dark:text-white/50">Supplier: {result.supplierName}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/60 dark:bg-white/10 dark:text-white/60">
                {result.status.replace("_", " ")}
              </span>
            </div>

            {result.sale ? (
              <div className="border-t border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Invoice</p>
                    <p className="font-mono text-base font-bold">{result.sale.invoiceNumber}</p>
                    {result.sale.vehicleNumber && (
                      <p className="mt-1 text-xs text-black/50 dark:text-white/50">Vehicle: {result.sale.vehicleNumber}</p>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      result.sale.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    )}
                  >
                    Warranty {result.sale.isActive ? "Active" : "Expired"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Customer</p>
                    <p className="font-medium">{result.sale.customerName}</p>
                    <p className="text-xs text-black/50 dark:text-white/50">{result.sale.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Sale price</p>
                    <p className="font-medium">Rs. {result.sale.salePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Purchase date</p>
                    <p>{new Date(result.sale.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">Warranty until</p>
                    <p>{new Date(result.sale.warrantyExpiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="border-t border-black/10 p-4 text-sm text-amber-600 dark:border-white/10">
                This unit has not been sold yet — no warranty on file.
              </p>
            )}
          </div>

          {result.sale && (
            <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
              <h3 className="mb-2 text-sm font-bold">Log for repair / replacement</h3>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={3}
                placeholder="Describe the reported issue..."
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
              />
              <button
                onClick={submitClaim}
                disabled={!issueDescription.trim() || isSubmitting}
                className="mt-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-black"
              >
                Log claim
              </button>
            </div>
          )}

          {result.claims.length > 0 && (
            <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
              <h3 className="mb-2 text-sm font-bold">Claim history</h3>
              <ul className="space-y-3">
                {result.claims.map((c) => (
                  <li key={c.id} className="border-t border-black/10 pt-3 first:border-t-0 first:pt-0 dark:border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm">{c.issueDescription}</p>
                        <p className="text-xs text-black/40 dark:text-white/40">{new Date(c.dateClaimed).toLocaleString()}</p>
                      </div>
                      <select
                        defaultValue={c.status}
                        onChange={(e) =>
                          startSubmit(async () => {
                            await updateWarrantyClaim({ claimId: c.id, status: e.target.value as (typeof CLAIM_STATUSES)[number] });
                            refresh();
                          })
                        }
                        className="rounded-md border border-black/15 bg-transparent px-2 py-1 text-xs dark:border-white/15"
                      >
                        {CLAIM_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
