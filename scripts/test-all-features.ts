import 'dotenv/config';
import { Role, FriendRequestStatus } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local', override: true });

import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🚀 Starting Comprehensive Feature Test...\n');

    try {
        // 1. Test Database Connection
        console.log('📊 1. Testing Database Connection...');
        const userCount = await prisma.user.count();
        console.log(`   ✅ Connected! User count: ${userCount}`);

        // 2. Setup Test Users
        console.log('\n👥 2. Setting up Test Users...');
        const adminEmail = `admin-test-${Date.now()}@example.com`;
        const userEmail = `user-test-${Date.now()}@example.com`;

        const admin = await prisma.user.create({
            data: {
                name: 'Test Admin',
                email: adminEmail,
                phone: `+1${Date.now()}`,
                passwordHash: 'hashed_password',
                role: Role.ADMIN_EMPRESA,
                isBot: false
            }
        });
        console.log(`   ✅ Created Admin: ${admin.name} (${admin.email})`);

        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: userEmail,
                phone: `+52${Date.now()}`,
                passwordHash: 'hashed_password',
                role: Role.USUARIO,
                isBot: false
            }
        });
        console.log(`   ✅ Created User: ${user.name} (${user.email})`);

        // 3. Test Campaigns (Ads Manager)
        console.log('\n📢 3. Testing Campaigns (Ads Manager)...');
        // Need a company for the admin to create a campaign
        const company = await prisma.company.create({
            data: {
                name: 'Test Company',
            }
        });

        // Link admin to company
        await prisma.user.update({
            where: { id: admin.id },
            data: { companyId: company.id }
        });

        const campaign = await prisma.adCampaign.create({
            data: {
                userId: admin.id,
                companyId: company.id,
                name: 'Test Campaign Summer',
                objective: 'TRAFFIC',
                status: 'ACTIVE',
                dailyBudget: 100,
                totalBudget: 1000,
                durationDays: 10,
                startDate: new Date(),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                creativeType: 'IMAGE',
                creativeUrl: 'https://example.com/image.jpg',
                creativeText: 'Best B2B Solutions',
                industry: 'Tech',
                sector: 'SaaS'
            }
        });
        console.log(`   ✅ Created AdCampaign: ${campaign.name} (ID: ${campaign.id})`);

        // Create AdCreative for the campaign
        const creative = await prisma.adCreative.create({
            data: {
                campaignId: campaign.id,
                title: 'Summer Sale',
                description: 'Get 50% off',
                imageUrl: 'https://example.com/image.jpg',
                ctaLabel: 'Shop Now',
                destinationUrl: 'https://example.com',
                type: 'IMAGE',
                approvalStatus: 'APPROVED'
            }
        });
        console.log(`   ✅ Created AdCreative: ${creative.title}`);

        // Verify Ad Fetching (Marketplace Logic)
        const ads = await prisma.adCampaign.findMany({
            where: { status: 'ACTIVE' },
            take: 5
        });
        console.log(`   ✅ Fetched ${ads.length} active campaigns from marketplace.`);

        // 4. Test Chat System
        console.log('\n💬 4. Testing Chat System...');

        // Create Conversation
        const conversation = await prisma.conversation.create({
            data: {
                type: 'USER_USER',
                userAId: admin.id,
                userBId: user.id
            }
        });
        console.log(`   ✅ Created Conversation: ${conversation.id}`);

        // Send Message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: admin.id,
                text: 'Hello, this is a test message from Admin!'
            }
        });
        console.log(`   ✅ Sent Message: "${message.text}"`);

        // Verify Message Receipt
        const messages = await prisma.message.findMany({
            where: { conversationId: conversation.id }
        });
        console.log(`   ✅ Verified Conversation has ${messages.length} message(s).`);

        // 5. Test Contacts
        console.log('\n📇 5. Testing Contacts...');
        // Simulate Friend Request
        const friendRequest = await prisma.friendRequest.create({
            data: {
                requesterId: user.id,
                receiverId: admin.id,
                status: FriendRequestStatus.PENDING
            }
        });
        console.log(`   ✅ Created Friend Request from ${user.name} to ${admin.name}`);

        // Accept Request
        await prisma.friendRequest.update({
            where: { id: friendRequest.id },
            data: { status: FriendRequestStatus.ACCEPTED }
        });
        console.log(`   ✅ Accepted Friend Request`);

        console.log('\n🎉 All features tested successfully via Prisma!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
