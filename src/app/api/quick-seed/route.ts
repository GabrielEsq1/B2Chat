import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                phone: '+573001234567',
                email: 'test@example.com',
                passwordHash,
                role: 'USUARIO'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'User created',
            user: { phone: user.phone, name: user.name }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
