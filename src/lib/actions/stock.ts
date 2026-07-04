"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type StockResult = {
  serialNumber: string;
  productName: string;
  brand: string;
  sku: string;
  status: string;
  location: string | null;
  sellingPrice: number | null;
};

/**
 * Read-only stock lookup for floor staff — no edit capability, mirrors mobile POS search.
 * A category with no search text browses that whole category; neither set returns nothing.
 */
export async function searchStock(query: string, category?: string): Promise<StockResult[]> {
  const q = query.trim();
  if (!q && !category) return [];

  const AND: Prisma.InventoryUnitWhereInput[] = [];
  if (category) AND.push({ product: { category } });
  if (q) {
    AND.push({
      OR: [
        { serialNumber: { equals: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
        { product: { sku: { contains: q, mode: "insensitive" } } },
        { product: { brand: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  const units = await prisma.inventoryUnit.findMany({
    where: { AND },
    include: { product: true },
    take: 20,
    orderBy: { receivedAt: "desc" },
  });

  return units.map((u) => ({
    serialNumber: u.serialNumber,
    productName: u.product.name,
    brand: u.product.brand,
    sku: u.product.sku,
    status: u.status,
    location: u.location,
    sellingPrice: u.product.sellingPrice ? Number(u.product.sellingPrice) : null,
  }));
}
