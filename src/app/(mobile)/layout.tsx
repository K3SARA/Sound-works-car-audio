import { headers } from "next/headers";
import { auth, signOut } from "@/lib/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { BUSINESS } from "@/lib/business";
import { DesktopShell } from "@/components/layout/DesktopShell";
import { detectDevice } from "@/lib/device";

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Admins browsing Billing/Stock Check from a desktop browser get the same
  // sidebar shell as the rest of the admin dashboard instead of the phone-style nav.
  if (session?.user?.role === "ADMIN") {
    const userAgent = (await headers()).get("user-agent");
    if (detectDevice(userAgent) === "desktop") {
      return <DesktopShell>{children}</DesktopShell>;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="no-print flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-auto" />
          <div>
            <p className="text-sm font-bold leading-tight">{BUSINESS.name}</p>
            <p className="text-[11px] text-black/50 dark:text-white/50">{session?.user?.name}</p>
          </div>
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

      <main className="flex-1 overflow-y-auto p-4 print:overflow-visible print:bg-white print:p-0">{children}</main>

      <MobileNav />
      <Footer />
    </div>
  );
}
