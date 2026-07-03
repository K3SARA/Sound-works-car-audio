import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const salesPassword = await bcrypt.hash("sales123", 10);

  await prisma.user.upsert({
    where: { email: "admin@soundworks.lk" },
    update: {},
    create: {
      name: "Shop Admin",
      email: "admin@soundworks.lk",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "sales@soundworks.lk" },
    update: {},
    create: {
      name: "Floor Staff",
      email: "sales@soundworks.lk",
      passwordHash: salesPassword,
      role: "SALES",
    },
  });

  const subwoofer = await prisma.product.upsert({
    where: { sku: "PIO-TSA1670F" },
    update: {},
    create: {
      name: "TS-A1670F 6.5\" 3-Way Speaker",
      brand: "Pioneer",
      category: "Speakers",
      sku: "PIO-TSA1670F",
      warrantyMonths: 12,
    },
  });

  const amp = await prisma.product.upsert({
    where: { sku: "JL-XD600-4" },
    update: {},
    create: {
      name: "XD600/4 4-Channel Amplifier",
      brand: "JL Audio",
      category: "Amplifiers",
      sku: "JL-XD600-4",
      warrantyMonths: 24,
    },
  });

  await prisma.inventoryUnit.createMany({
    skipDuplicates: true,
    data: [
      { productId: subwoofer.id, serialNumber: "PIO-SN-0001", location: "A1" },
      { productId: subwoofer.id, serialNumber: "PIO-SN-0002", location: "A1" },
      { productId: subwoofer.id, serialNumber: "PIO-SN-0003", location: "A1" },
      { productId: amp.id, serialNumber: "JL-SN-0001", location: "B3" },
      { productId: amp.id, serialNumber: "JL-SN-0002", location: "B3" },
    ],
  });

  console.log("Seed complete. Login with admin@soundworks.lk / admin123 or sales@soundworks.lk / sales123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
