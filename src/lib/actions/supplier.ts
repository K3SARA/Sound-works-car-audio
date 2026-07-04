"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type SupplierOption = { id: string; name: string };

export async function getSuppliers(): Promise<SupplierOption[]> {
  return prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getSupplier(id: string) {
  return prisma.supplier.findUnique({ where: { id } });
}

const supplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
});

export async function createSupplier(formData: FormData) {
  const data = supplierSchema.parse(Object.fromEntries(formData));
  await prisma.supplier.create({ data });
  revalidatePath("/suppliers");
}

export async function updateSupplier(supplierId: string, formData: FormData) {
  const data = supplierSchema.parse(Object.fromEntries(formData));
  await prisma.supplier.update({ where: { id: supplierId }, data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(supplierId: string) {
  try {
    await prisma.supplier.delete({ where: { id: supplierId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      redirect(`/suppliers?error=${encodeURIComponent("Can't delete a supplier that still has products linked to it.")}`);
    }
    throw err;
  }
  revalidatePath("/suppliers");
}
