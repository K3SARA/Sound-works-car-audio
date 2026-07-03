import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { BUSINESS } from "@/lib/business";
import { Logo } from "@/components/layout/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl ?? "/",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=CredentialsSignin${callbackUrl ? `&callbackUrl=${callbackUrl}` : ""}`);
      }
      throw err;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-black">
        <Logo className="mx-auto h-16 w-auto" />
        <h1 className="mt-3 text-center text-lg font-bold">{BUSINESS.name}</h1>
        <p className="mt-1 text-center text-xs text-black/50 dark:text-white/50">Staff sign in</p>

        <form action={authenticate} className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-black/60 dark:text-white/60">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-black/60 dark:text-white/60">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
            />
          </div>

          {error && <p className="text-xs text-red-600">Invalid email or password.</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
