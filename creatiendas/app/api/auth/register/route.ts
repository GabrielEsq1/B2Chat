
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Esquema de validación de los datos de registro
const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }
        const { name, email, password } = result.data;

        // Verificar si el email ya está registrado
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
        }

        // Generar hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 12);

        // Crear el nuevo usuario
        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (e: any) {
        console.error("Error en registro:", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
        }
        // Return actual error for debugging
        const dbUrl = process.env.DATABASE_URL || "NOT_SET";
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":***@");

        return NextResponse.json({
            error: `Error interno: ${e.message}`,
            details: e.toString(),
            dbUrl: maskedUrl
        }, { status: 500 });
    }
}
