import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Verificar autenticación y rol de administrador
        if (!session?.user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'SUPERADMIN') {
            return NextResponse.json(
                { error: 'Se requieren permisos de SUPERADMIN' },
                { status: 403 }
            );
        }

        // Eliminar todas las estadísticas de anuncios primero (por relaciones)
        const deletedStats = await prisma.adStats.deleteMany({});

        // Eliminar todos los creativos de anuncios
        const deletedCreatives = await prisma.adCreative.deleteMany({});

        // Eliminar todas las campañas de anuncios
        const deletedCampaigns = await prisma.adCampaign.deleteMany({});

        return NextResponse.json({
            success: true,
            message: 'Todos los anuncios han sido eliminados',
            deleted: {
                stats: deletedStats.count,
                creatives: deletedCreatives.count,
                campaigns: deletedCampaigns.count
            }
        });

    } catch (error) {
        console.error('Error al eliminar anuncios:', error);
        return NextResponse.json(
            { error: 'Error al eliminar anuncios' },
            { status: 500 }
        );
    }
}
