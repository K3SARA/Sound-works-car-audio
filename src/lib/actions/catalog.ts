"use server";

import { prisma } from "@/lib/prisma";

/** Distinct product categories currently in the catalog, for filter dropdowns. */
export async function getCategories(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

/** Existing product names, for the "add product" name field's autocomplete suggestions. */
export async function getProductNames(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
}
