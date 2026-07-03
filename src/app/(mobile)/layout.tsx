import { auth, signOut } from "@/lib/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { BUSINESS } from "@/lib/business";

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
        <div>
          <p className="text-sm font-bold leading-tight">{BUSINESS.name}</p>
          <p className="text-[11px] text-black/50 dark:text-white/50">{session?.user?.name}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-xs font-medium text-red-600">Sign out</button>
        </form>
      </header>

      <main className="flex-1 overflow-y-auto p-4">{children}</main>

      <MobileNav />
      <Footer />
    </div>
  );
}
