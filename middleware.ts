// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // If logged in and trying to access guest routes
    if (token && (pathname === "/" || pathname === "/about")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If not logged in and trying to access protected routes
    if (!token && pathname.startsWith("/dashboard") && pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the above middleware handle the logic
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
