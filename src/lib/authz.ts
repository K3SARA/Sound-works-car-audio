import { auth } from "@/lib/auth";

/**
 * Server actions can be invoked directly (by action id) regardless of which page
 * the client is currently on, so the pathname-based role gate in proxy.ts isn't
 * enough on its own — admin-only mutations must also check the session here.
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }
  return session;
}
