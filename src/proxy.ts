import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth checks temporarily disabled for development.
// Re-enable by restoring the original auth() middleware logic.
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/app/:path*',
    '/api/admin/:path*',
    '/api/customer/:path*',
  ],
};
