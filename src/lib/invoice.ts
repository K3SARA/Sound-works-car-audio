import { prisma } from "@/lib/prisma";
import { formatInvoiceNumber } from "@/lib/invoice-number";
import type { InvoiceDocumentData } from "@/components/reports/InvoiceDocument";

/** Shared by the desktop Reports invoice page and the mobile POS print view. */
export async function getInvoiceDocument(id: string): Promise<InvoiceDocumentData | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: { include: { inventoryUnit: { include: { product: true } } } },
      createdBy: true,
    },
  });

  if (!invoice) return null;

  return {
    invoiceNumber: formatInvoiceNumber(invoice.sequence),
    date: invoice.date,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    vehicleNumber: invoice.vehicleNumber,
    totalAmount: Number(invoice.totalAmount),
    amountPaid: Number(invoice.amountPaid),
    soldBy: invoice.createdBy?.name ?? null,
    items: invoice.items.map((item) => ({
      id: item.id,
      brand: item.inventoryUnit.product.brand,
      productName: item.inventoryUnit.product.name,
      serialNumber: item.inventoryUnit.serialNumber,
      salePrice: Number(item.salePrice),
      warrantyMonths: item.warrantyMonths,
    })),
  };
}
