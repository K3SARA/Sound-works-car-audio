import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/components/reports/InvoiceDocument";
import { PrintButton } from "@/components/reports/PrintButton";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: { include: { inventoryUnit: { include: { product: true } } } },
      createdBy: true,
    },
  });

  if (!invoice) notFound();

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/reports" className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          <ArrowLeft size={16} />
          Back to reports
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-[148mm] border border-black/10 shadow-sm print:max-w-none print:border-0 print:shadow-none">
        <InvoiceDocument
          invoice={{
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            totalAmount: Number(invoice.totalAmount),
            soldBy: invoice.createdBy?.name ?? null,
            items: invoice.items.map((item) => ({
              id: item.id,
              brand: item.inventoryUnit.product.brand,
              productName: item.inventoryUnit.product.name,
              serialNumber: item.inventoryUnit.serialNumber,
              salePrice: Number(item.salePrice),
              warrantyMonths: item.warrantyMonths,
            })),
          }}
        />
      </div>
    </div>
  );
}
