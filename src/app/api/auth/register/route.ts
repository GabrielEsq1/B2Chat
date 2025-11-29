import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { name, email, phone, password, companyName } = await request.json();

        // Validate required fields (email is now optional)
        if (!name || !phone || !password) {
            return NextResponse.json(
                { success: false, error: "Nombre, teléfono y contraseña son requeridos" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const whereClause: any = { phone };
        if (email) {
            whereClause.OR = [{ phone }, { email }];
        }

        const existingUser = await prisma.user.findFirst({
            where: whereClause
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "El teléfono o email ya está registrado" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create company if provided
        let company = null;
        if (companyName) {
            company = await prisma.company.create({
                data: {
                    name: companyName,
                }
            });
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: email || null, // Handle empty string as null
                phone,
                passwordHash,
                role: "USUARIO",
                companyId: company?.id,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Usuario creado exitosamente",
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
            }
        });
    } catch (error: any) {
        console.error("Error creating user:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });

        // Provide specific error messages
        let errorMessage = "Error al crear el usuario";
        if (error.code === 'P2002') {
            errorMessage = "El email o teléfono ya está registrado";
        } else if (error.code === 'P2003') {
            errorMessage = "Error de base de datos. Por favor intenta nuevamente.";
        }

        return NextResponse.json(
            { success: false, error: errorMessage, details: error.message },
            { status: 500 }
        );
    }
}
