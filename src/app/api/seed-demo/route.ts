import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const passwordHash = await bcrypt.hash('Test123!', 10);

        // Create companies
        const company1 = await prisma.company.create({
            data: {
                name: 'TechCorp Solutions',
                isActivated: false,
                publicInfo: {
                    industry: "Tecnología",
                    city: "Bogotá",
                    website: "https://techcorp.example.com",
                    email: "contacto@techcorp.co",
                    description: "Soluciones tecnológicas empresariales"
                }
            }
        });

        const company2 = await prisma.company.create({
            data: {
                name: 'InnovateTech Colombia',
                isActivated: false,
                publicInfo: {
                    industry: "Innovación",
                    city: "Medellín",
                    website: "https://innovatetech.example.com",
                    email: "info@innovatetech.co",
                    description: "Innovación tecnológica para empresas"
                }
            }
        });

        // Create users
        const user1 = await prisma.user.create({
            data: {
                name: 'Carlos Mendoza',
                phone: '+573001234567',
                email: 'carlos@techcorp.com',
                passwordHash,
                companyId: company1.id,
                role: 'USUARIO'
            }
        });

        const user2 = await prisma.user.create({
            data: {
                name: 'María Rodríguez',
                phone: '+573007654321',
                email: 'maria@innovatetech.co',
                passwordHash,
                companyId: company2.id,
                role: 'USUARIO'
            }
        });

        // Create some featured companies
        const companies = [
            { name: "Bancolombia", industry: "Banca y Finanzas", city: "Medellín" },
            { name: "Rappi", industry: "Tecnología", city: "Bogotá" },
            { name: "Grupo Éxito", industry: "Retail", city: "Medellín" }
        ];

        for (const compData of companies) {
            await prisma.company.create({
                data: {
                    name: compData.name,
                    isActivated: false,
                    publicInfo: {
                        industry: compData.industry,
                        city: compData.city,
                        website: `https://${compData.name.toLowerCase().replace(/\s/g, '')}.com`,
                        email: `contacto@${compData.name.toLowerCase().replace(/\s/g, '')}.co`,
                        description: `Empresa líder en ${compData.industry}`
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Demo data created successfully",
            users: [
                { name: user1.name, phone: user1.phone, company: company1.name },
                { name: user2.name, phone: user2.phone, company: company2.name }
            ],
            password: "Test123!"
        });

    } catch (error: any) {
        console.error("Error creating demo data:", error);
        return NextResponse.json({
            error: error.message || "Error creating demo data"
        }, { status: 500 });
    }
}
