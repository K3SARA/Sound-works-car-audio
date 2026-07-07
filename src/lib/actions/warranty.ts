"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export type WarrantyLookupResult = {
  unitId: string;
  serialNumber: string;
  productName: string;
  brand: string;
  supplierName: string | null;
  status: string;
  sale: {
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    vehicleNumber: string | null;
    purchaseDate: string;
    salePrice: number;
    warrantyMonths: number;
    warrantyExpiresAt: string;
    isActive: boolean;
  } | null;
  claims: {
    id: string;
    dateClaimed: string;
    issueDescription: string;
    status: string;
    resolutionNotes: string | null;
  }[];
};

/** The core of the warranty desk: type a serial, get the invoice, customer, and Active/Expired status back. */
export async function lookupWarranty(serialNumber: string): Promise<WarrantyLookupResult | null> {
  const unit = await prisma.inventoryUnit.findUnique({
    where: { serialNumber: serialNumber.trim() },
    include: {
      product: { include: { supplier: true } },
      invoiceItem: { include: { invoice: true } },
      warrantyClaims: { orderBy: { dateClaimed: "desc" } },
    },
  });

  if (!unit) return null;

  let sale: WarrantyLookupResult["sale"] = null;
  if (unit.invoiceItem) {
    const purchaseDate = unit.invoiceItem.invoice.date;
    const warrantyExpiresAt = new Date(purchaseDate);
    warrantyExpiresAt.setMonth(warrantyExpiresAt.getMonth() + unit.invoiceItem.warrantyMonths);

    sale = {
      invoiceNumber: formatInvoiceNumber(unit.invoiceItem.invoice.sequence),
      customerName: unit.invoiceItem.invoice.customerName,
      customerPhone: unit.invoiceItem.invoice.customerPhone,
      vehicleNumber: unit.invoiceItem.invoice.vehicleNumber,
      purchaseDate: purchaseDate.toISOString(),
      salePrice: Number(unit.invoiceItem.salePrice),
      warrantyMonths: unit.invoiceItem.warrantyMonths,
      warrantyExpiresAt: warrantyExpiresAt.toISOString(),
      isActive: warrantyExpiresAt.getTime() >= Date.now(),
    };
  }

  return {
    unitId: unit.id,
    serialNumber: unit.serialNumber,
    productName: unit.product.name,
    brand: unit.product.brand,
    supplierName: unit.product.supplier?.name ?? null,
    status: unit.status,
    sale,
    claims: unit.warrantyClaims.map((c) => ({
      id: c.id,
      dateClaimed: c.dateClaimed.toISOString(),
      issueDescription: c.issueDescription,
      status: c.status,
      resolutionNotes: c.resolutionNotes,
    })),
  };
}

const logClaimSchema = z.object({
  unitId: z.string().min(1),
  issueDescription: z.string().min(1),
});

/** Logs the item for repair/replacement and flips the unit to IN_REPAIR so it drops out of sellable stock. */
export async function logWarrantyClaim(input: z.infer<typeof logClaimSchema>) {
  const session = await requireAdmin();
  const data = logClaimSchema.parse(input);

  await prisma.$transaction([
    prisma.warrantyClaim.create({
      data: {
        inventoryUnitId: data.unitId,
        issueDescription: data.issueDescription,
        handledById: session?.user?.id,
      },
    }),
    prisma.inventoryUnit.update({
      where: { id: data.unitId },
      data: { status: "IN_REPAIR" },
    }),
  ]);

  revalidatePath("/warranty");
}

const updateClaimSchema = z.object({
  claimId: z.string().min(1),
  status: z.enum(["PENDING", "IN_REPAIR", "REPLACED", "RESOLVED", "REJECTED"]),
  resolutionNotes: z.string().optional(),
});

export async function updateWarrantyClaim(input: z.infer<typeof updateClaimSchema>) {
  await requireAdmin();
  const data = updateClaimSchema.parse(input);

  await prisma.warrantyClaim.update({
    where: { id: data.claimId },
    data: { status: data.status, resolutionNotes: data.resolutionNotes },
  });

  revalidatePath("/warranty");
}
