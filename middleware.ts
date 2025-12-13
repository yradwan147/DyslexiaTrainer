import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect children trying to access admin routes
    if (path.startsWith('/admin') && token?.role === 'child') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect researchers trying to access child routes
    if (path.startsWith('/dashboard') && token?.role !== 'child') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (path === '/' || path === '/login') {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/session/:path*',
    '/admin/:path*',
  ],
};

