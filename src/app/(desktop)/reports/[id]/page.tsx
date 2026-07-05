import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInvoiceDocument } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/reports/InvoiceDocument";
import { PrintButton } from "@/components/reports/PrintButton";
import { DeleteInvoiceButton } from "@/components/reports/DeleteInvoiceButton";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceDocument(id);

  if (!invoice) notFound();

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/reports" className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
          <ArrowLeft size={16} />
          Back to reports
        </Link>
        <div className="flex items-center gap-2">
          <DeleteInvoiceButton invoiceId={id} redirectAfter="/reports" />
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto max-w-[148mm] border border-black/10 shadow-sm print:max-w-none print:border-0 print:shadow-none">
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
