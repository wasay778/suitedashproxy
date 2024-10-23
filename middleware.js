import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Allow your domain to embed in iframes
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // or 'ALLOW-FROM https://hatzsdetailing.com' if necessary
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://hatzsdetailing.com"); // Allow your domain

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://hatzsdetailing.com'); // Restrict to your domain
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  return response;
}

// Configure which routes middleware will run on
export const config = {
  matcher: [
    '/api/proxy/:path*', // Apply only to your proxy route
  ],
};
