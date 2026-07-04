import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { detectDevice } from "@/lib/device";

// Next.js 16 renamed the `middleware` file convention to `proxy` — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md

const DESKTOP_ROUTES = ["/dashboard", "/inventory", "/suppliers", "/reports", "/warranty"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session) {
    if (pathname === "/login") return NextResponse.next();
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const device = detectDevice(req.headers.get("user-agent"));
  const role = session.user.role;
  const homeForUser = device === "mobile" || role === "SALES" ? "/pos" : "/dashboard";

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL(homeForUser, req.url));
  }

  // Sales/floor staff never get the admin dashboard, even if they open it on a desktop browser.
  if (role === "SALES" && DESKTOP_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
