import { NextResponse } from "next/server";

/**
 * Protects /staff/* routes server-side by reading the `token` cookie
 * (set by setToken() in src/lib/auth.js alongside localStorage).
 *
 * This is a structural guard — the real security lives on the backend
 * (JWT verification + role middleware on every protected API route).
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("role", "staff");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Decode without verification — signature is verified by the backend on
    // every actual API call. Here we only check role for the redirect UX.
    const payload = JSON.parse(atob(token.split(".")[1]));

    const expired = payload.exp && payload.exp * 1000 < Date.now();
    if (expired || payload.role !== "staff") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "staff");
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("role", "staff");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
