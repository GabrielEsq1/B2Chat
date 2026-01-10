
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const targetPlanCode = args[1] || 'PRO';

    if (!email) {
        console.error('❌ Por favor proporciona el email del usuario Admin de la organización.');
        console.log('Uso: npx ts-node scripts/promote-org.ts <email> [PLAN_CODE]');
        console.log('Plan Codes: FREE, STARTER, PRO, ENTERPRISE');
        process.exit(1);
    }

    console.log(`🔍 Buscando usuario: ${email}...`);

    const user = await prisma.user.findFirst({
        where: { email },
        include: { company: { include: { subscription: true } } }
    });

    if (!user) {
        console.error('❌ Usuario no encontrado.');
        process.exit(1);
    }

    if (!user.company) {
        console.error('❌ El usuario no tiene una compañía asociada.');
        process.exit(1);
    }

    console.log(`🏢 Organización encontrada: ${user.company.name} (ID: ${user.company.id})`);
    console.log(`📋 Plan Actual: ${user.company.subscription?.planId || 'Ninguno'}`);

    // Find target plan
    const plan = await prisma.plan.findUnique({
        where: { code: targetPlanCode }
    });

    if (!plan) {
        console.error(`❌ Plan ${targetPlanCode} no encontrado en la base de datos.`);
        process.exit(1);
    }

    // Update Subscription
    await prisma.subscription.update({
        where: { companyId: user.company.id },
        data: {
            planId: plan.id,
            status: 'ACTIVE',
            updatedAt: new Date()
        }
    });

    console.log(`✅ ¡ÉXITO! La organización ha sido actualizada al plan ${targetPlanCode}.`);
    console.log(`   - Nuevos límites: Usuarios=${plan.maxUsers}, WhatsApp=${plan.canUseWhatsApp ? 'Si' : 'No'}, IA=${plan.canUseAI ? 'Si' : 'No'}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
