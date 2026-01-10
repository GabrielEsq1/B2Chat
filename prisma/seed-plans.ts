
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Plans...');

    const plans = [
        {
            code: 'FREE',
            name: 'Plan Gratuito',
            description: 'Ideal para probar la plataforma.',
            priceMonthly: 0,
            currency: 'USD',
            maxUsers: 1,
            canUseAI: false,
            canUseWhatsApp: false,
            whatsappLimit: 0,
            historyDays: 30
        },
        {
            code: 'STARTER',
            name: 'Plan Starter',
            description: 'Para pequeños equipos que quieren vender más.',
            priceMonthly: 29,
            currency: 'USD',
            maxUsers: 3,
            canUseAI: true,
            canUseWhatsApp: false, // WhatsApp via Add-on only
            whatsappLimit: 0,
            historyDays: null // Infinite
        },
        {
            code: 'PRO',
            name: 'Plan Pro',
            description: 'Automatización y escala para equipos de ventas.',
            priceMonthly: 99,
            currency: 'USD',
            maxUsers: 10,
            canUseAI: true,
            canUseWhatsApp: true,
            whatsappLimit: 300,
            historyDays: null
        },
        {
            code: 'ENTERPRISE',
            name: 'Plan Enterprise',
            description: 'Control total y soporte dedicado.',
            priceMonthly: 299,
            currency: 'USD',
            maxUsers: 9999,
            canUseAI: true,
            canUseWhatsApp: true,
            whatsappLimit: 1000,
            historyDays: null
        }
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { code: plan.code },
            update: plan,
            create: plan,
        });
        console.log(`✅ Plan ${plan.code} upserted.`);
    }

    console.log('🚀 Plans seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
