import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const roleRouteMap: Record<string, string[]> = {
  SUPER_ADMIN: ["/admin", "/manager", "/parking"],
  MANAGER: ["/manager", "/parking"],
  RESIDENT: ["/parking"],
};

const roleDashboardMap: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  MANAGER: "/manager",
  RESIDENT: "/parking",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/activate") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    // Redirect authenticated users from login to their dashboard
    if (pathname === "/login" && session?.user) {
      const role = (session.user as Record<string, unknown>).role as string;
      const dashboard = roleDashboardMap[role] || "/parking";
      return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // Redirect root to login or dashboard
    if (pathname === "/") {
      if (session?.user) {
        const role = (session.user as Record<string, unknown>).role as string;
        const dashboard = roleDashboardMap[role] || "/parking";
        return NextResponse.redirect(new URL(dashboard, req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access control
  const role = (session.user as Record<string, unknown>).role as string;
  const allowedRoutes = roleRouteMap[role] || [];
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!hasAccess) {
    const dashboard = roleDashboardMap[role] || "/parking";
    return NextResponse.redirect(new URL(dashboard, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
