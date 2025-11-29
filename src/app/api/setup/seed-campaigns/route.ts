import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Find a user to assign campaigns to (preferably not admin)
        const user = await prisma.user.findFirst({
            where: { email: { not: "admin@b2bchat.com" } }
        });

        if (!user || !user.companyId) {
            return NextResponse.json({ error: "No suitable user found" }, { status: 400 });
        }

        const campaignsData = [
            {
                name: "Lanzamiento Verano 2024",
                objective: "AWARENESS",
                industry: "Retail",
                sector: "Moda",
                dailyBudget: 50,
                totalBudget: 500,
                creativeType: "IMAGE",
                description: "Descubre nuestra nueva colección de verano. Estilo y comodidad para tu empresa.",
                creativeUrl: "https://picsum.photos/seed/summer/800/600",
                mobileImageUrl: "https://picsum.photos/seed/summer-mobile/450/800"
            },
            {
                name: "Soluciones Tech B2B",
                objective: "LEADS",
                industry: "Tecnología",
                sector: "Software",
                dailyBudget: 100,
                totalBudget: 2000,
                creativeType: "VIDEO",
                description: "Optimiza tus procesos con nuestro software de gestión empresarial.",
                videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder video
                videoDuration: 10
            },
            {
                name: "Consultoría Estratégica",
                objective: "SALES",
                industry: "Servicios",
                sector: "Consultoría",
                dailyBudget: 75,
                totalBudget: 1500,
                creativeType: "IMAGE",
                description: "Lleva tu negocio al siguiente nivel con nuestros expertos.",
                creativeUrl: "https://picsum.photos/seed/consulting/800/600",
                mobileImageUrl: "https://picsum.photos/seed/consulting-mobile/450/800"
            }
        ];

        const createdCampaigns = [];

        for (const data of campaignsData) {
            const durationDays = Math.ceil(data.totalBudget / data.dailyBudget);

            const campaign = await prisma.adCampaign.create({
                data: {
                    userId: user.id,
                    companyId: user.companyId,
                    name: data.name,
                    objective: data.objective,
                    status: "PENDING",
                    industry: data.industry,
                    sector: data.sector,
                    dailyBudget: data.dailyBudget,
                    durationDays: durationDays,
                    totalBudget: data.totalBudget,
                    creativeType: data.creativeType,
                    creativeUrl: data.creativeType === 'IMAGE' ? data.creativeUrl : data.videoUrl,
                    creativeText: data.description,
                }
            });

            await prisma.adCreative.create({
                data: {
                    campaignId: campaign.id,
                    title: data.name,
                    description: data.description,
                    imageUrl: data.creativeType === 'IMAGE' ? data.creativeUrl : null,
                    videoUrl: data.creativeType === 'VIDEO' ? data.videoUrl : null,
                    videoDuration: data.videoDuration || null,
                    type: data.creativeType,
                    isActive: true,
                    approvalStatus: "PENDING",
                    displayOrder: 0,
                    rotationHours: 1
                }
            });

            createdCampaigns.push(campaign);
        }

        return NextResponse.json({
            success: true,
            message: "3 Test Campaigns Created",
            campaigns: createdCampaigns
        });

    } catch (error) {
        console.error("Error seeding campaigns:", error);
        return NextResponse.json({ error: "Failed to seed campaigns" }, { status: 500 });
    }
}
