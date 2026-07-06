import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInvoiceDocument } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/reports/InvoiceDocument";
import { PrintButton } from "@/components/reports/PrintButton";
import { RecordPaymentForm } from "@/components/reports/RecordPaymentForm";

export default async function MobileInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceDocument(id);

  if (!invoice) notFound();

  const balanceDue = invoice.totalAmount - invoice.amountPaid;

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href="/pos" className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          <ArrowLeft size={16} />
          Back to billing
        </Link>
        <PrintButton />
      </div>

      {balanceDue > 0.005 && <RecordPaymentForm invoiceId={id} balanceDue={balanceDue} />}

      <div className="mx-auto max-w-[148mm] border border-black/10 shadow-sm print:max-w-none print:border-0 print:shadow-none">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
