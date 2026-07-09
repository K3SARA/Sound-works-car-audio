import { auth, signOut } from "@/lib/auth";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { SidebarProvider } from "@/components/layout/SidebarProvider";
import { SidebarToggle } from "@/components/layout/SidebarToggle";
import { Footer } from "@/components/layout/Footer";

export async function DesktopShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <DesktopSidebar />

        <header className="no-print flex items-center justify-between gap-4 border-b border-black/10 bg-white px-6 py-3 dark:border-white/10 dark:bg-black">
          <SidebarToggle />
          <div className="flex items-center gap-4">
            <span className="text-sm text-black/60 dark:text-white/60">{session?.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm font-medium text-red-600">Sign out</button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-950 print:overflow-visible print:bg-white print:p-0">
          {children}
        </main>

        <Footer />
      </div>
    </SidebarProvider>
  );
}

