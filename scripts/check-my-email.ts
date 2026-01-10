import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentUser() {
    const user = await prisma.user.findFirst({
        where: {
            phone: '+573001234567' // El usuario con el que estás logueado
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true
        }
    });

    console.log('=== TU USUARIO ===');
    console.log(JSON.stringify(user, null, 2));

    if (!user?.email) {
        console.log('\n⚠️  Tu usuario NO tiene email configurado');
        console.log('📝 Te voy a agregar un email ahora...');

        const email = 'gabriel.esquivia@b2bchat.co'; // Tu email real

        await prisma.user.update({
            where: { id: user!.id },
            data: { email }
        });

        console.log(`✅ Email agregado: ${email}`);
    } else {
        console.log(`\n✅ Tu email: ${user.email}`);
    }
}

checkCurrentUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
