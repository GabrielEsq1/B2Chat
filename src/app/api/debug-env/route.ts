import { NextResponse } from "next/server";

export async function GET() {
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
    });
}
