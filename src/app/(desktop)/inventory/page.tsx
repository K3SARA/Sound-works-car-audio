import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProduct, deleteProduct } from "@/lib/actions/inventory";

async function getProducts() {
  return prisma.product.findMany({
    include: { _count: { select: { units: { where: { status: "IN_STOCK" } } } } },
    orderBy: { name: "asc" },
  });
}

export default async function InventoryPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-bold">Inventory</h1>

        <table className="w-full overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-black">
          <thead className="bg-black/5 text-left text-xs uppercase text-black/50 dark:bg-white/5 dark:text-white/50">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Warranty</th>
              <th className="px-4 py-2">In stock</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <Link href={`/inventory/${p.id}`} className="font-medium text-red-600 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.brand}</td>
                <td className="px-4 py-2">{p.category}</td>
                <td className="px-4 py-2">{p.sku}</td>
                <td className="px-4 py-2">{p.warrantyMonths} mo</td>
                <td className="px-4 py-2">{p._count.units}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteProduct.bind(null, p.id)}>
                    <button className="text-xs text-black/40 hover:text-red-600">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-black/40">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-md rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
        <h2 className="mb-3 text-sm font-bold">Add product</h2>
        <form action={createProduct} className="space-y-2">
          <input name="name" placeholder="Name (e.g. TS-A1670F)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="brand" placeholder="Brand (e.g. Pioneer)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="category" placeholder="Category (e.g. Speakers)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="sku" placeholder="SKU" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <input name="warrantyMonths" type="number" min="0" placeholder="Warranty (months)" required className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black" />
          <button className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white">Add product</button>
        </form>
      </div>
    </div>
  );
}
