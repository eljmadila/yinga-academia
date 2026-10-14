import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth checks for login/register routes
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return intlMiddleware(request);
  }

  // Get auth cookies
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  // Protect student routes
  if (pathname.includes('/student')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role === 'instructor') {
      return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
    }
  }
  
  // Protect instructor routes
  if (pathname.includes('/instructor')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'instructor') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // Fallback to next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
};
