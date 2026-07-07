"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/authz";

export type ActionResult = { error?: string; success?: string };

const productSchema = z
  .object({
    name: z.string().min(1),
    brand: z.string().min(1),
    category: z.string().min(1),
    sku: z.string().min(1),
    sellingPrice: z.coerce.number().positive(),
    warrantyMonths: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0),
    supplierId: z.string().optional(),
    newSupplierName: z.string().optional(),
    newSupplierAddress: z.string().optional(),
    newSupplierPhone: z.string().optional(),
  })
  .refine((data) => data.supplierId || (data.newSupplierName && data.newSupplierAddress && data.newSupplierPhone), {
    message: "Select a supplier or fill in the new supplier's name, address, and mobile number.",
  });

export async function createProduct(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
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
          lowStockThreshold: data.lowStockThreshold,
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
  revalidatePath("/dashboard");
  return { success: "Product added." };
}

export async function updateProduct(
  productId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
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
          lowStockThreshold: data.lowStockThreshold,
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
  revalidatePath("/dashboard");
  redirect(`/inventory/${productId}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      redirect(`/inventory?error=${encodeURIComponent("Can't delete a product that still has inventory units. Remove its units first.")}`);
    }
    throw err;
  }
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
  await requireAdmin();
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
  revalidatePath("/dashboard");
  revalidatePath("/pos");

  const skipped = serials.length - count;
  if (skipped > 0) {
    return {
      error: `Added ${count} of ${serials.length} — ${skipped} serial number${skipped === 1 ? "" : "s"} already exist in the system and ${skipped === 1 ? "was" : "were"} skipped.`,
    };
  }
  return { success: `Added ${count} serial number${count === 1 ? "" : "s"}.` };
}

const generateUnitsSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(500),
  location: z.string().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
});

/**
 * For stock that has no manufacturer serial (cables, accessories, hardware) —
 * auto-generates a unique shop-assigned ID per unit (SKU-0001, SKU-0002, ...)
 * so it still gets full serial-level tracking, without staff having to invent
 * and type each one by hand.
 */
export async function generateInventoryUnits(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const data = generateUnitsSchema.parse(Object.fromEntries(formData));

  const product = await prisma.product.findUnique({ where: { id: data.productId }, select: { sku: true } });
  if (!product) return { error: "Product not found." };

  const existingCount = await prisma.inventoryUnit.count({ where: { productId: data.productId } });

  const serials = Array.from(
    { length: data.quantity },
    (_, i) => `${product.sku}-${String(existingCount + i + 1).padStart(4, "0")}`
  );

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
  revalidatePath("/dashboard");
  revalidatePath("/pos");

  const skipped = serials.length - count;
  if (skipped > 0) {
    return {
      error: `Added ${count} of ${serials.length} — ${skipped} generated ID${skipped === 1 ? "" : "s"} collided with existing serial number${skipped === 1 ? "" : "s"} and ${skipped === 1 ? "was" : "were"} skipped.`,
    };
  }
  return { success: `Added ${count} unit${count === 1 ? "" : "s"} — IDs ${serials[0]} through ${serials[serials.length - 1]}.` };
}

export async function deleteInventoryUnit(unitId: string, productId: string) {
  await requireAdmin();
  try {
    await prisma.inventoryUnit.delete({ where: { id: unitId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      redirect(
        `/inventory/${productId}?error=${encodeURIComponent("Can't remove a unit that has warranty claim history.")}`
      );
    }
    throw err;
  }
  revalidatePath(`/inventory/${productId}`);
  revalidatePath("/dashboard");
  revalidatePath("/pos");
}

export async function updateUnitStatus(unitId: string, productId: string, status: "IN_STOCK" | "IN_REPAIR" | "RETIRED") {
  await requireAdmin();
  await prisma.inventoryUnit.update({ where: { id: unitId }, data: { status } });
  revalidatePath(`/inventory/${productId}`);
  revalidatePath("/dashboard");
  revalidatePath("/pos");
}

export type LowStockProduct = {
  id: string;
  name: string;
  brand: string;
  inStock: number;
  lowStockThreshold: number;
};

/** Read-only, shown on both the admin dashboard and the sales POS screen. */
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      lowStockThreshold: true,
      _count: { select: { units: { where: { status: "IN_STOCK" } } } },
    },
  });

  return products
    .filter((p) => p._count.units <= p.lowStockThreshold)
    .map((p) => ({ id: p.id, name: p.name, brand: p.brand, inStock: p._count.units, lowStockThreshold: p.lowStockThreshold }))
    .sort((a, b) => a.inStock - b.inStock);
}
