"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <p className="text-lg font-bold">Something went wrong</p>
      <p className="max-w-sm text-sm text-black/60 dark:text-white/60">
        An unexpected error occurred. You can try again, or go back and try a different action.
      </p>
      <div className="flex gap-2">
        <button onClick={reset} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-semibold text-black/70 dark:border-white/15 dark:text-white/70"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
