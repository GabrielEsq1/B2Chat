
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { externalId, source, name, email, phone, address, industry, website, enrichmentData } = body;

        console.log('[PROVISIONAL] Creating/Fetching provisional company:', { externalId, name });

        if (!externalId || !name) {
            return NextResponse.json({ error: 'External ID and Name are required' }, { status: 400 });
        }

        // Check if company already exists by externalId
        const existingCompany = await prisma.company.findUnique({
            where: {
                externalId: externalId
            },
            include: {
                users: true
            }
        });

        if (existingCompany) {
            console.log('[PROVISIONAL] Found existing company:', existingCompany.id);
            // If it exists, return the first associated user (the "admin ghost")
            if (existingCompany.users.length > 0) {
                return NextResponse.json({
                    success: true,
                    companyId: existingCompany.id,
                    userId: existingCompany.users[0].id,
                    isNew: false
                });
            }
            // If company exists but no user (should rare), create user below
        }

        // Create new provisional company
        // Transaction to ensure company and ghost user are created together
        const result = await prisma.$transaction(async (tx) => {
            const newCompany = await tx.company.create({
                data: {
                    name: name,
                    isProvisional: true,
                    externalSource: source,
                    externalId: externalId,
                    enrichmentData: enrichmentData || {},
                    invitationsSent: 0,
                    publicInfo: {
                        address: address,
                        website: website,
                        industry: industry,
                        phone: phone
                    }
                }
            });

            // Create Ghost User
            // We need a unique phone and email for constraints.
            // For ghosts, we can generate a placeholder if real one not provided.
            // Using a prefix like 'ghost_{externalId}' for uniqueness.

            const ghostPhone = phone ? `ghost_${phone.replace(/\D/g, '')}` : `ghost_phone_${externalId}`;
            const uniqueEmail = email || `ghost+${externalId}@b2bchat.provisional`;

            const ghostUser = await tx.user.create({
                data: {
                    name: name, // The user usually represents the company for ghosts
                    email: uniqueEmail,
                    phone: ghostPhone,
                    passwordHash: randomBytes(16).toString('hex'), // Random password, they can't login
                    companyId: newCompany.id,
                    isGhost: true,
                    ghostEmail: email, // Store the REAL email if we have it
                    role: 'ADMIN',
                    profilePicture: enrichmentData?.logo || null,
                    industry: industry,
                    position: 'Representante'
                }
            });

            return { company: newCompany, user: ghostUser };
        });

        console.log('[PROVISIONAL] Created new provisional entity:', result.company.id, result.user.id);

        return NextResponse.json({
            success: true,
            companyId: result.company.id,
            userId: result.user.id,
            isNew: true
        });

    } catch (error) {
        console.error('Error creating provisional company:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
