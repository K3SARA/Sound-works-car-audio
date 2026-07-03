"use server";

import { prisma } from "@/lib/prisma";

export type StockResult = {
  serialNumber: string;
  productName: string;
  brand: string;
  sku: string;
  status: string;
  location: string | null;
};

/** Read-only stock lookup for floor staff — no edit capability, mirrors mobile POS search. */
export async function searchStock(query: string): Promise<StockResult[]> {
  const q = query.trim();
  if (!q) return [];

  const units = await prisma.inventoryUnit.findMany({
    where: {
      OR: [
        { serialNumber: { equals: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
        { product: { sku: { contains: q, mode: "insensitive" } } },
        { product: { brand: { contains: q, mode: "insensitive" } } },
      ],
    },
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
  }));
}
