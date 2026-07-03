import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addInventoryUnits, deleteInventoryUnit } from "@/lib/actions/inventory";
import { StatusSelect } from "@/components/inventory/StatusSelect";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { units: { orderBy: { receivedAt: "desc" } } },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{product.brand} {product.name}</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          SKU {product.sku} · {product.category} · {product.warrantyMonths} month warranty
        </p>
      </div>

      <div className="max-w-lg rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h2 className="mb-3 text-sm font-bold">Receive units</h2>
        <form action={addInventoryUnits} className="space-y-2">
          <input type="hidden" name="productId" value={product.id} />
          <textarea
            name="serialNumbers"
            required
            rows={4}
            placeholder={"One serial number per line"}
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
          />
          <div className="flex gap-2">
            <input name="location" placeholder="Shelf / bin location" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
            <input name="costPrice" type="number" step="0.01" min="0" placeholder="Cost price" className="w-1/2 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          </div>
          <button className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white">Add serial numbers</button>
        </form>
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
