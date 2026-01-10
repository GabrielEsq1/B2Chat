import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserEmail() {
    const user = await prisma.user.findFirst({
        where: { name: { contains: 'Pato', mode: 'insensitive' } },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isGhost: true,
            ghostEmail: true
        }
    });

    console.log('=== USER INFO ===');
    console.log(JSON.stringify(user, null, 2));

    if (!user) {
        console.log('\n❌ Usuario "Pato el Gato" no encontrado');
        return;
    }

    if (user.email || user.ghostEmail) {
        console.log('\n✅ Email configurado:', user.email || user.ghostEmail);
        console.log('💌 El sistema debió enviar un email de notificación');
    } else {
        console.log('\n⚠️  Este usuario NO tiene email configurado');
        console.log('📧 No se enviaron notificaciones por email');
    }
}

checkUserEmail()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
