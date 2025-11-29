import { prisma } from "../src/lib/prisma";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log("🌱 Seeding companies...");

    try {
        // Get some existing users to be company admins
        const users = await prisma.user.findMany({
            take: 5,
            where: { role: "ADMIN_EMPRESA" }
        });

        if (users.length === 0) {
            console.log("⚠️ No admin users found. Creating one...");
            const newAdmin = await prisma.user.create({
                data: {
                    name: "Admin Madoco",
                    email: "admin@madoco.com",
                    passwordHash: "test123", // hash it properly in real app
                    role: "ADMIN_EMPRESA",
                    industry: "Seguridad Industrial",
                    phone: "+573000000000"
                }
            });
            users.push(newAdmin);
        }

        const companiesData = [
            {
                name: "MADOCO XXI SAS BIC",
                description: "Expertos en ropa de seguridad industrial y dotaciones.",
                industry: "Textil",
                website: "https://madoco.com",
                phone: "+573001234567",
                adminEmail: users[0]?.email || "admin@madoco.com"
            },
            {
                name: "Tech Solutions Ltd",
                description: "Desarrollo de software y consultoría TI.",
                industry: "Tecnología",
                website: "https://techsolutions.com",
                phone: "+573009876543",
                adminEmail: users[1]?.email
            },
            {
                name: "Constructora Global",
                description: "Proyectos de infraestructura y vivienda.",
                industry: "Construcción",
                website: "https://globalconst.com",
                phone: "+573005551234",
                adminEmail: users[2]?.email
            }
        ];

        for (const companyData of companiesData) {
            if (!companyData.adminEmail) continue;

            const admin = await prisma.user.findUnique({
                where: { email: companyData.adminEmail }
            });

            if (admin) {
                // Check if company exists
                const existing = await prisma.company.findFirst({
                    where: { name: companyData.name }
                });

                if (!existing) {
                    await prisma.company.create({
                        data: {
                            name: companyData.name,
                            users: {
                                connect: { id: admin.id }
                            }
                        }
                    });
                    console.log(`✅ Created company: ${companyData.name}`);
                } else {
                    console.log(`ℹ️ Company already exists: ${companyData.name}`);
                }
            }
        }

        console.log("✅ Company seeding completed.");

    } catch (error) {
        console.error("❌ Error seeding companies:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
