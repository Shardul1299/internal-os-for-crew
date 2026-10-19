// Network boundary (Next.js 16 "proxy", formerly middleware). Only checks that a session
// cookie exists; role checks and scoping happen in layouts, queries and server actions.
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/signin", "/api/auth", "/api/inbox/inbound", "/_next", "/favicon", "/icon"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const hasSession = req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.search = pathname === "/" ? "" : `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|woff2?)$).*)"] };
