import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { searchYelpBusinesses } from '@/lib/apis/yelp';
import { searchGitHubOrganizations } from '@/lib/apis/github';
import { searchOpenCorporates } from '@/lib/apis/opencorporates';
import { searchCompaniesHouseUK } from '@/lib/apis/companies-house';

// Simulated external data sources
const SIMULATED_APOLLO_DATA = [
    { id: 'ext-apollo-1', name: 'TechCorp Solutions', industry: 'Tecnología', source: 'Apollo.io', phone: '+57 300 555 0001', email: 'contact@techcorp.co' },
    { id: 'ext-apollo-2', name: 'Innovate Labs', industry: 'Consultoría', source: 'Apollo.io', phone: '+57 300 555 0002', email: 'hello@innovatelabs.co' },
    { id: 'ext-apollo-3', name: 'Digital Marketing Pro', industry: 'Marketing', source: 'Apollo.io', phone: '+57 300 555 0003', email: 'info@dmkpro.co' }
];

const SIMULATED_HUNTER_DATA = [
    { id: 'ext-hunter-1', name: 'SaaS Ventures Inc', industry: 'Software', source: 'Hunter.io', email: 'sales@saasventures.com', domain: 'saasventures.com' },
    { id: 'ext-hunter-2', name: 'CloudTech Partners', industry: 'Cloud Services', source: 'Hunter.io', email: 'business@cloudtech.io', domain: 'cloudtech.io' }
];

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const industry = searchParams.get('industry') || '';

        // Search local database
        const localUsers = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: query } },
                            { phone: { contains: query } },
                            { industry: { contains: query } }
                        ]
                    },
                    industry ? { industry: { equals: industry } } : {}
                ]
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                industry: true,
                position: true,
                company: {
                    select: {
                        name: true
                    }
                }
            },
            take: 10
        });

        // Simulate external searches (Apollo, Hunter)
        const apolloResults = SIMULATED_APOLLO_DATA.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.industry.toLowerCase().includes(query.toLowerCase())
        );

        const hunterResults = SIMULATED_HUNTER_DATA.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.industry.toLowerCase().includes(query.toLowerCase())
        );

        // Real Google Places API search
        let googlePlacesResults: any[] = [];
        const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (GOOGLE_API_KEY && query) {
            try {
                const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=es&region=CO`;
                const placesRes = await fetch(placesUrl);
                const placesData = await placesRes.json();

                if (placesData.status === 'OK' && placesData.results) {
                    googlePlacesResults = placesData.results.slice(0, 5).map((place: any) => ({
                        id: `gmb-${place.place_id}`,
                        name: place.name,
                        industry: place.types?.[0]?.replace(/_/g, ' ') || 'N/A',
                        source: 'Google Places',
                        address: place.formatted_address,
                        isLocal: false,
                        rating: place.rating,
                        placeId: place.place_id
                    }));
                }
            } catch (error) {
                console.error('Google Places API error:', error);
            }
        }

        // Fetch from all new free APIs in parallel
        const [yelpResults, githubResults, openCorpResults, companiesHouseResults] = await Promise.all([
            searchYelpBusinesses(query, 'Colombia').catch(() => []),
            searchGitHubOrganizations(query).catch(() => []),
            searchOpenCorporates(query, 'co').catch(() => []),
            searchCompaniesHouseUK(query).catch(() => [])
        ]);

        // Format Yelp results
        const formattedYelp = yelpResults.map((business: any) => ({
            id: `yelp-${business.id}`,
            name: business.name,
            phone: business.phone,
            industry: business.categories?.[0]?.title || 'N/A',
            address: `${business.location.address1}, ${business.location.city}`,
            source: 'Yelp',
            rating: business.rating,
            isLocal: false
        }));

        // Format GitHub results
        const formattedGitHub = githubResults.map((org: any) => ({
            id: `github-${org.id}`,
            name: org.login,
            industry: 'Tecnología',
            source: 'GitHub',
            bio: org.description,
            website: org.blog,
            email: org.email,
            location: org.location,
            isLocal: false
        }));

        // Format OpenCorporates results
        const formattedOpenCorp = openCorpResults.map((company: any) => ({
            id: `opencorp-${company.company_number}`,
            name: company.name,
            industry: company.company_type || 'N/A',
            source: 'OpenCorporates',
            address: company.registered_address_in_full,
            registryUrl: company.registry_url,
            isLocal: false
        }));

        // Format Companies House UK results
        const formattedCompaniesHouse = companiesHouseResults.map((company: any) => ({
            id: `chuk-${company.company_number}`,
            name: company.company_name,
            industry: company.sic_codes?.[0] || 'N/A',
            source: 'Companies House UK',
            address: `${company.registered_office_address.address_line_1}, ${company.registered_office_address.locality}`,
            status: company.company_status,
            isLocal: false
        }));

        // Format local results
        const localResults = localUsers.map(user => ({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            industry: user.industry,
            position: user.position,
            company: user.company?.name,
            source: 'Local DB',
            isLocal: true
        }));

        const externalResults = [
            ...apolloResults.map(r => ({ ...r, isLocal: false })),
            ...hunterResults.map(r => ({ ...r, isLocal: false })),
            ...googlePlacesResults,
            ...formattedYelp,
            ...formattedGitHub,
            ...formattedOpenCorp,
            ...formattedCompaniesHouse
        ];

        return NextResponse.json({
            localResults,
            externalResults,
            totalLocal: localResults.length,
            totalExternal: externalResults.length
        });
    } catch (error) {
        console.error('Error in search API:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
