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
        const query = searchParams.get("q") || "";
        const industry = searchParams.get("industry") || "";
        const sector = searchParams.get("sector") || "";
        const limit = parseInt(searchParams.get("limit") || "50");

        // Build where clause - search by company name OR user name
        const where: any = {};

        if (query) {
            where.OR = [
                {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    }
                },
                {
                    users: {
                        some: {
                            name: {
                                contains: query,
                                mode: "insensitive"
                            }
                        }
                    }
                }
            ];
        }

        console.log('🔍 Searching companies with query:', query);

        // Search companies
        const companies = await prisma.company.findMany({
            where,
            take: limit,
            include: {
                users: {
                    take: 1,
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        position: true,
                        industry: true,
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        console.log(`✅ Found ${companies.length} companies`);

        // Filter by industry/sector if provided (from user data)
        let filteredCompanies = companies;
        if (industry || sector) {
            filteredCompanies = companies.filter(company => {
                const user = company.users[0];
                if (!user) return false;

                const matchesIndustry = !industry || user.industry?.toLowerCase().includes(industry.toLowerCase());
                return matchesIndustry;
            });
        }

        return NextResponse.json({
            companies: filteredCompanies,
            total: filteredCompanies.length
        });
    } catch (error) {
        console.error("Error searching companies:", error);
        return NextResponse.json(
            { error: "Error al buscar empresas" },
            { status: 500 }
        );
    }
}
