// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  const publicRoutes = [
    "/login",
    "/register",
    "/",
    "",
    "/confirm-email",
    "/forgot-password",
  ];

  if (publicRoutes.includes(pathname) && !authToken) {
    return NextResponse.next();
  }

  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const { payload } = await jwtVerify(authToken, getJwtSecretKey());
    const roleClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Normalize roles into an array
    const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];

    // Check for multi-role user
    const isAdmin = roles.includes("Admin");
    const isCustomer =
      roles.includes("Customer") ||
      roles.includes("User") ||
      roles.includes("Member");

    // NEW LOGIC: Check for multi-role user on public routes
    if (isAdmin && isCustomer && publicRoutes.includes(pathname)) {
      // If user has both roles and is on a public page, send them to the selection screen
      return NextResponse.redirect(new URL("/select-role", request.url));
    }

    // Prevent access to select-role page if user doesn't have multiple roles
    if (pathname === "/select-role" && !(isAdmin && isCustomer)) {
      // Redirect based on their single role
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/", request.url));
      }
    }

    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }

    if (publicRoutes.includes(pathname)) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
