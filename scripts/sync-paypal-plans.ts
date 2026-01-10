import { PrismaClient } from '@prisma/client';
import { createProduct, createPlan } from '../src/lib/paypal';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Syncing Plans with PayPal...');

    // 1. Create Product in PayPal (one for all subscriptions)
    console.log('Creating PayPal Product...');
    const product = await createProduct(
        'B2BChat Subscription Plans',
        'Monthly subscription plans for B2BChat platform'
    );

    console.log(`✅ Product Created: ${product.id}`);

    // 2. Create Plans in PayPal for each DB plan
    const plans = await prisma.plan.findMany({
        where: {
            code: {
                in: ['STARTER', 'PRO', 'ENTERPRISE'] // Skip FREE
            }
        }
    });

    for (const plan of plans) {
        if (plan.paypalPlanId) {
            console.log(`⏭️  ${plan.code} already has PayPal ID: ${plan.paypalPlanId}`);
            continue;
        }

        console.log(`Creating PayPal Plan for ${plan.code}...`);
        const paypalPlan = await createPlan(product.id, plan.name, plan.priceMonthly);

        if (paypalPlan.id) {
            await prisma.plan.update({
                where: { id: plan.id },
                data: { paypalPlanId: paypalPlan.id }
            });
            console.log(`✅ ${plan.code} synced with PayPal ID: ${paypalPlan.id}`);
        } else {
            console.error(`❌ Failed to create PayPal Plan for ${plan.code}:`, paypalPlan);
        }
    }

    console.log('🚀 PayPal Sync Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
