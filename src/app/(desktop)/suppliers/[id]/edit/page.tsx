import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupplier, updateSupplier } from "@/lib/actions/supplier";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) notFound();

  return (
    <div className="max-w-md space-y-4">
      <Link href="/suppliers" className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
        <ArrowLeft size={16} />
        Back to suppliers
      </Link>

      <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h1 className="mb-3 text-sm font-bold">Edit supplier</h1>
        <form action={updateSupplier.bind(null, supplier.id)} className="space-y-2">
          <input name="name" defaultValue={supplier.name} placeholder="Supplier name" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="address" defaultValue={supplier.address} placeholder="Address" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="phone" defaultValue={supplier.phone} placeholder="Mobile number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <button className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white">Save changes</button>
        </form>
      </div>
    </div>
  );
}
