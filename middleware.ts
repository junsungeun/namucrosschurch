import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/editor", "/done", "/archive", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const auth = req.cookies.get("namucard_auth");
  if (auth?.value === "ok") return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/editor/:path*", "/done/:path*", "/archive/:path*", "/admin/:path*"],
};
