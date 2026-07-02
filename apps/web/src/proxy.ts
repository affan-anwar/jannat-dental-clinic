import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPages = [
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('access_token')?.value;

  const isPublicPage = publicPages.includes(pathname);
  const isAuthApi = pathname.startsWith('/api/auth/');

  if (!token && !isPublicPage && !isAuthApi) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
