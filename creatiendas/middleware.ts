import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;

    // Extract subdomain from hostname
    // Examples: 
    // - tienda1.creatiendasgit1.vercel.app -> subdomain = "tienda1"
    // - creatiendasgit1.vercel.app -> subdomain = null
    // - localhost:3000 -> subdomain = null
    const parts = hostname.split('.');
    let subdomain: string | null = null;

    // Check if we have a subdomain (not www, not the main domain)
    if (hostname.includes('creatiendasgit1.vercel.app')) {
        // Production: tienda.creatiendasgit1.vercel.app
        if (parts.length >= 4 && parts[0] !== 'www' && parts[0] !== 'creatiendasgit1') {
            subdomain = parts[0];
        }
    } else if (hostname.includes('localhost')) {
        // Local development: tienda.localhost:3000
        if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== 'www') {
            subdomain = parts[0];
        }
    }

    // If we detected a subdomain, rewrite to the store page
    if (subdomain && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
        console.log(`[Middleware] Subdomain detected: ${subdomain}, rewriting to /stores/${subdomain}`);
        // Rewrite to the store page, preserving the original URL in the browser
        return NextResponse.rewrite(new URL(`/stores/${subdomain}${url.pathname}${url.search}`, request.url));
    }

    // Authentication check for protected routes
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log("Middleware Debug:");
    console.log("Path:", request.nextUrl.pathname);
    console.log("Token found:", !!token);
    console.log("Secret available:", !!process.env.NEXTAUTH_SECRET);

    const protectedRoutes = ['/dashboard', '/app/api/stores', '/app/api/stripe'];
    const isProtected = protectedRoutes.some((p) => request.nextUrl.pathname.startsWith(p));

    if (isProtected && !token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    // Match all routes except static files and API routes that don't need subdomain handling
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
