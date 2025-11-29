import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token y nueva contraseña son obligatorios' }, { status: 400 });
    }

    const reset = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!reset || reset.used || reset.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { used: true },
    });

    return NextResponse.json({ message: 'Contraseña actualizada' });
}
