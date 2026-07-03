import { redirect } from "next/navigation";

// Normally intercepted by proxy.ts before this ever renders.
export default function RootPage() {
  redirect("/login");
}
