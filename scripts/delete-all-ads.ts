import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllAds() {
    try {
        console.log('🗑️  Eliminando todos los anuncios...');

        // Eliminar estadísticas de anuncios primero (por relaciones)
        const deletedStats = await prisma.adStats.deleteMany({});
        console.log(`✅ Eliminadas ${deletedStats.count} estadísticas de anuncios`);

        // Eliminar creativos de anuncios
        const deletedCreatives = await prisma.adCreative.deleteMany({});
        console.log(`✅ Eliminados ${deletedCreatives.count} creativos de anuncios`);

        // Eliminar campañas de anuncios
        const deletedCampaigns = await prisma.adCampaign.deleteMany({});
        console.log(`✅ Eliminadas ${deletedCampaigns.count} campañas de anuncios`);

        console.log('\n✨ Todos los anuncios han sido eliminados exitosamente');

    } catch (error) {
        console.error('❌ Error al eliminar anuncios:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllAds()
    .then(() => {
        console.log('✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script falló:', error);
        process.exit(1);
    });
