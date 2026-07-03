"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export type AvailableUnit = {
  unitId: string;
  serialNumber: string;
  productName: string;
  brand: string;
  sku: string;
  location: string | null;
  warrantyMonths: number;
};

/**
 * Matches by exact serial number (scanner input) or partial product name/SKU/brand,
 * optionally narrowed to one category. A category with no search text browses that
 * whole category; neither set returns nothing (avoids dumping the entire catalog).
 */
export async function searchAvailableUnits(query: string, category?: string): Promise<AvailableUnit[]> {
  const q = query.trim();
  if (!q && !category) return [];

  const AND: Prisma.InventoryUnitWhereInput[] = [{ status: "IN_STOCK" }];
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
  });

  return units.map((u) => ({
    unitId: u.id,
    serialNumber: u.serialNumber,
    productName: u.product.name,
    brand: u.product.brand,
    sku: u.product.sku,
    location: u.location,
    warrantyMonths: u.product.warrantyMonths,
  }));
}

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  items: z
    .array(
      z.object({
        unitId: z.string(),
        salePrice: z.coerce.number().positive(),
        warrantyMonths: z.coerce.number().int().min(0),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Sells the scanned serial numbers: creates the invoice, freezes warranty terms, and flips units to SOLD. */
export async function checkoutInvoice(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);
  const session = await auth();

  const totalAmount = data.items.reduce((sum, i) => sum + i.salePrice, 0);

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalAmount,
        createdById: session?.user?.id,
        items: {
          create: data.items.map((item) => ({
            salePrice: item.salePrice,
            warrantyMonths: item.warrantyMonths,
            inventoryUnit: { connect: { id: item.unitId } },
          })),
        },
      },
      include: { items: true },
    });

    await tx.inventoryUnit.updateMany({
      where: { id: { in: data.items.map((i) => i.unitId) } },
      data: { status: "SOLD" },
    });

    return created;
  });

  revalidatePath("/pos");
  revalidatePath("/stock");
  return { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber };
}
