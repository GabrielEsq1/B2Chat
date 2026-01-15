import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    let dbStatus = 'UNKNOWN';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'CONNECTED';
    } catch (e: any) {
        dbStatus = `ERROR: ${e.message}`;
        console.error("DB Connection Test Failed:", e);
    }

    return NextResponse.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV,
        HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        B2BCHAT_DB_PRIMARY_CONNSTRING_PROD: process.env.B2BCHAT_DB_PRIMARY_CONNSTRING_PROD ? 'SET' : 'MISSING',
        B2BCHAT_AUTH_SIGNING_SECRET_PROD: process.env.B2BCHAT_AUTH_SIGNING_SECRET_PROD ? 'SET' : 'MISSING',
        B2BCHAT_AUTH_APP_BASEURL_PROD: process.env.B2BCHAT_AUTH_APP_BASEURL_PROD,
        NEXT_PUBLIC_B2BCHAT_APP_BASEURL: process.env.NEXT_PUBLIC_B2BCHAT_APP_BASEURL,
        DB_CONNECTION_TEST: dbStatus,
    });
}
