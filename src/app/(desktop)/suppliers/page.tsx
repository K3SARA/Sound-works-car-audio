import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupplier, deleteSupplier } from "@/lib/actions/supplier";

async function getSuppliers() {
  return prisma.supplier.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-bold">Suppliers</h1>

        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        <table className="w-full overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-black">
          <thead className="bg-black/5 text-left text-xs uppercase text-black/50 dark:bg-white/5 dark:text-white/50">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Products</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-medium">{s.name}</td>
                <td className="px-4 py-2">{s.address}</td>
                <td className="px-4 py-2">{s.phone}</td>
                <td className="px-4 py-2">{s._count.products}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/suppliers/${s.id}/edit`} className="text-xs text-black/50 hover:text-red-600 dark:text-white/50">
                      Edit
                    </Link>
                    <form action={deleteSupplier.bind(null, s.id)}>
                      <button className="text-xs text-black/40 hover:text-red-600">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/40">
                  No suppliers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-md rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h2 className="mb-3 text-sm font-bold">Add supplier</h2>
        <form action={createSupplier} className="space-y-2">
          <input name="name" placeholder="Supplier name" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="address" placeholder="Address" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="phone" placeholder="Mobile number" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <button className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white">Add supplier</button>
        </form>
      </div>
    </div>
  );
}
