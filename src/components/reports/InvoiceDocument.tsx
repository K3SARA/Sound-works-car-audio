import { Logo } from "@/components/layout/Logo";
import { BUSINESS } from "@/lib/business";

export type InvoiceDocumentData = {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  soldBy: string | null;
  items: {
    id: string;
    brand: string;
    productName: string;
    serialNumber: string;
    salePrice: number;
    warrantyMonths: number;
  }[];
};

/** A5 printable invoice — see .no-print / @page rules in globals.css for the print layout. */
export function InvoiceDocument({ invoice }: { invoice: InvoiceDocumentData }) {
  return (
    <div className="bg-white p-6 text-black print:p-0">
      <div className="flex items-start justify-between gap-4 border-b-2 border-black/80 pb-4">
        <div className="flex items-start gap-3">
          <Logo className="h-14 w-auto" />
          <div className="text-[11px] leading-snug text-black/70">
            <p className="text-sm font-bold text-black">{BUSINESS.name}</p>
            <p>{BUSINESS.address}</p>
            <p>{BUSINESS.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-wide">INVOICE</p>
          <p className="text-xs text-black/70">{invoice.invoiceNumber}</p>
          <p className="text-xs text-black/70">{invoice.date.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs">
        <div>
          <p className="font-semibold text-black/50">Bill To</p>
          <p className="font-medium">{invoice.customerName}</p>
          <p>{invoice.customerPhone}</p>
        </div>
        {invoice.soldBy && (
          <div className="text-right">
            <p className="font-semibold text-black/50">Sold By</p>
            <p>{invoice.soldBy}</p>
          </div>
        )}
      </div>

      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr className="border-y border-black/30 text-left">
            <th className="py-1.5 pr-2 font-semibold">Item</th>
            <th className="py-1.5 pr-2 font-semibold">Serial No.</th>
            <th className="py-1.5 pr-2 font-semibold">Warranty</th>
            <th className="py-1.5 text-right font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-black/10 align-top">
              <td className="py-1.5 pr-2">
                {item.brand} {item.productName}
              </td>
              <td className="py-1.5 pr-2 font-mono">{item.serialNumber}</td>
              <td className="py-1.5 pr-2">{item.warrantyMonths} mo</td>
              <td className="py-1.5 text-right">Rs. {item.salePrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex justify-end border-t border-black/30 pt-2">
        <div className="flex w-40 justify-between text-sm font-bold">
          <span>Total</span>
          <span>Rs. {invoice.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 space-y-1 text-[10px] text-black/50">
        <p>Please retain this invoice — it is required to claim warranty on any item listed above.</p>
        <p>Warranty period is counted from the invoice date shown above.</p>
      </div>
    </div>
  );
}
