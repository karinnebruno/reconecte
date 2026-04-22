import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /dashboard é protegido — auth verificada client-side no layout
  // Aqui apenas garantimos que /dashboard/* nunca sirva sem cookie de sessão Supabase
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const hasCookie =
      request.cookies.has("sb-access-token") ||
      request.cookies.has("sb-refresh-token") ||
      [...request.cookies.getAll()].some(c => c.name.startsWith("sb-"));

    if (!hasCookie) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
