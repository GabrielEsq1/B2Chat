import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserScore {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    company: string | null;
    messageCount: number;
    conversationCount: number;
    lastActive: Date;
    hasProfile: boolean;
    score: number;
}

async function analyzeTopUsers() {
    console.log('🔍 Analizando usuarios...\n');

    // Get all real users (not bots)
    const users = await prisma.user.findMany({
        where: {
            isBot: false,
            role: { not: 'ADMIN' }
        },
        include: {
            company: {
                select: {
                    name: true
                }
            },
            _count: {
                select: {
                    sentMessages: true,
                    conversationsAsA: true,
                    conversationsAsB: true,
                    campaigns: true
                }
            },
            sentMessages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            }
        }
    });

    console.log(`📊 Total usuarios encontrados: ${users.length}\n`);

    // Calculate scores
    const scoredUsers: UserScore[] = users.map(user => {
        let score = 0;

        // Activity score (40 points max)
        const messageCount = user._count.sentMessages;
        const conversationCount = user._count.conversationsAsA + user._count.conversationsAsB;
        score += Math.min(messageCount * 2, 20); // 20 pts max for messages
        score += Math.min(conversationCount * 2, 10); // 10 pts max for conversations

        // Days since last activity (10 pts max)
        const lastMessage = user.sentMessages[0]?.createdAt || user.createdAt;
        const daysSinceActive = Math.floor((Date.now() - lastMessage.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.max(10 - daysSinceActive, 0);

        // Business profile score (30 points max)
        if (user.company) score += 15;
        if (user.bio && user.position && user.industry) score += 10;
        if (user.profilePicture || user.avatar) score += 5;

        // Engagement score (30 points max)
        if (user._count.campaigns > 0) score += 15; // Has created campaigns
        if (user.email) score += 5; // Has email
        if (user.website) score += 5; // Has website
        if (conversationCount > 5) score += 5; // Very active in chat

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            company: user.company?.name || null,
            messageCount,
            conversationCount,
            lastActive: lastMessage,
            hasProfile: !!(user.bio && user.position),
            score
        };
    });

    // Sort by score descending
    const topUsers = scoredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 112);

    console.log('🏆 TOP 112 USUARIOS:\n');
    console.log('Rank | Score | Usuario | Empresa | Mensajes | Conversaciones');
    console.log('-----|-------|---------|---------|----------|---------------');

    topUsers.forEach((user, index) => {
        console.log(
            `${(index + 1).toString().padStart(4)} | ` +
            `${user.score.toString().padStart(5)} | ` +
            `${user.name.substring(0, 20).padEnd(20)} | ` +
            `${(user.company || '---').substring(0, 20).padEnd(20)} | ` +
            `${user.messageCount.toString().padStart(8)} | ` +
            `${user.conversationCount.toString().padStart(14)}`
        );
    });

    console.log('\n📈 ESTADÍSTICAS:');
    console.log(`- Score promedio: ${(topUsers.reduce((sum, u) => sum + u.score, 0) / 112).toFixed(2)}`);
    console.log(`- Con empresa: ${topUsers.filter(u => u.company).length}`);
    console.log(`- Con perfil completo: ${topUsers.filter(u => u.hasProfile).length}`);
    console.log(`- Mensajes totales: ${topUsers.reduce((sum, u) => sum + u.messageCount, 0)}`);

    // Export to CSV
    const csv = [
        'Rank,ID,Nombre,Email,Teléfono,Empresa,Score,Mensajes,Conversaciones,Última Actividad',
        ...topUsers.map((user, index) =>
            `${index + 1},"${user.id}","${user.name}","${user.email || ''}","${user.phone}","${user.company || ''}",${user.score},${user.messageCount},${user.conversationCount},"${user.lastActive.toISOString()}"`
        )
    ].join('\n');

    const fs = require('fs');
    const filename = `top-112-users-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csv);

    console.log(`\n✅ Exportado a: ${filename}`);

    await prisma.$disconnect();
}

analyzeTopUsers().catch(console.error);
