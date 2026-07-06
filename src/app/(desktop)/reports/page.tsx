import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInvoiceNumber } from "@/lib/invoice-number";
import { DeleteInvoiceButton } from "@/components/reports/DeleteInvoiceButton";

async function getInvoices() {
  return prisma.invoice.findMany({
    include: { items: { include: { inventoryUnit: { include: { product: true } } } }, createdBy: true },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export default async function ReportsPage() {
  const invoices = await getInvoices();
  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + Math.max(Number(i.totalAmount) - Number(i.amountPaid), 0), 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Sales History</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {invoices.length} invoices · Rs. {totalRevenue.toFixed(2)} total
          {totalOutstanding > 0 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">· Rs. {totalOutstanding.toFixed(2)} outstanding</span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => {
          const balanceDue = Math.max(Number(inv.totalAmount) - Number(inv.amountPaid), 0);
          return (
          <div key={inv.id} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/reports/${inv.id}`} className="text-sm font-bold text-red-600 hover:underline">
                    {formatInvoiceNumber(inv.sequence)}
                  </Link>
                  {balanceDue > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      Rs. {balanceDue.toFixed(2)} due
                    </span>
                  )}
                </div>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {inv.customerName} · {inv.customerPhone} · {inv.date.toLocaleDateString()}
                  {inv.vehicleNumber ? ` · Vehicle: ${inv.vehicleNumber}` : ""}
                </p>
                {inv.createdBy && (
                  <p className="text-xs text-black/40 dark:text-white/40">Sold by {inv.createdBy.name}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold">Rs. {Number(inv.totalAmount).toFixed(2)}</p>
                <DeleteInvoiceButton invoiceId={inv.id} />
              </div>
            </div>

            <ul className="mt-3 space-y-1 border-t border-black/10 pt-2 text-xs dark:border-white/10">
              {inv.items.map((item) => (
                <li key={item.id} className="flex justify-between text-black/70 dark:text-white/70">
                  <span>
                    {item.inventoryUnit.product.brand} {item.inventoryUnit.product.name} (SN: {item.inventoryUnit.serialNumber})
                  </span>
                  <span>Rs. {Number(item.salePrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          );
        })}

        {invoices.length === 0 && (
          <p className="py-10 text-center text-sm text-black/40">No sales recorded yet.</p>
        )}
      </div>
    </div>
  );
}
