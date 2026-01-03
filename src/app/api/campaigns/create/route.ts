import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/campaigns/create - Create new campaign
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const data = await req.json();

        // COMPREHENSIVE VALIDATION - All fields are required
        const requiredFields = [
            'name',
            'objective',
            'dailyBudget',
            'totalBudget',
            'creativeType',
            'industry',
            'sector'
        ];

        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: "Todos los campos son obligatorios",
                    missingFields,
                    message: `Faltan los siguientes campos: ${missingFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Validate creative URL (image or video required)
        if (!data.creativeUrl && !data.videoUrl) {
            return NextResponse.json(
                { error: "Debe proporcionar una imagen o video para la campaña" },
                { status: 400 }
            );
        }

        // Validate video duration if video type
        if (data.creativeType === 'VIDEO') {
            if (!data.videoUrl) {
                return NextResponse.json(
                    { error: "Debe proporcionar un video para campañas de tipo VIDEO" },
                    { status: 400 }
                );
            }

            if (!data.videoDuration || data.videoDuration > 20) {
                return NextResponse.json(
                    { error: "El video debe tener una duración máxima de 20 segundos" },
                    { status: 400 }
                );
            }
        }

        // Validate budget
        const dailyBudget = parseFloat(data.dailyBudget);
        const totalBudget = parseFloat(data.totalBudget);

        if (dailyBudget <= 0 || totalBudget <= 0) {
            return NextResponse.json(
                { error: "El presupuesto debe ser mayor a 0" },
                { status: 400 }
            );
        }

        if (totalBudget < dailyBudget) {
            return NextResponse.json(
                { error: "El presupuesto total debe ser mayor o igual al presupuesto diario" },
                { status: 400 }
            );
        }

        // Calculate duration from total budget and daily budget
        const durationDays = Math.ceil(totalBudget / dailyBudget);

        // Get user's company
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        });

        if (!user?.companyId) {
            return NextResponse.json(
                { error: "Usuario debe estar asociado a una empresa" },
                { status: 400 }
            );
        }

        // Create campaign with PENDING status for approval
        const campaign = await prisma.adCampaign.create({
            data: {
                userId: session.user.id,
                companyId: user.companyId,
                name: data.name,
                objective: data.objective,
                status: data.paymentProofUrl ? "PENDING_VERIFICATION" : "PENDING_PAYMENT",

                // Segmentation
                industry: data.industry,
                sector: data.sector,
                targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : null,

                // Budget & Payment
                dailyBudget: dailyBudget,
                durationDays: durationDays,
                totalBudget: totalBudget,
                paymentProofUrl: data.paymentProofUrl,
                paymentStatus: data.paymentProofUrl ? "VERIFICATION_PENDING" : "PENDING_PAYMENT",
                paymentMethod: "NEQUI", // Simplification for now

                creativeType: data.creativeType,
                creativeUrl: data.creativeUrl || data.videoUrl,
                creativeText: data.creativeText || data.description,
            },
        });

        // Create associated AdCreative
        await prisma.adCreative.create({
            data: {
                campaignId: campaign.id,
                title: data.name,
                description: data.description || data.creativeText || "",
                imageUrl: data.creativeType === 'IMAGE' ? data.creativeUrl : null,
                videoUrl: data.creativeType === 'VIDEO' ? data.videoUrl : null,
                // mobileImageUrl: data.mobileImageUrl || null, // NEW: Save mobile image
                videoDuration: data.videoDuration || null,
                ctaLabel: data.ctaLabel || "Ver Más",
                destinationUrl: data.destinationUrl || "",
                ageRange: data.ageRange || null,
                gender: data.gender || "ALL",
                location: data.location || null,
                type: data.creativeType,
                // Rotation defaults
                isActive: true,
                approvalStatus: "PENDING", // Pending approval
                displayOrder: 0,
                rotationHours: 1,
            },
        });

        return NextResponse.json({
            success: true,
            campaign,
            message: "Campaña creada exitosamente. Pendiente de aprobación."
        });
    } catch (error) {
        console.error("Error creating campaign:", error);
        return NextResponse.json(
            { error: "Error al crear la campaña" },
            { status: 500 }
        );
    }
}
