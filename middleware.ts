import { NextRequest, NextResponse } from "next/server";

// 로그인 없이 접근 가능한 경로
const PUBLIC = ["/login", "/article", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 공개 경로는 통과
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 인증 쿠키 확인
  const auth = req.cookies.get("namucard_auth");
  if (auth?.value === "ok") return NextResponse.next();

  // 미인증 → 로그인 페이지로
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
