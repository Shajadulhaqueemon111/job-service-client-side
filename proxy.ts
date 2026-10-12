import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("sb_access_token")?.value;

  // Function to decode JWT payload without external heavy crypto in middleware/proxy
  const getPayload = (token: string) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const data = JSON.parse(jsonPayload);
      // Check expiration
      if (data.exp && data.exp * 1000 < Date.now()) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  };

  const payload = accessToken ? getPayload(accessToken) : null;

  // Protect Admin Pages & APIs
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!payload) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect Provider Dashboard
  if (pathname.startsWith("/provider")) {
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== "provider" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect Customer Dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already logged in, redirect /login or /register to their appropriate dashboard
  if ((pathname === "/login" || pathname === "/register") && payload) {
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (payload.role === "provider") {
      return NextResponse.redirect(new URL("/provider", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/provider/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
