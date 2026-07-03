import { auth, signOut } from "@/lib/auth";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Footer } from "@/components/layout/Footer";

export default async function DesktopLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-black/10 bg-white px-6 py-3 dark:border-white/10 dark:bg-black">
          <span className="text-sm text-black/60 dark:text-white/60">{session?.user?.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-sm font-medium text-red-600">Sign out</button>
          </form>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-950">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
