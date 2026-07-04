"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type ActionResult = { error?: string; success?: string };

const productSchema = z
  .object({
    name: z.string().min(1),
    brand: z.string().min(1),
    category: z.string().min(1),
    sku: z.string().min(1),
    sellingPrice: z.coerce.number().positive(),
    warrantyMonths: z.coerce.number().int().min(0),
    supplierId: z.string().optional(),
    newSupplierName: z.string().optional(),
    newSupplierAddress: z.string().optional(),
    newSupplierPhone: z.string().optional(),
  })
  .refine((data) => data.supplierId || (data.newSupplierName && data.newSupplierAddress && data.newSupplierPhone), {
    message: "Select a supplier or fill in the new supplier's name, address, and mobile number.",
  });

export async function createProduct(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const supplierId = data.supplierId
        ? data.supplierId
        : (
            await tx.supplier.create({
              data: {
                name: data.newSupplierName!,
                address: data.newSupplierAddress!,
                phone: data.newSupplierPhone!,
              },
            })
          ).id;

      await tx.product.create({
        data: {
          name: data.name,
          brand: data.brand,
          category: data.category,
          sku: data.sku,
          sellingPrice: data.sellingPrice,
          warrantyMonths: data.warrantyMonths,
          supplierId,
        },
      });
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: `Model Number "${data.sku}" is already in use by another product.` };
    }
    throw err;
  }

  revalidatePath("/inventory");
  return { success: "Product added." };
}

export async function updateProduct(
  productId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const supplierId = data.supplierId
        ? data.supplierId
        : (
            await tx.supplier.create({
              data: {
                name: data.newSupplierName!,
                address: data.newSupplierAddress!,
                phone: data.newSupplierPhone!,
              },
            })
          ).id;

      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          brand: data.brand,
          category: data.category,
          sku: data.sku,
          sellingPrice: data.sellingPrice,
          warrantyMonths: data.warrantyMonths,
          supplierId,
        },
      });
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: `Model Number "${data.sku}" is already in use by another product.` };
    }
    throw err;
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${productId}`);
  redirect(`/inventory/${productId}`);
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
