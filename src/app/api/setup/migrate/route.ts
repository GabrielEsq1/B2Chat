import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Force Prisma to push schema changes
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "AdCreative" 
            ADD COLUMN IF NOT EXISTS "mobileImageUrl" TEXT,
            ADD COLUMN IF NOT EXISTS "format" TEXT,
            ADD COLUMN IF NOT EXISTS "ageRange" TEXT,
            ADD COLUMN IF NOT EXISTS "gender" TEXT,
            ADD COLUMN IF NOT EXISTS "location" TEXT;
        `);

        return NextResponse.json({
            success: true,
            message: "Schema updated successfully"
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
