import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import readline from "readline";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");
        const skip = parseInt(searchParams.get("skip") || "0");
        const secret = searchParams.get("secret");

        if (secret !== "b2b_secret_onboard_2024") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const CSV_PATH = path.join(process.cwd(), "firts useres db.csv");
        const DEFAULT_PASSWORD = "B2BChat2024!";
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // 1. Ensure Admin User exists
        let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (!admin) {
            admin = await prisma.user.create({
                data: {
                    name: "Admin B2BChat",
                    phone: "+570000000000",
                    email: "admin@b2bchat.io",
                    passwordHash,
                    role: "ADMIN",
                    creditBalance: 999999
                }
            });
        }

        const fileStream = fs.createReadStream(CSV_PATH);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let count = 0;
        let lineIndex = 0;
        const results = [];

        for await (const line of rl) {
            lineIndex++;
            if (lineIndex === 1 || !line.trim() || !line.includes("@")) continue; // Skip header

            // Handle skip and limit
            if (lineIndex <= skip + 1) continue;
            if (count >= limit) break;

            const email = line.trim().toLowerCase();
            const nameBase = email.split("@")[0].replace(/[._]/g, " ");
            const capitalizedName = nameBase.charAt(0).toUpperCase() + nameBase.slice(1);
            const dummyPhone = `+import-${lineIndex.toString().padStart(6, "0")}`;

            try {
                // Check if user exists
                const existing = await prisma.user.findFirst({
                    where: { OR: [{ email }, { phone: dummyPhone }] }
                });

                if (existing) continue;

                // Create Company
                const company = await prisma.company.create({
                    data: {
                        name: `${capitalizedName} Solutions`,
                        isActivated: false,
                        publicInfo: {
                            industry: "General B2B",
                            email: email,
                            description: `Perfil empresarial para ${capitalizedName}`
                        }
                    }
                });

                // Create User
                const user = await prisma.user.create({
                    data: {
                        name: capitalizedName,
                        email: email,
                        phone: dummyPhone,
                        passwordHash,
                        companyId: company.id,
                        role: "USUARIO",
                        creditBalance: 20.0
                    }
                });

                // Create Welcome Conversation
                const conversation = await prisma.conversation.create({
                    data: {
                        type: 'DIRECT',
                        userAId: admin.id,
                        userBId: user.id
                    }
                });

                // Create Welcome Message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderUserId: admin.id,
                        text: `¡Hola ${capitalizedName}! 👋 Bienvenido a B2BChat. Tu perfil empresarial ya está listo. Hemos activado una campaña de prueba gratuita para ti.`
                    }
                });

                // Create Free Campaign
                const campaign = await prisma.adCampaign.create({
                    data: {
                        companyId: company.id,
                        userId: user.id,
                        name: "Campaña de Bienvenida",
                        objective: "REACH",
                        status: "ACTIVE",
                        industry: "General",
                        dailyBudget: 1.0,
                        durationDays: 30,
                        totalBudget: 30.0,
                        creativeType: "IMAGE"
                    }
                });

                // Create Ad Creative
                await prisma.adCreative.create({
                    data: {
                        campaignId: campaign.id,
                        title: "¡Impulsa tu negocio con B2BChat!",
                        description: "Conecta con empresas reales y cierra más negocios.",
                        approvalStatus: "APPROVED",
                        isActive: true
                    }
                });

                count++;
                results.push({ email, name: capitalizedName });

            } catch (err) {
                console.error(`Error onboarding ${email}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            onboarded: count,
            batch: results,
            total_lines_processed: lineIndex
        });

    } catch (error: any) {
        console.error("Critical onboarding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
