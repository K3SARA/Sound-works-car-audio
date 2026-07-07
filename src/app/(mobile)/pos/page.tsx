import { CartPanel } from "@/components/pos/CartPanel";
import { getLowStockProducts } from "@/lib/actions/inventory";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";

export default async function PosPage() {
  const lowStockProducts = await getLowStockProducts();

  return (
    <div>
      <h1 className="mb-4 text-base font-bold">Billing</h1>
      <div className="mb-4">
        <LowStockAlert items={lowStockProducts} />
      </div>
      <CartPanel />
    </div>
  );
}
