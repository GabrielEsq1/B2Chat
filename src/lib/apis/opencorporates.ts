// OpenCorporates API Client
// Free tier: 500 calls/month

const OPENCORPORATES_API_KEY = process.env.B2BCHAT_EXT_OPENCORPORATES_KEY_PROD || process.env.OPENCORPORATES_API_KEY;
const OPENCORPORATES_BASE_URL = 'https://api.opencorporates.com/v0.4';

export interface OpenCorpCompany {
    company_number: string;
    name: string;
    jurisdiction_code: string;
    incorporation_date: string;
    company_type: string;
    registry_url: string;
    registered_address_in_full: string;
}

export async function searchOpenCorporates(query: string, jurisdiction: string = 'co'): Promise<OpenCorpCompany[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            jurisdiction_code: jurisdiction,
            per_page: '5'
        });

        if (OPENCORPORATES_API_KEY) {
            params.set('api_token', OPENCORPORATES_API_KEY);
        }

        const response = await fetch(`${OPENCORPORATES_BASE_URL}/companies/search?${params}`);

        if (!response.ok) {
            console.error('OpenCorporates API error:', response.status);
            return [];
        }

        const data = await response.json();
        return data.results?.companies?.map((item: any) => item.company) || [];
    } catch (error) {
        console.error('OpenCorporates search error:', error);
        return [];
    }
}
