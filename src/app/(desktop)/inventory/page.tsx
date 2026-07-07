import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/inventory";
import { getCategories } from "@/lib/actions/catalog";
import { AddProductModal } from "@/components/inventory/AddProductModal";
import { clsx } from "clsx";

async function getProducts(category?: string) {
  return prisma.product.findMany({
    where: category ? { category } : undefined,
    include: {
      _count: { select: { units: { where: { status: "IN_STOCK" } } } },
      supplier: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const { category, error } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(category), getCategories()]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Inventory</h1>
        <AddProductModal />
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Link
          href="/inventory"
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            !category ? "bg-red-600 text-white" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/inventory?category=${encodeURIComponent(c)}`}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium",
              category === c ? "bg-red-600 text-white" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      <table className="w-full overflow-hidden rounded-lg border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-black">
        <thead className="bg-black/5 text-left text-xs uppercase text-black/50 dark:bg-white/5 dark:text-white/50">
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Brand</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Model Number</th>
            <th className="px-4 py-2">Selling Price</th>
            <th className="px-4 py-2">Supplier</th>
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
              <td className="px-4 py-2">{p.sellingPrice ? `Rs. ${Number(p.sellingPrice).toFixed(2)}` : "—"}</td>
              <td className="px-4 py-2">{p.supplier?.name ?? "—"}</td>
              <td className="px-4 py-2">{p.warrantyMonths} mo</td>
              <td className="px-4 py-2">
                <span className={p._count.units <= p.lowStockThreshold ? "font-semibold text-amber-600 dark:text-amber-400" : undefined}>
                  {p._count.units}
                </span>
                {p._count.units <= p.lowStockThreshold && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    Low
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/inventory/${p.id}/edit`} className="text-xs text-black/50 hover:text-red-600 dark:text-white/50">
                    Edit
                  </Link>
                  <form action={deleteProduct.bind(null, p.id)}>
                    <button className="text-xs text-black/40 hover:text-red-600">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-black/40">
                {category ? `No products in "${category}".` : "No products yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
