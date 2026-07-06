import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteInventoryUnit } from "@/lib/actions/inventory";
import { StatusSelect } from "@/components/inventory/StatusSelect";
import { AddSerialsForm } from "@/components/inventory/AddSerialsForm";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { units: { orderBy: { receivedAt: "desc" } }, supplier: true },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{product.brand} {product.name}</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            Model Number {product.sku} · {product.category} · {product.warrantyMonths} month warranty
            {product.sellingPrice && ` · Rs. ${Number(product.sellingPrice).toFixed(2)}`}
          </p>
          {product.supplier && (
            <p className="mt-1 text-xs text-black/50 dark:text-white/50">
              Supplier: {product.supplier.name} · {product.supplier.address} · {product.supplier.phone}
            </p>
          )}
        </div>
        <Link
          href={`/inventory/${product.id}/edit`}
          className="shrink-0 rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium text-black/70 hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
        >
          Edit product
        </Link>
      </div>

      <div className="max-w-lg rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h2 className="mb-3 text-sm font-bold">Receive units</h2>
        <AddSerialsForm productId={product.id} />
      </div>

      <table className="w-full overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-black">
        <thead className="bg-black/5 text-left text-xs uppercase text-black/50 dark:bg-white/5 dark:text-white/50">
          <tr>
            <th className="px-4 py-2">Serial number</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 dark:divide-white/10">
          {product.units.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2 font-mono text-xs">{u.serialNumber}</td>
              <td className="px-4 py-2">{u.location ?? "—"}</td>
              <td className="px-4 py-2">
                {u.status === "SOLD" ? (
                  <span className="text-xs text-black/50 dark:text-white/50">SOLD</span>
                ) : (
                  <StatusSelect unitId={u.id} productId={product.id} status={u.status} />
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {u.status !== "SOLD" && (
                  <form action={deleteInventoryUnit.bind(null, u.id, product.id)}>
                    <button className="text-xs text-black/40 hover:text-red-600">Remove</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
          {product.units.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-black/40">No units received yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
