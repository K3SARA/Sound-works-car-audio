"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export type AvailableUnit = {
  unitId: string;
  serialNumber: string;
  productName: string;
  brand: string;
  sku: string;
  location: string | null;
  warrantyMonths: number;
  sellingPrice: number | null;
};

/**
 * Matches by exact serial number (scanner input) or partial product name/model number/brand,
 * optionally narrowed to one category. With no search text and no category ("All"), browses
 * the first 20 in-stock units — capped by `take`, not an unbounded dump of the whole catalog.
 */
export async function searchAvailableUnits(query: string, category?: string): Promise<AvailableUnit[]> {
  const q = query.trim();

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
    orderBy: { product: { name: "asc" } },
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
    sellingPrice: u.product.sellingPrice ? Number(u.product.sellingPrice) : null,
  }));
}

const checkoutSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  vehicleNumber: z.string().optional(),
  amountPaid: z.coerce.number().min(0).optional(), // omit/undefined = paid in full
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

/**
 * Sells the scanned serial numbers: creates the invoice, freezes warranty terms, and flips
 * units to SOLD. Customer name/phone are required whenever any item carries a warranty, or
 * whenever the sale isn't paid in full (a credit sale) — either way, you need to know who
 * to follow up with.
 */
export async function checkoutInvoice(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);
  const session = await auth();

  const customerName = data.customerName?.trim() ?? "";
  const customerPhone = data.customerPhone?.trim() ?? "";
  const hasWarrantyItem = data.items.some((item) => item.warrantyMonths > 0);

  const totalAmount = data.items.reduce((sum, i) => sum + i.salePrice, 0);
  const amountPaid = data.amountPaid === undefined ? totalAmount : Math.min(data.amountPaid, totalAmount);
  const isCredit = amountPaid < totalAmount;

  if ((hasWarrantyItem || isCredit) && (!customerName || !customerPhone)) {
    throw new Error(
      isCredit
        ? "Customer name and phone are required for a credit sale."
        : "Customer name and phone are required when any item in the sale has a warranty."
    );
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "-",
        vehicleNumber: data.vehicleNumber || null,
        totalAmount,
        amountPaid,
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
  revalidatePath("/reports");
  return {
    invoiceId: invoice.id,
    invoiceNumber: formatInvoiceNumber(invoice.sequence),
    balanceDue: totalAmount - amountPaid,
  };
}

const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
});

/** Logs an additional payment toward settling a credit / partially-paid invoice. */
export async function recordPayment(_prevState: { error?: string; success?: string }, formData: FormData) {
  await requireAdmin();
  const parsed = recordPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { invoiceId, amount } = parsed.data;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };

  const balanceDue = Number(invoice.totalAmount) - Number(invoice.amountPaid);
  if (amount > balanceDue) {
    return { error: `That's more than the remaining balance of Rs. ${balanceDue.toFixed(2)}.` };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { amountPaid: { increment: amount } },
  });

  revalidatePath("/reports");
  revalidatePath(`/reports/${invoiceId}`);
  return { success: `Recorded Rs. ${amount.toFixed(2)} payment.` };
}

/**
 * Deletes an invoice (test data, mistakes, cancellations) and returns its sold unit(s) to
 * IN_STOCK first, so they aren't left stranded as "sold" with no invoice to point to. Only
 * units still marked SOLD are reverted — one that's since moved to IN_REPAIR (a warranty
 * claim was logged) or RETIRED is left alone, since deleting the invoice shouldn't make a
 * broken/scrapped unit look sellable again.
 */
export async function deleteInvoice(invoiceId: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: { include: { inventoryUnit: true } } },
    });
    if (!invoice) return;

    const soldUnitIds = invoice.items.filter((item) => item.inventoryUnit.status === "SOLD").map((item) => item.inventoryUnitId);

    if (soldUnitIds.length > 0) {
      await tx.inventoryUnit.updateMany({
        where: { id: { in: soldUnitIds } },
        data: { status: "IN_STOCK" },
      });
    }

    await tx.invoice.delete({ where: { id: invoiceId } });
  });

  revalidatePath("/reports");
  revalidatePath("/inventory");
  revalidatePath("/stock");
  revalidatePath("/pos");
}
