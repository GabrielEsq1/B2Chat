import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Force load .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

async function seedAds() {
    console.log('🚀 Seeding Test Ads...\n');

    try {
        // 1. Create an Advertiser User
        const advertiserEmail = 'advertiser@test.com';
        let advertiser = await prisma.user.findUnique({ where: { email: advertiserEmail } });

        if (!advertiser) {
            try {
                advertiser = await prisma.user.create({
                    data: {
                        email: advertiserEmail,
                        name: 'Tech Solutions Inc.',
                        passwordHash: 'password123',
                        role: 'USUARIO',
                        industry: 'Technology',
                        phone: '+1999888777', // Unique phone for advertiser
                        company: {
                            create: {
                                name: 'Tech Solutions Inc.',
                                taxId: '900123456'
                            }
                        }
                    }
                });
                console.log('✅ Created advertiser:', advertiser.name);
            } catch (e) {
                console.log('ℹ️ Advertiser creation failed (likely exists), fetching again...');
                advertiser = await prisma.user.findUnique({ where: { email: advertiserEmail } });
            }
        } else {
            console.log('✅ Found advertiser:', advertiser.name);
        }

        if (!advertiser) throw new Error("Could not create or find advertiser user.");

        // 2. Create a Campaign
        let campaign = await prisma.adCampaign.findFirst({
            where: { userId: advertiser.id, name: 'Summer Tech Sale' }
        });

        if (!campaign) {
            campaign = await prisma.adCampaign.create({
                data: {
                    userId: advertiser.id,
                    companyId: advertiser.companyId || 'default-company-id', // Ensure companyId exists or handle it
                    name: 'Summer Tech Sale',
                    objective: 'TRAFFIC',
                    status: 'ACTIVE',
                    dailyBudget: 100,
                    totalBudget: 3000,
                    durationDays: 30,
                    creativeType: 'IMAGE',
                    creativeUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
                    creativeText: 'Main Campaign Creative',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            });
            console.log('✅ Created campaign:', campaign.name);
        } else {
            console.log('✅ Found campaign:', campaign.name);
        }

        // 3. Create Ads
        const adsData = [
            {
                title: 'Cloud Hosting Promo',
                description: 'Get 50% off your first month of cloud hosting. Reliable, fast, and secure.',
                imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
                destinationUrl: 'https://vercel.com',
                ctaLabel: 'Sign Up Now',
                isActive: true,
                type: 'IMAGE'
            },
            {
                title: 'B2B CRM Software',
                description: 'Boost your sales team productivity with our AI-powered CRM.',
                imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
                destinationUrl: 'https://salesforce.com',
                ctaLabel: 'Free Trial',
                isActive: true,
                type: 'IMAGE'
            },
            {
                title: 'Office Furniture',
                description: 'Ergonomic chairs and desks for your modern office.',
                imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                destinationUrl: 'https://ikea.com',
                ctaLabel: 'Shop Now',
                isActive: true,
                type: 'IMAGE'
            }
        ];

        for (const adData of adsData) {
            const existingAd = await prisma.adCreative.findFirst({
                where: { campaignId: campaign.id, title: adData.title }
            });

            if (!existingAd) {
                await prisma.adCreative.create({
                    data: {
                        campaignId: campaign.id,
                        ...adData
                    }
                });
                console.log(`✅ Created ad: ${adData.title}`);
            } else {
                console.log(`ℹ️ Ad already exists: ${adData.title}`);
            }
        }

        console.log('\n✨ Ads seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Seeding Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAds();
