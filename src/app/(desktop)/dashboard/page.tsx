import { prisma } from "@/lib/prisma";
import { getLowStockProducts } from "@/lib/actions/inventory";
import { LowStockButton } from "@/components/inventory/LowStockButton";

async function getStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [inStock, stockValue, soldToday, pendingClaims, totalRevenue, unsettledInvoices] = await Promise.all([
    prisma.inventoryUnit.count({ where: { status: "IN_STOCK" } }),
    prisma.inventoryUnit.aggregate({ _sum: { costPrice: true }, where: { status: "IN_STOCK" } }),
    prisma.invoice.count({ where: { date: { gte: startOfDay } } }),
    prisma.warrantyClaim.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { date: { gte: startOfDay } } }),
    prisma.invoice.findMany({ select: { totalAmount: true, amountPaid: true } }),
  ]);

  const outstandingCredit = unsettledInvoices.reduce(
    (sum, inv) => sum + Math.max(Number(inv.totalAmount) - Number(inv.amountPaid), 0),
    0
  );

  return {
    inStock,
    stockValue: stockValue._sum.costPrice ?? 0,
    soldToday,
    pendingClaims,
    revenueToday: totalRevenue._sum.totalAmount ?? 0,
    outstandingCredit,
  };
}

export default async function DashboardPage() {
  const [stats, lowStockProducts] = await Promise.all([getStats(), getLowStockProducts()]);

  const cards = [
    { label: "Units in stock", value: stats.inStock },
    { label: "Stock value", value: `Rs. ${Number(stats.stockValue).toFixed(2)}` },
    { label: "Invoices today", value: stats.soldToday },
    { label: "Revenue today", value: `Rs. ${Number(stats.revenueToday).toFixed(2)}` },
    { label: "Pending warranty claims", value: stats.pendingClaims },
    { label: "Outstanding credit", value: `Rs. ${Number(stats.outstandingCredit).toFixed(2)}` },
    { label: "Low stock items", value: lowStockProducts.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <LowStockButton items={lowStockProducts} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
            <p className="text-xs text-black/50 dark:text-white/50">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
