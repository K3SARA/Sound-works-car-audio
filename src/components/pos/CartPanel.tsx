"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Search, Trash2, Loader2, CheckCircle2, Printer, MessageCircle } from "lucide-react";
import { searchAvailableUnits, checkoutInvoice, type AvailableUnit } from "@/lib/actions/pos";
import { CategoryFilter } from "@/components/pos/CategoryFilter";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { BUSINESS } from "@/lib/business";

type CartLine = AvailableUnit & { salePrice: string };

function buildInvoiceMessage(args: {
  invoiceNumber: string;
  items: CartLine[];
  total: number;
  balanceDue: number;
}): string {
  const lines = [
    `*${BUSINESS.name}*`,
    `Invoice: ${args.invoiceNumber}`,
    "",
    ...args.items.map((i) => `• ${i.brand} ${i.productName} — Rs. ${(Number(i.salePrice) || 0).toFixed(2)}`),
    "",
    `Total: Rs. ${args.total.toFixed(2)}`,
  ];
  if (args.balanceDue > 0.005) {
    lines.push(`Balance due: Rs. ${args.balanceDue.toFixed(2)}`);
  }
  lines.push("", "Thank you for shopping with us!");
  return lines.join("\n");
}

export function CartPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [results, setResults] = useState<AvailableUnit[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [balanceDue, setBalanceDue] = useState(0);
  const [completedPhone, setCompletedPhone] = useState("");
  const [completedItems, setCompletedItems] = useState<CartLine[]>([]);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isCheckingOut, startCheckout] = useTransition();

  function runSearch(q: string, cat: string | null) {
    setError(null);
    startSearch(async () => {
      const found = await searchAvailableUnits(q, cat ?? undefined);
      setResults(found.filter((r) => !cart.some((c) => c.unitId === r.unitId)));
    });
  }

  // Browse the default (unfiltered) list on first load, same as picking "All".
  useEffect(() => {
    startSearch(async () => {
      const found = await searchAvailableUnits("", undefined);
      setResults(found);
    });
  }, []);

  function handleQueryChange(q: string) {
    setQuery(q);
    runSearch(q, category);
  }

  function handleCategoryChange(cat: string | null) {
    setCategory(cat);
    runSearch(query, cat);
  }

  function addToCart(unit: AvailableUnit) {
    setCart((prev) => [...prev, { ...unit, salePrice: unit.sellingPrice ? String(unit.sellingPrice) : "" }]);
    setResults((prev) => prev.filter((r) => r.unitId !== unit.unitId));
  }

  function removeFromCart(unitId: string) {
    setCart((prev) => prev.filter((c) => c.unitId !== unitId));
  }

  function updatePrice(unitId: string, salePrice: string) {
    setCart((prev) => prev.map((c) => (c.unitId === unitId ? { ...c, salePrice } : c)));
  }

  function updateWarranty(unitId: string, warrantyMonths: number) {
    setCart((prev) => prev.map((c) => (c.unitId === unitId ? { ...c, warrantyMonths } : c)));
  }

  const total = cart.reduce((sum, c) => sum + (Number(c.salePrice) || 0), 0);
  const hasWarrantyItem = cart.some((c) => c.warrantyMonths > 0);
  const requiresCustomerInfo = hasWarrantyItem || isCredit;
  const amountPaidNow = isCredit ? Number(amountPaidInput) || 0 : total;
  const creditBalance = Math.max(total - amountPaidNow, 0);
  const canCheckout =
    cart.length > 0 &&
    (!requiresCustomerInfo || (customerName.trim().length > 0 && customerPhone.trim().length > 0)) &&
    cart.every((c) => Number(c.salePrice) > 0);

  function submitCheckout() {
    setError(null);
    startCheckout(async () => {
      try {
        const result = await checkoutInvoice({
          customerName,
          customerPhone,
          vehicleNumber: vehicleNumber.trim() || undefined,
          amountPaid: isCredit ? amountPaidNow : undefined,
          items: cart.map((c) => ({
            unitId: c.unitId,
            salePrice: Number(c.salePrice),
            warrantyMonths: c.warrantyMonths,
          })),
        });
        setInvoiceNumber(result.invoiceNumber);
        setInvoiceId(result.invoiceId);
        setBalanceDue(result.balanceDue);
        setCompletedPhone(customerPhone.trim());
        setCompletedItems(cart);
        setCompletedTotal(total);
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setVehicleNumber("");
        setIsCredit(false);
        setAmountPaidInput("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      }
    });
  }

  if (invoiceNumber && invoiceId) {
    const whatsAppLink = buildWhatsAppLink(
      completedPhone,
      buildInvoiceMessage({ invoiceNumber, items: completedItems, total: completedTotal, balanceDue })
    );

    return (
      <div className="rounded-lg border border-black/10 bg-white p-6 text-center dark:border-white/10 dark:bg-black">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle2 className="text-green-600 dark:text-green-400" size={26} />
        </div>
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">Invoice created</p>
        <p className="mt-1 font-mono text-xl font-bold">{invoiceNumber}</p>
        {balanceDue > 0 && (
          <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            Credit sale — Rs. {balanceDue.toFixed(2)} still due
          </p>
        )}

        <Link
          href={`/pos/invoice/${invoiceId}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-md border border-black/15 py-2.5 text-sm font-semibold text-black/80 dark:border-white/15 dark:text-white/80"
        >
          <Printer size={16} />
          Preview & print invoice
        </Link>

        {whatsAppLink && (
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#25D366] py-2.5 text-sm font-semibold text-white"
          >
            <MessageCircle size={16} />
            Send bill via WhatsApp
          </a>
        )}

        <button
          onClick={() => {
            setInvoiceNumber(null);
            setInvoiceId(null);
          }}
          className="mt-2 w-full rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white"
        >
          New sale
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Scan serial number or search product..."
          autoFocus
          className="w-full rounded-md border border-black/15 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-white/15 dark:bg-black"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-black/40" size={16} />
        )}
      </div>

      <CategoryFilter selected={category} onChange={handleCategoryChange} />

      {results.length > 0 && (
        <ul className="divide-y divide-black/10 rounded-md border border-black/10 dark:divide-white/10 dark:border-white/10">
          {results.map((r) => (
            <li key={r.unitId} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{r.brand} {r.productName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  SN: {r.serialNumber} {r.location ? `· ${r.location}` : ""}
                  {r.sellingPrice ? ` · Rs. ${r.sellingPrice.toFixed(2)}` : ""}
                </p>
              </div>
              <button
                onClick={() => addToCart(r)}
                className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-black"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        {cart.map((c) => (
          <div key={c.unitId} className="rounded-md border border-black/10 p-3 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{c.brand} {c.productName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">SN: {c.serialNumber}</p>
              </div>
              <button onClick={() => removeFromCart(c.unitId)} className="text-black/40">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={c.salePrice}
                onChange={(e) => updatePrice(c.unitId, e.target.value)}
                placeholder="Sale price"
                className="w-1/2 rounded-md border border-black/15 px-2 py-1.5 text-sm dark:border-white/15 dark:bg-black"
              />
              <input
                type="number"
                min="0"
                value={c.warrantyMonths}
                onChange={(e) => updateWarranty(c.unitId, Number(e.target.value))}
                placeholder="Warranty (months)"
                className="w-1/2 rounded-md border border-black/15 px-2 py-1.5 text-sm dark:border-white/15 dark:bg-black"
              />
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="space-y-2 rounded-md border border-black/10 p-3 dark:border-white/10">
          <p className="text-xs text-black/50 dark:text-white/50">
            {requiresCustomerInfo
              ? `Customer name & phone are required — ${isCredit ? "this is a credit sale" : "this sale includes a warrantied item"}.`
              : "Customer name & phone are optional — no warranty items in this sale."}
          </p>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={requiresCustomerInfo ? "Customer name" : "Customer name (optional)"}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder={requiresCustomerInfo ? "Customer phone" : "Customer phone (optional)"}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
          <input
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="Vehicle number (optional)"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />

          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsCredit(false)}
              className={clsx(
                "flex-1 rounded-md py-1.5 text-xs font-semibold",
                !isCredit ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
              )}
            >
              Paid in full
            </button>
            <button
              type="button"
              onClick={() => setIsCredit(true)}
              className={clsx(
                "flex-1 rounded-md py-1.5 text-xs font-semibold",
                isCredit ? "bg-amber-500 text-white" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
              )}
            >
              Credit sale
            </button>
          </div>

          {isCredit && (
            <input
              type="number"
              min="0"
              step="0.01"
              max={total}
              value={amountPaidInput}
              onChange={(e) => setAmountPaidInput(e.target.value)}
              placeholder="Amount received now (Rs.) — leave blank if none"
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
            />
          )}

          <div className="flex items-center justify-between pt-1 text-sm font-semibold">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
          {isCredit && (
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
              <span>Balance due</span>
              <span>Rs. {creditBalance.toFixed(2)}</span>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            disabled={!canCheckout || isCheckingOut}
            onClick={submitCheckout}
            className="w-full rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isCheckingOut ? "Processing..." : "Complete sale & generate invoice"}
          </button>
        </div>
      )}
    </div>
  );
}
