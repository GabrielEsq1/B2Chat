import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const industry = searchParams.get("industry");
        const city = searchParams.get("city");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: any = {};

        if (industry) {
            where.publicInfo = {
                path: ["industry"],
                equals: industry
            };
        }

        // Fetch available (non-activated) companies
        const companies = await prisma.company.findMany({
            where: {
                isActivated: false,
                ...where
            },
            take: limit,
            orderBy: {
                name: "asc"
            },
            select: {
                id: true,
                name: true,
                isActivated: true,
                publicInfo: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            companies: companies.map(company => ({
                id: company.id,
                name: company.name,
                isActivated: company.isActivated,
                industry: (company.publicInfo as any)?.industry || null,
                city: (company.publicInfo as any)?.city || null,
                website: (company.publicInfo as any)?.website || null,
                description: (company.publicInfo as any)?.description || null
            }))
        });

    } catch (error) {
        console.error("Error fetching featured companies:", error);
        return NextResponse.json(
            { error: "Error al cargar empresas" },
            { status: 500 }
        );
    }
}
