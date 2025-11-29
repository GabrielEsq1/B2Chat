import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Allow seed endpoint without auth for initial setup
    if (request.nextUrl.pathname === "/api/setup/seed" || request.nextUrl.pathname === "/api/setup/seed-campaigns") {
        return NextResponse.next();
    }

    // Add other middleware logic here
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/setup (setup routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/setup|_next/static|_next/image|favicon.ico).*)",
    ],
};
