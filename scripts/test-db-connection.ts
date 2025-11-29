import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function testDatabase() {
    console.log('🔍 Testing Database Connection...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    try {
        console.log('\n📊 Attempting to query database...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query successful!');
        console.log('Result:', result);

        console.log('\n👥 Counting users...');
        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users in database`);

        console.log('\n✅ Database connection is working!');
    } catch (error) {
        console.error('\n❌ Database connection failed!');
        console.error('Error:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();
