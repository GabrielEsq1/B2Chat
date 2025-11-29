import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script para crear/verificar el usuario bot de IA
 * Necesario para que el chat con IA funcione correctamente
 */
async function setupAIBot() {
    console.log('🤖 Configurando Bot de IA...\n');

    try {
        // Verificar si ya existe un bot de IA
        let aiBot = await prisma.user.findFirst({
            where: {
                isBot: true,
                botPersonality: 'assistant',
            },
        });

        if (aiBot) {
            console.log('✅ Bot de IA ya existe:');
            console.log(`   ID: ${aiBot.id}`);
            console.log(`   Nombre: ${aiBot.name}`);
            console.log(`   Teléfono: ${aiBot.phone}`);
            console.log(`   Email: ${aiBot.email}`);
        } else {
            // Crear el bot de IA
            console.log('📝 Creando nuevo Bot de IA...');

            const hashedPassword = await bcrypt.hash('ai-bot-password-2024', 10);

            aiBot = await prisma.user.create({
                data: {
                    name: 'Asistente IA',
                    phone: '+57-AI-BOT-001',
                    email: 'ai-bot@b2bchat.com',
                    passwordHash: hashedPassword,
                    role: 'USUARIO',
                    isBot: true,
                    botPersonality: 'assistant',
                    bio: 'Soy un asistente de IA diseñado para ayudarte con tus preguntas sobre B2BChat.',
                    avatar: '🤖',
                },
            });

            console.log('✅ Bot de IA creado exitosamente:');
            console.log(`   ID: ${aiBot.id}`);
            console.log(`   Nombre: ${aiBot.name}`);
            console.log(`   Teléfono: ${aiBot.phone}`);
            console.log(`   Email: ${aiBot.email}`);
        }

        console.log('\n✅ Configuración completada!');
        console.log('\n💡 Ahora puedes usar el chat con IA en tu aplicación.');

    } catch (error) {
        console.error('❌ Error configurando bot de IA:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
setupAIBot()
    .then(() => {
        console.log('\n🎉 Script finalizado exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script falló:', error);
        process.exit(1);
    });
