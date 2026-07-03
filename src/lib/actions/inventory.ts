"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  sku: z.string().min(1),
  warrantyMonths: z.coerce.number().int().min(0),
});

export async function createProduct(formData: FormData) {
  const data = productSchema.parse(Object.fromEntries(formData));
  await prisma.product.create({ data });
  revalidatePath("/inventory");
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/inventory");
}

const unitsSchema = z.object({
  productId: z.string().min(1),
  serialNumbers: z.string().min(1),
  location: z.string().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
});

/** Accepts one serial number per line so a whole shipment can be received at once — every unit is its own row, never a quantity count. */
export async function addInventoryUnits(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const data = unitsSchema.parse(raw);

  const serials = data.serialNumbers
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.inventoryUnit.createMany({
    data: serials.map((serialNumber) => ({
      productId: data.productId,
      serialNumber,
      location: data.location || null,
      costPrice: data.costPrice,
    })),
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${data.productId}`);
}

export async function deleteInventoryUnit(unitId: string, productId: string) {
  await prisma.inventoryUnit.delete({ where: { id: unitId } });
  revalidatePath(`/inventory/${productId}`);
}

export async function updateUnitStatus(unitId: string, productId: string, status: "IN_STOCK" | "IN_REPAIR" | "RETIRED") {
  await prisma.inventoryUnit.update({ where: { id: unitId }, data: { status } });
  revalidatePath(`/inventory/${productId}`);
}
