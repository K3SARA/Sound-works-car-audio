"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type ActionResult = { error?: string; success?: string };

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  sku: z.string().min(1),
  warrantyMonths: z.coerce.number().int().min(0),
});

export async function createProduct(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const data = productSchema.parse(Object.fromEntries(formData));

  try {
    await prisma.product.create({ data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: `Model Number "${data.sku}" is already in use by another product.` };
    }
    throw err;
  }

  revalidatePath("/inventory");
  return { success: "Product added." };
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
export async function addInventoryUnits(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const data = unitsSchema.parse(raw);

  const serials = [...new Set(data.serialNumbers.split(/\r?\n/).map((s) => s.trim()).filter(Boolean))];

  const { count } = await prisma.inventoryUnit.createMany({
    skipDuplicates: true,
    data: serials.map((serialNumber) => ({
      productId: data.productId,
      serialNumber,
      location: data.location || null,
      costPrice: data.costPrice,
    })),
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${data.productId}`);

  const skipped = serials.length - count;
  if (skipped > 0) {
    return {
      error: `Added ${count} of ${serials.length} — ${skipped} serial number${skipped === 1 ? "" : "s"} already exist in the system and ${skipped === 1 ? "was" : "were"} skipped.`,
    };
  }
  return { success: `Added ${count} serial number${count === 1 ? "" : "s"}.` };
}

export async function deleteInventoryUnit(unitId: string, productId: string) {
  await prisma.inventoryUnit.delete({ where: { id: unitId } });
  revalidatePath(`/inventory/${productId}`);
}

export async function updateUnitStatus(unitId: string, productId: string, status: "IN_STOCK" | "IN_REPAIR" | "RETIRED") {
  await prisma.inventoryUnit.update({ where: { id: unitId }, data: { status } });
  revalidatePath(`/inventory/${productId}`);
}
