import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EditProductForm } from "@/components/inventory/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });

  if (!product) notFound();

  return (
    <div className="max-w-md space-y-4">
      <Link href={`/inventory/${product.id}`} className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
        <ArrowLeft size={16} />
        Back to product
      </Link>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h1 className="mb-3 text-sm font-bold">Edit product</h1>
        <EditProductForm
          product={{
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            sku: product.sku,
            warrantyMonths: product.warrantyMonths,
            supplierId: product.supplierId,
            supplierName: product.supplier?.name ?? "",
          }}
        />
      </div>
    </div>
  );
}
