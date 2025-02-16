// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Guest-only routes (login, signup, etc.)
    const guestRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

    // Protected routes that require authentication
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/api/user");

    // If logged in and trying to access guest routes
    if (token && guestRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If not logged in and trying to access protected routes
    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes without authentication
        if (pathname === "/" || pathname === "/about") {
          return true;
        }

        // For protected routes, require token
        if (pathname.startsWith("/dashboard") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/api/user")) {
          return !!token;
        }

        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
