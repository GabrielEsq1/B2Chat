import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendMessageToGabriel() {
    // Find the conversation between Test Email Recipient and Test User
    const testEmailUser = await prisma.user.findUnique({
        where: { email: 'gabriel@b2bchat.co' }
    });

    const gabrielUser = await prisma.user.findUnique({
        where: { email: 'gabriel.esquivia@b2bchat.co' }
    });

    if (!testEmailUser || !gabrielUser) {
        console.log('❌ Users not found');
        return;
    }

    console.log(`📤 Enviando mensaje de "${testEmailUser.name}" a "${gabrielUser.name}"`);

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
        where: {
            OR: [
                { userAId: testEmailUser.id, userBId: gabrielUser.id },
                { userAId: gabrielUser.id, userBId: testEmailUser.id }
            ]
        }
    });

    if (!conversation) {
        console.log('Creating new conversation...');
        conversation = await prisma.conversation.create({
            data: {
                userAId: testEmailUser.id,
                userBId: gabrielUser.id
            }
        });
    }

    // Create message
    const message = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderUserId: testEmailUser.id,
            text: 'RESPUESTA AUTOMATICA: Este mensaje debe llegar a gabriel.esquivia@b2bchat.co con el boton HTTPS://B2BCHAT.CO/CHAT'
        }
    });

    console.log(`✅ Mensaje enviado!`);
    console.log(`   Conversación ID: ${conversation.id}`);
    console.log(`   Mensaje ID: ${message.id}`);
    console.log(`\n📧 AHORA DEBES RECIBIR UN EMAIL EN: gabriel.esquivia@b2bchat.co`);
    console.log(`   Con el botón que redirige a: https://b2bchat.co/chat`);
}

sendMessageToGabriel()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
