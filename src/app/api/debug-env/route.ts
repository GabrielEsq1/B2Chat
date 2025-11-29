import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV,
        HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    });
}
