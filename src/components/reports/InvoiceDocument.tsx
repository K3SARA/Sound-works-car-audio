import { Logo } from "@/components/layout/Logo";
import { BUSINESS } from "@/lib/business";

export type InvoiceDocumentData = {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string | null;
  totalAmount: number;
  amountPaid: number;
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
  const balanceDue = invoice.totalAmount - invoice.amountPaid;
  const isCredit = balanceDue > 0.005;

  // Group non-warranty items by brand + product name + salePrice (unit price)
  const groupedItems: {
    id: string;
    brand: string;
    productName: string;
    serialNumber: string;
    warrantyMonths: number;
    salePrice: number; // total price for this group
    qty: number;
  }[] = [];

  const nonWarrantyGroups: Record<string, typeof invoice.items> = {};

  for (const item of invoice.items) {
    if (item.warrantyMonths > 0) {
      groupedItems.push({
        ...item,
        qty: 1,
      });
    } else {
      const key = `${item.brand}-${item.productName}-${item.salePrice}`;
      if (!nonWarrantyGroups[key]) {
        nonWarrantyGroups[key] = [];
      }
      nonWarrantyGroups[key].push(item);
    }
  }

  for (const items of Object.values(nonWarrantyGroups)) {
    const firstItem = items[0];
    const totalGroupPrice = items.reduce((sum, item) => sum + item.salePrice, 0);
    groupedItems.push({
      id: firstItem.id,
      brand: firstItem.brand,
      productName: firstItem.productName,
      serialNumber: "—", // No serial numbers displayed for non-warranty items
      warrantyMonths: 0,
      salePrice: totalGroupPrice,
      qty: items.length,
    });
  }

  return (
    <div className="bg-white p-6 text-black print:p-0">
      <div className="flex items-start justify-between gap-4 border-b-2 border-red-600 pb-4">
        <div className="flex items-start gap-3">
          <Logo className="h-14 w-auto" />
          <div className="text-[11px] leading-snug text-black/70">
            <p className="text-sm font-bold text-black">{BUSINESS.name}</p>
            <p>{BUSINESS.address}</p>
            <p>{BUSINESS.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="inline-block rounded-sm bg-red-600 px-3 py-1 text-lg font-bold tracking-[0.15em] text-white">
            INVOICE
          </p>
          <p className="mt-1.5 font-mono text-xs font-semibold text-black">{invoice.invoiceNumber}</p>
          <p className="text-xs text-black/60">{invoice.date.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs">
        <div>
          <p className="font-semibold text-black/50">Bill To</p>
          <p className="font-medium">{invoice.customerName}</p>
          <p>{invoice.customerPhone}</p>
        </div>
        <div className="text-right">
          {invoice.vehicleNumber && (
            <>
              <p className="font-semibold text-black/50">Vehicle No.</p>
              <p className="font-medium">{invoice.vehicleNumber}</p>
            </>
          )}
          {invoice.soldBy && (
            <>
              <p className="mt-1 font-semibold text-black/50">Sold By</p>
              <p>{invoice.soldBy}</p>
            </>
          )}
        </div>
      </div>

      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr className="bg-red-600 text-left text-white">
            <th className="py-2 pl-2 pr-2 font-semibold">Item</th>
            <th className="py-2 pr-2 font-semibold text-center">Qty</th>
            <th className="py-2 pr-2 font-semibold">Serial No.</th>
            <th className="py-2 pr-2 font-semibold">Warranty</th>
            <th className="bg-black py-2 pr-2 text-right font-semibold text-white">Price</th>
          </tr>
        </thead>
        <tbody>
          {groupedItems.map((item, i) => (
            <tr key={item.id} className={i % 2 === 1 ? "bg-red-50 align-top" : "bg-white align-top"}>
              <td className="py-1.5 pl-2 pr-2">
                {item.brand} {item.productName}
              </td>
              <td className="py-1.5 pr-2 text-center">{item.qty}</td>
              <td className="py-1.5 pr-2 font-mono">{item.serialNumber}</td>
              <td className="py-1.5 pr-2">{item.warrantyMonths > 0 ? `${item.warrantyMonths} mo` : "No Warranty"}</td>
              <td className="py-1.5 pr-2 text-right">Rs. {item.salePrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex justify-end border-t-2 border-red-600 pt-2">
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span>Rs. {invoice.totalAmount.toFixed(2)}</span>
          </div>
          {isCredit && (
            <>
              <div className="flex justify-between text-xs text-black/60">
                <span>Amount Paid</span>
                <span>Rs. {invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-red-600">
                <span>Balance Due</span>
                <span>Rs. {balanceDue.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-1 text-[10px] text-black/50">
        <p>Please retain this invoice — it is required to claim warranty on any item listed above.</p>
        <p>Warranty period is counted from the invoice date shown above.</p>
      </div>
    </div>
  );
}
