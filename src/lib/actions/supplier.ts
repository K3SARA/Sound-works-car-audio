"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type SupplierOption = { id: string; name: string };

export async function getSuppliers(): Promise<SupplierOption[]> {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

const newSupplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
});

export type NewSupplierInput = z.infer<typeof newSupplierSchema>;

/** Used when "Add product" creates a supplier inline rather than picking an existing one. */
export async function createSupplier(input: NewSupplierInput) {
  const data = newSupplierSchema.parse(input);
  return prisma.supplier.create({ data });
}
